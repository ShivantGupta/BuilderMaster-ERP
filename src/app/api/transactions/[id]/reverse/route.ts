import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser(req);
    const body = await req.json();
    const { reason } = body;

    const originalTxn = await prisma.transaction.findUnique({
      where: { id: params.id },
    });

    if (!originalTxn) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (originalTxn.isReversed) {
      return NextResponse.json({ error: "Transaction has already been reversed" }, { status: 400 });
    }

    if (originalTxn.status !== "APPROVED") {
      return NextResponse.json({ error: "Only approved transactions can be reversed" }, { status: 400 });
    }

    const count = await prisma.transaction.count();
    const reversalNumber = `REV-${originalTxn.transactionNumber}`;

    // Opposite type: if DEPOSIT -> WITHDRAWAL, if WITHDRAWAL -> DEPOSIT
    const reversalType = originalTxn.type === "DEPOSIT" ? "WITHDRAWAL" : "DEPOSIT";

    const reversalTxn = await prisma.$transaction(async (tx) => {
      // 1. Mark original as reversed
      await tx.transaction.update({
        where: { id: originalTxn.id },
        data: { isReversed: true, status: "REVERSED" },
      });

      // 2. Create reversal entry
      const reversal = await tx.transaction.create({
        data: {
          transactionNumber: reversalNumber,
          type: reversalType,
          category: `Reversal of ${originalTxn.category}`,
          amount: originalTxn.amount,
          paymentMethod: originalTxn.paymentMethod,
          accountId: originalTxn.accountId,
          customerId: originalTxn.customerId,
          vendorId: originalTxn.vendorId,
          contractorId: originalTxn.contractorId,
          projectId: originalTxn.projectId,
          description: `REVERSAL ENTRY: ${reason || "Correction of transaction"} (Ref: ${originalTxn.transactionNumber})`,
          status: "APPROVED",
          reversalOfId: originalTxn.id,
          createdById: user?.id || originalTxn.createdById,
          approvedById: user?.id || originalTxn.createdById,
          approvedAt: new Date(),
        },
      });

      // 3. Balance Delta: If original was DEPOSIT, reversing it means subtracting it from account
      const balanceAdjustment = originalTxn.type === "DEPOSIT" ? -originalTxn.amount : originalTxn.amount;
      await tx.account.update({
        where: { id: originalTxn.accountId },
        data: { balance: { increment: balanceAdjustment } },
      });

      return reversal;
    });

    await logAudit({
      userId: user?.id,
      action: "TRANSACTION_REVERSED",
      entity: "TRANSACTION",
      entityId: originalTxn.id,
      details: `Transaction ${originalTxn.transactionNumber} reversed with entry ${reversalTxn.transactionNumber}. Reason: ${reason || "Correction"}`,
    });

    return NextResponse.json({
      success: true,
      message: `Transaction reversed successfully. Reversal entry created: ${reversalTxn.transactionNumber}`,
      reversal: reversalTxn,
    });
  } catch (error: any) {
    console.error("Reversal error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
