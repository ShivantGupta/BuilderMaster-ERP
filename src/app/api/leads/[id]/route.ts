import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        assignedVendor: true,
        assignments: {
          include: { vendor: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json(lead);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser(req);
    const body = await req.json();

    const currentLead = await prisma.lead.findUnique({ where: { id: params.id } });
    if (!currentLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const updated = await prisma.lead.update({
      where: { id: params.id },
      data: {
        customerName: body.customerName,
        phone: body.phone,
        email: body.email,
        projectLocation: body.projectLocation,
        constructionType: body.constructionType,
        budget: parseFloat(body.budget) || currentLead.budget,
        plotSize: body.plotSize,
        requirement: body.requirement,
        preferredContactTime: body.preferredContactTime,
        status: body.status || currentLead.status,
        rejectionReason: body.rejectionReason,
      },
    });

    await logAudit({
      userId: user?.id,
      action: "LEAD_UPDATED",
      entity: "LEAD",
      entityId: updated.id,
      details: `Lead ${updated.leadNumber} status changed to ${updated.status}.`,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser(req);
    await prisma.lead.delete({
      where: { id: params.id },
    });

    await logAudit({
      userId: user?.id,
      action: "LEAD_DELETED",
      entity: "LEAD",
      entityId: params.id,
      details: `Lead deleted.`,
    });

    return NextResponse.json({ success: true, message: "Lead removed" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
