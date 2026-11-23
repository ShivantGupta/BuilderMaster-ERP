import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { autoAssignLead } from "@/lib/lead-engine";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      customerName,
      phone,
      email,
      projectLocation,
      constructionType,
      budget,
      plotSize,
      requirement,
      preferredContactTime,
      address,
      city,
    } = body;

    if (!customerName || !phone || !projectLocation || !constructionType) {
      return NextResponse.json(
        { error: "Customer name, phone, project location, and construction type are required" },
        { status: 400 }
      );
    }

    // 1. Create or link Customer record
    let customer = await prisma.customer.findFirst({
      where: { phone },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: customerName,
          phone,
          email: email || null,
          address: address || projectLocation,
          city: city || projectLocation,
          projectType: constructionType,
          propertyLocation: projectLocation,
          budget: parseFloat(budget) || 0,
          requirement: requirement || null,
          status: "ACTIVE",
        },
      });
    }

    // 2. Generate Unique Lead Number
    const count = await prisma.lead.count();
    const leadNumber = `LEAD-2026-${(count + 101).toString().padStart(4, "0")}`;

    // 3. Create Lead
    const lead = await prisma.lead.create({
      data: {
        leadNumber,
        customerName,
        phone,
        email: email || null,
        projectLocation,
        constructionType,
        budget: parseFloat(budget) || 0,
        plotSize: plotSize || null,
        requirement: requirement || null,
        preferredContactTime: preferredContactTime || "Anytime",
        status: "NEW",
        source: "WEBSITE_INQUIRY",
        customerId: customer.id,
      },
    });

    // 4. Trigger Automatic Lead Assignment Engine
    const assignmentResult = await autoAssignLead(lead.id);

    // 5. Audit Log
    await logAudit({
      action: "PUBLIC_INQUIRY_SUBMITTED",
      entity: "LEAD",
      entityId: lead.id,
      details: `New inquiry from ${customerName} (${phone}) - assigned: ${assignmentResult.assigned}`,
    });

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      leadNumber: lead.leadNumber,
      message: "Inquiry received successfully! Our construction specialist has been assigned and will contact you shortly.",
      assignment: assignmentResult,
    });
  } catch (error: any) {
    console.error("Public inquiry error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
