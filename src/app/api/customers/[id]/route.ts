import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        projects: {
          include: {
            vendor: { select: { companyName: true } },
            contractor: { select: { name: true } },
          },
        },
        transactions: {
          orderBy: { createdAt: "desc" },
          include: { account: true },
        },
        leads: {
          orderBy: { createdAt: "desc" },
          include: { assignedVendor: true },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser(req);
    const body = await req.json();

    const updated = await prisma.customer.update({
      where: { id: params.id },
      data: {
        name: body.name,
        phone: body.phone,
        email: body.email,
        address: body.address,
        city: body.city,
        state: body.state,
        projectType: body.projectType,
        propertyLocation: body.propertyLocation,
        budget: parseFloat(body.budget) || 0,
        requirement: body.requirement,
        status: body.status,
        notes: body.notes,
      },
    });

    await logAudit({
      userId: user?.id,
      action: "CUSTOMER_UPDATED",
      entity: "CUSTOMER",
      entityId: updated.id,
      details: `Customer ${updated.name} updated.`,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser(req);
    // Soft deactivate customer
    const deactivated = await prisma.customer.update({
      where: { id: params.id },
      data: { status: "INACTIVE" },
    });

    await logAudit({
      userId: user?.id,
      action: "CUSTOMER_DEACTIVATED",
      entity: "CUSTOMER",
      entityId: params.id,
      details: `Customer ${deactivated.name} deactivated.`,
    });

    return NextResponse.json({ success: true, message: "Customer deactivated" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
