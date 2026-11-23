import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { autoAssignLead } from "@/lib/lead-engine";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const vendorId = searchParams.get("vendorId");
    const search = searchParams.get("search");

    const where: any = {};

    // If user is a VENDOR, only show leads assigned to them!
    // "IMPORTANT: Do not distribute customer information to vendors who are not authorized to receive it."
    if (user && user.role === "VENDOR") {
      const vendor = await prisma.vendor.findFirst({
        where: { userId: user.id },
      });
      if (vendor) {
        where.assignedVendorId = vendor.id;
      } else {
        return NextResponse.json([]);
      }
    } else if (vendorId) {
      where.assignedVendorId = vendorId;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { leadNumber: { contains: search } },
        { customerName: { contains: search } },
        { phone: { contains: search } },
        { projectLocation: { contains: search } },
        { constructionType: { contains: search } },
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        assignedVendor: {
          select: { id: true, companyName: true, mobileNumber: true, email: true, rating: true },
        },
        assignments: {
          include: {
            vendor: { select: { companyName: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(leads);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    const body = await req.json();

    const count = await prisma.lead.count();
    const leadNumber = `LEAD-2026-${(count + 101).toString().padStart(4, "0")}`;

    const lead = await prisma.lead.create({
      data: {
        leadNumber,
        customerName: body.customerName,
        phone: body.phone,
        email: body.email || null,
        projectLocation: body.projectLocation,
        constructionType: body.constructionType,
        budget: parseFloat(body.budget) || 0,
        plotSize: body.plotSize || null,
        requirement: body.requirement || null,
        preferredContactTime: body.preferredContactTime || "Anytime",
        status: body.assignedVendorId ? "ASSIGNED" : "NEW",
        source: body.source || "ADMIN_CREATED",
        customerId: body.customerId || null,
        assignedVendorId: body.assignedVendorId || null,
      },
    });

    if (body.assignedVendorId) {
      await prisma.leadAssignment.create({
        data: {
          leadId: lead.id,
          vendorId: body.assignedVendorId,
          status: "PENDING",
        },
      });
    } else if (body.autoAssign !== false) {
      await autoAssignLead(lead.id);
    }

    await logAudit({
      userId: user?.id,
      action: "LEAD_CREATED",
      entity: "LEAD",
      entityId: lead.id,
      details: `Lead ${lead.leadNumber} created by admin.`,
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
