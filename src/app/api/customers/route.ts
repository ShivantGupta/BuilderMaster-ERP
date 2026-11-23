import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
        { city: { contains: search } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        projects: {
          select: { id: true, name: true, projectCode: true, status: true, budget: true },
        },
        transactions: {
          select: { id: true, transactionNumber: true, amount: true, type: true, createdAt: true },
        },
        leads: {
          select: { id: true, leadNumber: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(customers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    const body = await req.json();

    if (!body.name || !body.phone) {
      return NextResponse.json({ error: "Customer name and phone are required" }, { status: 400 });
    }

    const customer = await prisma.customer.create({
      data: {
        name: body.name,
        phone: body.phone,
        email: body.email || null,
        address: body.address || null,
        city: body.city || null,
        state: body.state || "Maharashtra",
        projectType: body.projectType || "Residential",
        propertyLocation: body.propertyLocation || null,
        budget: parseFloat(body.budget) || 0,
        requirement: body.requirement || null,
        status: body.status || "ACTIVE",
        notes: body.notes || null,
      },
    });

    await logAudit({
      userId: user?.id,
      action: "CUSTOMER_CREATED",
      entity: "CUSTOMER",
      entityId: customer.id,
      details: `Customer ${customer.name} created.`,
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
