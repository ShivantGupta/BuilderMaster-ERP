import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser(req);
    const body = await req.json();
    const { action, comments } = body; // action: 'APPROVE' or 'REJECT'

    const txn = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: { account: true },
    });

    if (!txn) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (txn.status !== "PENDING") {
      return NextResponse.json({ error: `Transaction is already ${txn.status}` }, { status: 400 });
    }

    if (action === "APPROVE") {
      await prisma.$transaction(async (tx) => {
        // 1. Update transaction
        await tx.transaction.update({
          where: { id: txn.id },
          data: {
            status: "APPROVED",
            approvedById: user?.id || null,
            approvedAt: new Date(),
          },
        });

        // 2. Adjust account balance
        const balanceDelta = txn.type === "DEPOSIT" ? txn.amount : -txn.amount;
        await tx.account.update({
          where: { id: txn.accountId },
          data: { balance: { increment: balanceDelta } },
        });

        // 3. Log Approval
        await tx.transactionApproval.create({
          data: {
            transactionId: txn.id,
            approverId: user?.id || "admin",
            status: "APPROVED",
            comments: comments || "Approved by Administrator",
          },
        });

        // 4. Create corresponding expense record if WITHDRAWAL
        if (txn.type === "WITHDRAWAL") {
          const expCount = await tx.expense.count();
          await tx.expense.create({
            data: {
              expenseNumber: `EXP-2026-${(expCount + 101).toString().padStart(4, "0")}`,
              category: txn.category,
              amount: txn.amount,
              paymentMethod: txn.paymentMethod,
              projectId: txn.projectId,
              vendorId: txn.vendorId,
              contractorId: txn.contractorId,
              description: txn.description,
              billUrl: txn.receiptUrl,
              status: "APPROVED",
              createdById: txn.createdById,
            },
          });
        }
      });

      await logAudit({
        userId: user?.id,
        action: "TRANSACTION_APPROVED",
        entity: "TRANSACTION",
        entityId: txn.id,
        details: `Transaction ${txn.transactionNumber} of ₹${txn.amount} approved.`,
      });

      return NextResponse.json({ success: true, message: "Transaction approved and balance updated" });
    } else if (action === "REJECT") {
      await prisma.$transaction([
        prisma.transaction.update({
          where: { id: txn.id },
          data: {
            status: "REJECTED",
            rejectionReason: comments || "Rejected by Administrator",
            approvedById: user?.id || null,
            approvedAt: new Date(),
          },
        }),
        prisma.transactionApproval.create({
          data: {
            transactionId: txn.id,
            approverId: user?.id || "admin",
            status: "REJECTED",
            comments: comments || "Rejected by Administrator",
          },
        }),
      ]);

      await logAudit({
        userId: user?.id,
        action: "TRANSACTION_REJECTED",
        entity: "TRANSACTION",
        entityId: txn.id,
        details: `Transaction ${txn.transactionNumber} rejected. Reason: ${comments || "None"}`,
      });

      return NextResponse.json({ success: true, message: "Transaction rejected" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
