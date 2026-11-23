import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const vendorId = searchParams.get("vendorId");
    const search = searchParams.get("search");

    const where: any = {};

    if (user && user.role === "VENDOR") {
      const vendor = await prisma.vendor.findFirst({ where: { userId: user.id } });
      if (vendor) {
        where.vendorId = vendor.id;
      }
    } else if (vendorId) {
      where.vendorId = vendorId;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { projectCode: { contains: search } },
        { location: { contains: search } },
        { projectType: { contains: search } },
      ];
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        vendor: { select: { id: true, companyName: true, contactPerson: true } },
        contractor: { select: { id: true, name: true, phone: true } },
        progressLogs: {
          take: 1,
          orderBy: { date: "desc" },
        },
        transactions: {
          select: { id: true, amount: true, type: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    const body = await req.json();

    if (!body.name || !body.location) {
      return NextResponse.json({ error: "Project name and location are required" }, { status: 400 });
    }

    const count = await prisma.project.count();
    const projectCode = `PRJ-2026-${(count + 1).toString().padStart(3, "0")}`;

    const project = await prisma.project.create({
      data: {
        projectCode,
        name: body.name,
        customerId: body.customerId || null,
        vendorId: body.vendorId || null,
        contractorId: body.contractorId || null,
        location: body.location,
        projectType: body.projectType || "Residential",
        budget: parseFloat(body.budget) || 0,
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        expectedCompletionDate: body.expectedCompletionDate ? new Date(body.expectedCompletionDate) : null,
        status: body.status || "STARTED",
        progressPercent: parseInt(body.progressPercent) || 0,
        description: body.description || null,
      },
    });

    await logAudit({
      userId: user?.id,
      action: "PROJECT_CREATED",
      entity: "PROJECT",
      entityId: project.id,
      details: `Project ${project.projectCode} (${project.name}) created.`,
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
