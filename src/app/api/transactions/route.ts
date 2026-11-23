import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // DEPOSIT, WITHDRAWAL, ALL
    const status = searchParams.get("status");
    const accountId = searchParams.get("accountId");
    const projectId = searchParams.get("projectId");
    const dateRange = searchParams.get("dateRange"); // today, yesterday, this_month, custom
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    const where: any = {};

    if (type && type !== "ALL") {
      where.type = type;
    }
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (accountId) {
      where.accountId = accountId;
    }
    if (projectId) {
      where.projectId = projectId;
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (dateRange === "today") {
      where.createdAt = { gte: startOfToday, lte: endOfToday };
    } else if (dateRange === "yesterday") {
      const startOfYesterday = new Date(startOfToday.getTime() - 86400000);
      const endOfYesterday = new Date(endOfToday.getTime() - 86400000);
      where.createdAt = { gte: startOfYesterday, lte: endOfYesterday };
    } else if (dateRange === "this_month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      where.createdAt = { gte: startOfMonth, lte: endOfToday };
    } else if (startDateParam && endDateParam) {
      where.createdAt = {
        gte: new Date(startDateParam),
        lte: new Date(new Date(endDateParam).setHours(23, 59, 59, 999)),
      };
    }

    // 1. Transactions list
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        account: true,
        customer: { select: { id: true, name: true, phone: true } },
        vendor: { select: { id: true, companyName: true } },
        contractor: { select: { id: true, name: true } },
        project: { select: { id: true, name: true, projectCode: true } },
        createdBy: { select: { id: true, name: true, role: true } },
        approvedBy: { select: { id: true, name: true } },
        reversalEntry: { select: { id: true, transactionNumber: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // 2. Financial Metrics calculation
    const accounts = await prisma.account.findMany();
    const totalCashBalance = accounts
      .filter((a) => a.type === "CASH")
      .reduce((sum, a) => sum + a.balance, 0);
    const totalBankBalance = accounts
      .filter((a) => a.type === "BANK")
      .reduce((sum, a) => sum + a.balance, 0);
    const totalAvailableBalance = totalCashBalance + totalBankBalance;

    // Today's Approved Metrics
    const todayDeposits = await prisma.transaction.aggregate({
      where: {
        type: "DEPOSIT",
        status: "APPROVED",
        createdAt: { gte: startOfToday, lte: endOfToday },
      },
      _sum: { amount: true },
    });

    const todayWithdrawals = await prisma.transaction.aggregate({
      where: {
        type: "WITHDRAWAL",
        status: "APPROVED",
        createdAt: { gte: startOfToday, lte: endOfToday },
      },
      _sum: { amount: true },
    });

    const pendingTxns = await prisma.transaction.aggregate({
      where: { status: "PENDING" },
      _count: { id: true },
      _sum: { amount: true },
    });

    const totalDepositsToday = todayDeposits._sum.amount || 0;
    const totalWithdrawalsToday = todayWithdrawals._sum.amount || 0;

    // Opening Balance = Current Available - (Today Approved Deposits - Today Approved Withdrawals)
    const openingBalance = totalAvailableBalance - (totalDepositsToday - totalWithdrawalsToday);
    const closingBalance = openingBalance + totalDepositsToday - totalWithdrawalsToday;

    return NextResponse.json({
      transactions,
      metrics: {
        openingBalance,
        totalDepositsToday,
        totalWithdrawalsToday,
        closingBalance,
        cashBalance: totalCashBalance,
        bankBalance: totalBankBalance,
        availableBalance: totalAvailableBalance,
        pendingCount: pendingTxns._count.id || 0,
        pendingAmount: pendingTxns._sum.amount || 0,
      },
      accounts,
    });
  } catch (error: any) {
    console.error("Transactions GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    const body = await req.json();

    const {
      type, // DEPOSIT or WITHDRAWAL
      category,
      amount,
      paymentMethod,
      accountId,
      customerId,
      vendorId,
      contractorId,
      projectId,
      description,
      receiptUrl,
    } = body;

    const parsedAmount = parseFloat(amount);
    if (!type || !category || isNaN(parsedAmount) || parsedAmount <= 0 || !accountId || !paymentMethod) {
      return NextResponse.json(
        { error: "Transaction type, category, positive amount, payment method, and account are required." },
        { status: 400 }
      );
    }

    // Check high-value threshold
    const thresholdSetting = await prisma.systemSetting.findUnique({
      where: { key: "HIGH_VALUE_THRESHOLD" },
    });
    const threshold = thresholdSetting ? parseFloat(thresholdSetting.value) : 50000;

    // Check if user is Super Admin or Accountant
    const isSuperAdmin = user?.role === "SUPER_ADMIN";
    const requiresApproval = parsedAmount >= threshold && !isSuperAdmin;
    const initialStatus = requiresApproval ? "PENDING" : "APPROVED";

    const count = await prisma.transaction.count();
    const transactionNumber = `TXN-2026-${(count + 1).toString().padStart(4, "0")}`;

    // Get fallback createdBy user if no session
    let createdById = user?.id;
    if (!createdById) {
      const defaultUser = await prisma.user.findFirst();
      createdById = defaultUser?.id || "";
    }

    // Atomic transaction
    const newTxn = await prisma.$transaction(async (tx) => {
      const txn = await tx.transaction.create({
        data: {
          transactionNumber,
          type,
          category,
          amount: parsedAmount,
          paymentMethod,
          accountId,
          customerId: customerId || null,
          vendorId: vendorId || null,
          contractorId: contractorId || null,
          projectId: projectId || null,
          description: description || `${type} recorded under ${category}`,
          receiptUrl: receiptUrl || null,
          status: initialStatus,
          createdById,
          approvedById: initialStatus === "APPROVED" ? createdById : null,
          approvedAt: initialStatus === "APPROVED" ? new Date() : null,
        },
      });

      // If approved immediately, adjust account balance
      if (initialStatus === "APPROVED") {
        const balanceDelta = type === "DEPOSIT" ? parsedAmount : -parsedAmount;
        await tx.account.update({
          where: { id: accountId },
          data: { balance: { increment: balanceDelta } },
        });

        // Also record corresponding Expense record if WITHDRAWAL
        if (type === "WITHDRAWAL") {
          const expCount = await tx.expense.count();
          await tx.expense.create({
            data: {
              expenseNumber: `EXP-2026-${(expCount + 101).toString().padStart(4, "0")}`,
              category,
              amount: parsedAmount,
              paymentMethod,
              projectId: projectId || null,
              vendorId: vendorId || null,
              contractorId: contractorId || null,
              description: description || `Expense for ${category}`,
              billUrl: receiptUrl || null,
              status: "APPROVED",
              createdById,
            },
          });
        }
      } else {
        // High-value pending approval -> notify Admins
        const admins = await tx.user.findMany({
          where: { role: { in: ["SUPER_ADMIN", "ADMIN"] } },
          select: { id: true },
        });

        for (const adm of admins) {
          await tx.notification.create({
            data: {
              userId: adm.id,
              title: `High-Value ${type} Approval Required`,
              message: `Transaction ${transactionNumber} of ₹${parsedAmount.toLocaleString("en-IN")} requires your authorization.`,
              type: "TRANSACTION",
              link: "/admin/daily-transactions",
            },
          });
        }
      }

      return txn;
    });

    await logAudit({
      userId: createdById,
      action: "TRANSACTION_RECORDED",
      entity: "TRANSACTION",
      entityId: newTxn.id,
      details: `${type} ${newTxn.transactionNumber} of ₹${parsedAmount} recorded (Status: ${newTxn.status})`,
    });

    return NextResponse.json(newTxn, { status: 201 });
  } catch (error: any) {
    console.error("Transactions POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
