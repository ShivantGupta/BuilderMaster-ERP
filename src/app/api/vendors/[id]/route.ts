import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: params.id },
      include: {
        documents: true,
        assignedLeads: {
          orderBy: { createdAt: "desc" },
        },
        projects: {
          include: { customer: true },
        },
        transactions: {
          orderBy: { createdAt: "desc" },
        },
        expenses: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    return NextResponse.json(vendor);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser(req);
    const body = await req.json();

    const updated = await prisma.vendor.update({
      where: { id: params.id },
      data: {
        vendorName: body.vendorName,
        companyName: body.companyName,
        contactPerson: body.contactPerson,
        mobileNumber: body.mobileNumber,
        email: body.email,
        address: body.address,
        city: body.city,
        serviceAreas: body.serviceAreas,
        specialization: body.specialization,
        gstNumber: body.gstNumber,
        panNumber: body.panNumber,
        bankName: body.bankName,
        accountNumber: body.accountNumber,
        ifscCode: body.ifscCode,
        status: body.status,
        rating: body.rating ? parseFloat(body.rating) : undefined,
        priority: body.priority ? parseInt(body.priority) : undefined,
        notes: body.notes,
      },
    });

    // Notify vendor if status changed to APPROVED
    if (body.status === "APPROVED" && updated.userId) {
      await prisma.notification.create({
        data: {
          userId: updated.userId,
          title: "Vendor Account Approved!",
          message: "Congratulations! Your BuildMaster ERP vendor partnership has been approved. You are now eligible for project lead distribution.",
          type: "SUCCESS",
          link: "/vendor",
        },
      });
    }

    await logAudit({
      userId: user?.id,
      action: "VENDOR_UPDATED",
      entity: "VENDOR",
      entityId: updated.id,
      details: `Vendor ${updated.companyName} updated (status: ${updated.status}).`,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser(req);
    const updated = await prisma.vendor.update({
      where: { id: params.id },
      data: { status: "SUSPENDED" },
    });

    await logAudit({
      userId: user?.id,
      action: "VENDOR_SUSPENDED",
      entity: "VENDOR",
      entityId: params.id,
      details: `Vendor suspended.`,
    });

    return NextResponse.json({ success: true, message: "Vendor suspended" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
