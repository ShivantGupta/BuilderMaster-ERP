import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        vendor: true,
        contractor: true,
        progressLogs: {
          orderBy: { date: "desc" },
        },
        transactions: {
          include: { account: true, createdBy: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
        expenses: {
          orderBy: { createdAt: "desc" },
        },
        materialConsumptions: {
          include: { material: true },
          orderBy: { date: "desc" },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Financial summaries for this project
    const deposits = project.transactions
      .filter((t) => t.type === "DEPOSIT" && t.status === "APPROVED")
      .reduce((sum, t) => sum + t.amount, 0);

    const withdrawals = project.transactions
      .filter((t) => t.type === "WITHDRAWAL" && t.status === "APPROVED")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = project.expenses
      .filter((e) => e.status === "APPROVED")
      .reduce((sum, e) => sum + e.amount, 0);

    const financialSummary = {
      budget: project.budget,
      totalIncome: deposits,
      totalExpense: Math.max(withdrawals, totalExpense),
      netProfit: deposits - Math.max(withdrawals, totalExpense),
    };

    return NextResponse.json({ ...project, financialSummary });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser(req);
    const body = await req.json();

    const updated = await prisma.project.update({
      where: { id: params.id },
      data: {
        name: body.name,
        customerId: body.customerId || null,
        vendorId: body.vendorId || null,
        contractorId: body.contractorId || null,
        location: body.location,
        projectType: body.projectType,
        budget: parseFloat(body.budget) || undefined,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        expectedCompletionDate: body.expectedCompletionDate ? new Date(body.expectedCompletionDate) : undefined,
        actualCompletionDate: body.actualCompletionDate ? new Date(body.actualCompletionDate) : undefined,
        status: body.status,
        progressPercent: parseInt(body.progressPercent) || undefined,
        description: body.description,
      },
    });

    await logAudit({
      userId: user?.id,
      action: "PROJECT_UPDATED",
      entity: "PROJECT",
      entityId: updated.id,
      details: `Project ${updated.name} updated. Progress: ${updated.progressPercent}%, Status: ${updated.status}`,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser(req);
    await prisma.project.update({
      where: { id: params.id },
      data: { status: "CANCELLED" },
    });

    await logAudit({
      userId: user?.id,
      action: "PROJECT_CANCELLED",
      entity: "PROJECT",
      entityId: params.id,
      details: `Project cancelled.`,
    });

    return NextResponse.json({ success: true, message: "Project marked as cancelled" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
