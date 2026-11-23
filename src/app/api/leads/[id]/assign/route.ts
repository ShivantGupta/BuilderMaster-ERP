import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser(req);
    const body = await req.json();
    const { vendorId } = body;

    if (!vendorId) {
      return NextResponse.json({ error: "Vendor ID is required" }, { status: 400 });
    }

    const lead = await prisma.lead.findUnique({ where: { id: params.id } });
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.lead.update({
        where: { id: lead.id },
        data: {
          assignedVendorId: vendor.id,
          status: "ASSIGNED",
        },
      }),
      prisma.leadAssignment.create({
        data: {
          leadId: lead.id,
          vendorId: vendor.id,
          status: "PENDING",
        },
      }),
    ]);

    if (vendor.userId) {
      await prisma.notification.create({
        data: {
          userId: vendor.userId,
          title: `New Lead Assigned: ${lead.leadNumber}`,
          message: `Admin manually assigned lead ${lead.leadNumber} to your firm.`,
          type: "LEAD",
          link: "/vendor",
        },
      });
    }

    await logAudit({
      userId: user?.id,
      action: "LEAD_MANUALLY_ASSIGNED",
      entity: "LEAD",
      entityId: lead.id,
      details: `Lead ${lead.leadNumber} manually assigned to ${vendor.companyName}.`,
    });

    return NextResponse.json({ success: true, message: "Lead assigned to vendor" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
