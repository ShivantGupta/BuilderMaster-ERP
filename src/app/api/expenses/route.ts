import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const projectId = searchParams.get("projectId");
    const vendorId = searchParams.get("vendorId");

    const where: any = {};
    if (category && category !== "ALL") where.category = category;
    if (projectId) where.projectId = projectId;
    if (vendorId) where.vendorId = vendorId;

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        project: { select: { id: true, name: true, projectCode: true } },
        vendor: { select: { id: true, companyName: true } },
        contractor: { select: { id: true, name: true } },
      },
      orderBy: { date: "desc" },
    });

    const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

    const categoryBreakdown = expenses.reduce((acc: any, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    return NextResponse.json({
      expenses,
      summary: {
        totalAmount: totalExpenseAmount,
        totalCount: expenses.length,
        categoryBreakdown,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    const body = await req.json();

    const { category, amount, paymentMethod, projectId, vendorId, contractorId, description, billUrl, date } = body;

    if (!category || !amount || parseFloat(amount) <= 0) {
      return NextResponse.json({ error: "Category and valid amount are required" }, { status: 400 });
    }

    const count = await prisma.expense.count();
    const expenseNumber = `EXP-2026-${(count + 101).toString().padStart(4, "0")}`;

    const expense = await prisma.expense.create({
      data: {
        expenseNumber,
        category,
        amount: parseFloat(amount),
        paymentMethod: paymentMethod || "CASH",
        projectId: projectId || null,
        vendorId: vendorId || null,
        contractorId: contractorId || null,
        description: description || `Expense for ${category}`,
        billUrl: billUrl || null,
        date: date ? new Date(date) : new Date(),
        status: "APPROVED",
        createdById: user?.id || null,
      },
    });

    await logAudit({
      userId: user?.id,
      action: "EXPENSE_RECORDED",
      entity: "EXPENSE",
      entityId: expense.id,
      details: `Expense ${expense.expenseNumber} of ₹${expense.amount} under ${expense.category}`,
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
