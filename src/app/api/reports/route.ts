import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reportType = searchParams.get("type") || "daily_cash";
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const projectId = searchParams.get("projectId");
    const vendorId = searchParams.get("vendorId");

    const whereTxn: any = { status: "APPROVED" };
    if (projectId) whereTxn.projectId = projectId;
    if (vendorId) whereTxn.vendorId = vendorId;

    if (startDateParam && endDateParam) {
      whereTxn.createdAt = {
        gte: new Date(startDateParam),
        lte: new Date(new Date(endDateParam).setHours(23, 59, 59, 999)),
      };
    }

    if (reportType === "daily_cash") {
      const deposits = await prisma.transaction.findMany({
        where: { ...whereTxn, type: "DEPOSIT" },
        include: { account: true, customer: true, project: true },
        orderBy: { createdAt: "desc" },
      });

      const withdrawals = await prisma.transaction.findMany({
        where: { ...whereTxn, type: "WITHDRAWAL" },
        include: { account: true, vendor: true, contractor: true, project: true },
        orderBy: { createdAt: "desc" },
      });

      const totalDeposits = deposits.reduce((s, t) => s + t.amount, 0);
      const totalWithdrawals = withdrawals.reduce((s, t) => s + t.amount, 0);
      const netCashFlow = totalDeposits - totalWithdrawals;

      return NextResponse.json({
        reportType,
        summary: { totalDeposits, totalWithdrawals, netCashFlow },
        deposits,
        withdrawals,
      });
    }

    if (reportType === "project_pnl") {
      const projects = await prisma.project.findMany({
        include: {
          customer: { select: { name: true } },
          transactions: { where: { status: "APPROVED" } },
          expenses: { where: { status: "APPROVED" } },
        },
      });

      const projectPnL = projects.map((p) => {
        const income = p.transactions
          .filter((t) => t.type === "DEPOSIT")
          .reduce((sum, t) => sum + t.amount, 0);
        const expense = p.transactions
          .filter((t) => t.type === "WITHDRAWAL")
          .reduce((sum, t) => sum + t.amount, 0);
        const bookedExpense = p.expenses.reduce((sum, e) => sum + e.amount, 0);
        const totalCost = Math.max(expense, bookedExpense);
        const profit = income - totalCost;
        const margin = income > 0 ? ((profit / income) * 100).toFixed(1) : "0.0";

        return {
          id: p.id,
          projectCode: p.projectCode,
          name: p.name,
          customer: p.customer?.name || "Direct",
          budget: p.budget,
          income,
          cost: totalCost,
          profit,
          margin: `${margin}%`,
          status: p.status,
          progress: `${p.progressPercent}%`,
        };
      });

      return NextResponse.json({ reportType, rows: projectPnL });
    }

    if (reportType === "vendor_payments") {
      const vendors = await prisma.vendor.findMany({
        include: {
          transactions: {
            where: { type: "WITHDRAWAL", status: "APPROVED" },
          },
        },
      });

      const rows = vendors.map((v) => {
        const totalPaid = v.transactions.reduce((s, t) => s + t.amount, 0);
        return {
          id: v.id,
          vendorName: v.companyName,
          contact: v.contactPerson,
          phone: v.mobileNumber,
          specialization: v.specialization,
          totalPaid,
          transactionCount: v.transactions.length,
          status: v.status,
        };
      });

      return NextResponse.json({ reportType, rows });
    }

    if (reportType === "lead_conversion") {
      const leads = await prisma.lead.findMany({
        include: { assignedVendor: true },
        orderBy: { createdAt: "desc" },
      });

      const total = leads.length;
      const converted = leads.filter((l) => l.status === "CONVERTED").length;
      const rate = total > 0 ? ((converted / total) * 100).toFixed(1) : "0.0";

      return NextResponse.json({
        reportType,
        summary: { totalLeads: total, convertedCount: converted, conversionRate: `${rate}%` },
        leads,
      });
    }

    return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
