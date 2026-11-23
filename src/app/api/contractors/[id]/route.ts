import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const contractor = await prisma.contractor.findUnique({
      where: { id: params.id },
      include: {
        projects: true,
        transactions: {
          orderBy: { createdAt: "desc" },
        },
        attendances: {
          orderBy: { date: "desc" },
          take: 30,
        },
      },
    });

    if (!contractor) {
      return NextResponse.json({ error: "Contractor not found" }, { status: 404 });
    }

    return NextResponse.json(contractor);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser(req);
    const body = await req.json();

    const updated = await prisma.contractor.update({
      where: { id: params.id },
      data: {
        name: body.name,
        companyName: body.companyName,
        phone: body.phone,
        email: body.email,
        specialization: body.specialization,
        labourCount: parseInt(body.labourCount) || 5,
        dailyRate: parseFloat(body.dailyRate) || 0,
        status: body.status,
        address: body.address,
        city: body.city,
        bankDetails: body.bankDetails,
      },
    });

    await logAudit({
      userId: user?.id,
      action: "CONTRACTOR_UPDATED",
      entity: "CONTRACTOR",
      entityId: updated.id,
      details: `Contractor ${updated.name} updated.`,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser(req);
    await prisma.contractor.update({
      where: { id: params.id },
      data: { status: "INACTIVE" },
    });

    await logAudit({
      userId: user?.id,
      action: "CONTRACTOR_DEACTIVATED",
      entity: "CONTRACTOR",
      entityId: params.id,
      details: `Contractor deactivated.`,
    });

    return NextResponse.json({ success: true, message: "Contractor deactivated" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
