import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { companyName: { contains: search } },
        { phone: { contains: search } },
        { specialization: { contains: search } },
        { city: { contains: search } },
      ];
    }

    const contractors = await prisma.contractor.findMany({
      where,
      include: {
        projects: {
          select: { id: true, name: true, projectCode: true, status: true },
        },
        transactions: {
          where: { type: "WITHDRAWAL" },
          select: { id: true, amount: true, status: true, createdAt: true },
        },
        attendances: {
          take: 7,
          orderBy: { date: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(contractors);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    const body = await req.json();

    if (!body.name || !body.phone) {
      return NextResponse.json({ error: "Name and phone number are required" }, { status: 400 });
    }

    const contractor = await prisma.contractor.create({
      data: {
        name: body.name,
        companyName: body.companyName || null,
        phone: body.phone,
        email: body.email || null,
        specialization: body.specialization || "Civil Masonry",
        labourCount: parseInt(body.labourCount) || 5,
        dailyRate: parseFloat(body.dailyRate) || 0,
        status: body.status || "ACTIVE",
        address: body.address || null,
        city: body.city || "Mumbai",
        bankDetails: body.bankDetails || null,
      },
    });

    await logAudit({
      userId: user?.id,
      action: "CONTRACTOR_CREATED",
      entity: "CONTRACTOR",
      entityId: contractor.id,
      details: `Contractor ${contractor.name} added.`,
    });

    return NextResponse.json(contractor, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
