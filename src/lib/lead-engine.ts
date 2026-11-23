import prisma from "./prisma";
import { logAudit } from "./audit";

export interface LeadAssignmentResult {
  assigned: boolean;
  vendorId?: string;
  vendorName?: string;
  score?: number;
  reason: string;
}

/**
 * Intelligent Lead Distribution Engine
 * Matches leads against approved vendors based on:
 * - Service Area / Location overlap
 * - Construction Category / Specialization match
 * - Vendor Priority rating
 * - Current Active Lead Workload
 */
export async function autoAssignLead(leadId: string): Promise<LeadAssignmentResult> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
  });

  if (!lead) {
    return { assigned: false, reason: "Lead not found" };
  }

  // Check if system setting allows auto assignment
  const setting = await prisma.systemSetting.findUnique({
    where: { key: "AUTO_LEAD_ASSIGNMENT" },
  });

  if (setting && setting.value.toLowerCase() === "false") {
    return { assigned: false, reason: "Automatic lead distribution is disabled in system settings" };
  }

  // Fetch all APPROVED vendors
  const vendors = await prisma.vendor.findMany({
    where: { status: "APPROVED" },
    include: {
      user: true,
      leadAssignments: {
        where: {
          status: { in: ["PENDING", "ACCEPTED"] },
        },
      },
    },
  });

  if (!vendors || vendors.length === 0) {
    return { assigned: false, reason: "No approved vendors currently available" };
  }

  const locationLower = (lead.projectLocation || "").toLowerCase();
  const categoryLower = (lead.constructionType || "").toLowerCase();

  // Score vendors
  const scoredVendors = vendors.map((vendor) => {
    let score = 0;
    const areas = (vendor.serviceAreas || "").toLowerCase();
    const city = (vendor.city || "").toLowerCase();
    const spec = (vendor.specialization || "").toLowerCase();

    // 1. Location match (+40 points)
    if (areas.includes(locationLower) || city.includes(locationLower) || locationLower.includes(city)) {
      score += 40;
    }

    // 2. Specialization match (+35 points)
    if (spec.includes(categoryLower) || categoryLower.includes("civil") && spec.includes("civil")) {
      score += 35;
    } else if (categoryLower.includes("interior") && spec.includes("interior")) {
      score += 35;
    } else if (categoryLower.includes("commercial") && (spec.includes("structural") || spec.includes("peb"))) {
      score += 30;
    } else {
      score += 15; // baseline for general capability
    }

    // 3. Priority & Rating (+ up to 25 points)
    const priorityBonus = (vendor.priority || 1) * 5; // e.g. priority 1 = 5, priority 3 = 15
    const ratingBonus = Math.round((vendor.rating || 4.5) * 2); // 4.9 * 2 ~ 10
    score += priorityBonus + ratingBonus;

    // 4. Workload balancing: penalize for too many active pending leads (-5 per active lead)
    const activeLeadsCount = vendor.leadAssignments.length;
    score -= activeLeadsCount * 5;

    return {
      vendor,
      score,
      activeLeadsCount,
    };
  });

  // Sort descending by score
  scoredVendors.sort((a, b) => b.score - a.score);

  const bestMatch = scoredVendors[0];

  if (!bestMatch || bestMatch.score <= 0) {
    return { assigned: false, reason: "No eligible vendor found meeting criteria" };
  }

  const selectedVendor = bestMatch.vendor;

  // Transaction: Update lead and create lead assignment
  await prisma.$transaction(async (tx) => {
    await tx.lead.update({
      where: { id: lead.id },
      data: {
        assignedVendorId: selectedVendor.id,
        status: "ASSIGNED",
      },
    });

    await tx.leadAssignment.create({
      data: {
        leadId: lead.id,
        vendorId: selectedVendor.id,
        status: "PENDING",
        assignedAt: new Date(),
      },
    });

    // Notify Vendor if vendor has an associated user account
    if (selectedVendor.userId) {
      await tx.notification.create({
        data: {
          userId: selectedVendor.userId,
          title: "New Lead Assigned: " + lead.leadNumber,
          message: `A new ${lead.constructionType} lead in ${lead.projectLocation} has been auto-assigned to your firm. Budget: ₹${lead.budget.toLocaleString("en-IN")}.`,
          type: "LEAD",
          link: "/vendor",
        },
      });
    }

    // Notify Super Admins
    const admins = await tx.user.findMany({
      where: { role: { in: ["SUPER_ADMIN", "ADMIN"] } },
      select: { id: true },
    });

    for (const adm of admins) {
      await tx.notification.create({
        data: {
          userId: adm.id,
          title: `Lead Auto-Assigned: ${lead.leadNumber}`,
          message: `Lead ${lead.leadNumber} (${lead.customerName}) auto-distributed to ${selectedVendor.companyName}.`,
          type: "LEAD",
          link: "/admin/leads",
        },
      });
    }
  });

  await logAudit({
    action: "LEAD_AUTO_ASSIGNED",
    entity: "LEAD",
    entityId: lead.id,
    details: `Lead ${lead.leadNumber} auto-assigned to vendor ${selectedVendor.companyName} (Score: ${bestMatch.score})`,
  });

  return {
    assigned: true,
    vendorId: selectedVendor.id,
    vendorName: selectedVendor.companyName,
    score: bestMatch.score,
    reason: `Successfully assigned based on location and capability score ${bestMatch.score}`,
  };
}
