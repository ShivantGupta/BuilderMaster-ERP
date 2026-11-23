import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, hashPassword } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { companyName: { contains: search } },
        { vendorName: { contains: search } },
        { contactPerson: { contains: search } },
        { mobileNumber: { contains: search } },
        { city: { contains: search } },
        { specialization: { contains: search } },
      ];
    }

    const vendors = await prisma.vendor.findMany({
      where,
      include: {
        documents: true,
        assignedLeads: {
          select: { id: true, leadNumber: true, status: true, budget: true },
        },
        projects: {
          select: { id: true, name: true, projectCode: true, status: true, budget: true },
        },
        transactions: {
          select: { id: true, amount: true, type: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(vendors);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    const body = await req.json();

    if (!body.companyName || !body.mobileNumber || !body.email) {
      return NextResponse.json(
        { error: "Company name, mobile number, and email are required" },
        { status: 400 }
      );
    }

    // Optional user account creation for vendor login
    let userId: string | undefined;
    if (body.createLogin) {
      const existingUser = await prisma.user.findUnique({
        where: { email: body.email.toLowerCase().trim() },
      });

      if (existingUser) {
        userId = existingUser.id;
      } else {
        const hashedPassword = await hashPassword(body.password || "vendor123");
        const newUser = await prisma.user.create({
          data: {
            email: body.email.toLowerCase().trim(),
            password: hashedPassword,
            name: body.contactPerson || body.companyName,
            phone: body.mobileNumber,
            role: "VENDOR",
            status: "ACTIVE",
          },
        });
        userId = newUser.id;
      }
    }

    const vendor = await prisma.vendor.create({
      data: {
        userId: userId || null,
        vendorName: body.vendorName || body.companyName,
        companyName: body.companyName,
        contactPerson: body.contactPerson,
        mobileNumber: body.mobileNumber,
        email: body.email.toLowerCase().trim(),
        address: body.address || "",
        city: body.city || "Mumbai",
        serviceAreas: body.serviceAreas || body.city || "Mumbai",
        specialization: body.specialization || "Civil Construction",
        gstNumber: body.gstNumber || null,
        panNumber: body.panNumber || null,
        bankName: body.bankName || null,
        accountNumber: body.accountNumber || null,
        ifscCode: body.ifscCode || null,
        status: body.status || "APPROVED",
        rating: parseFloat(body.rating) || 5.0,
        priority: parseInt(body.priority) || 1,
        notes: body.notes || null,
      },
    });

    await logAudit({
      userId: user?.id,
      action: "VENDOR_CREATED",
      entity: "VENDOR",
      entityId: vendor.id,
      details: `Vendor ${vendor.companyName} added.`,
    });

    return NextResponse.json(vendor, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
