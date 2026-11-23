import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { autoAssignLead } from "@/lib/lead-engine";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser(req);
    const body = await req.json();
    const { action, reason } = body; // action: 'ACCEPT' or 'REJECT'

    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      include: { assignedVendor: true },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    if (action === "ACCEPT") {
      await prisma.$transaction([
        prisma.lead.update({
          where: { id: lead.id },
          data: { status: "CONTACTED" },
        }),
        prisma.leadAssignment.updateMany({
          where: { leadId: lead.id, status: "PENDING" },
          data: {
            status: "ACCEPTED",
            respondedAt: new Date(),
          },
        }),
      ]);

      await logAudit({
        userId: user?.id,
        action: "LEAD_ACCEPTED",
        entity: "LEAD",
        entityId: lead.id,
        details: `Vendor accepted lead ${lead.leadNumber}.`,
      });

      return NextResponse.json({ success: true, message: "Lead accepted successfully!" });
    } else if (action === "REJECT") {
      // Mark assignment rejected
      await prisma.leadAssignment.updateMany({
        where: { leadId: lead.id, status: "PENDING" },
        data: {
          status: "REJECTED",
          rejectionReason: reason || "Vendor unavailable",
          respondedAt: new Date(),
        },
      });

      // Clear current vendor assignment on lead
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          assignedVendorId: null,
          status: "NEW",
          rejectionReason: reason || "Vendor rejected",
        },
      });

      // Notify Super Admins
      const admins = await prisma.user.findMany({
        where: { role: { in: ["SUPER_ADMIN", "ADMIN"] } },
        select: { id: true },
      });

      for (const adm of admins) {
        await prisma.notification.create({
          data: {
            userId: adm.id,
            title: `Lead ${lead.leadNumber} Rejected by Vendor`,
            message: `${lead.assignedVendor?.companyName || "Vendor"} rejected lead. Reason: ${reason || "Not specified"}. Available for reassignment.`,
            type: "ALERT",
            link: "/admin/leads",
          },
        });
      }

      await logAudit({
        userId: user?.id,
        action: "LEAD_REJECTED",
        entity: "LEAD",
        entityId: lead.id,
        details: `Vendor rejected lead ${lead.leadNumber}. Re-opened for reassignment.`,
      });

      // Optionally re-trigger auto assignment to next best vendor
      const reassignment = await autoAssignLead(lead.id);

      return NextResponse.json({
        success: true,
        message: "Lead rejected and made available for reassignment.",
        reassigned: reassignment.assigned,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
