import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      vendorName,
      companyName,
      contactPerson,
      mobileNumber,
      email,
      address,
      city,
      serviceAreas,
      specialization,
      gstNumber,
      panNumber,
      bankName,
      accountNumber,
      ifscCode,
      password,
    } = body;

    if (!vendorName || !companyName || !mobileNumber || !email) {
      return NextResponse.json(
        { error: "Company name, contact person, mobile number and email are required." },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password || "vendor123");

    // Create user and vendor records
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          name: contactPerson || vendorName,
          phone: mobileNumber,
          role: "VENDOR",
          status: "ACTIVE",
        },
      });

      const vendor = await tx.vendor.create({
        data: {
          userId: user.id,
          vendorName,
          companyName,
          contactPerson,
          mobileNumber,
          email: email.toLowerCase().trim(),
          address: address || "",
          city: city || "",
          serviceAreas: serviceAreas || city || "Mumbai",
          specialization: specialization || "Civil Construction",
          gstNumber: gstNumber || null,
          panNumber: panNumber || null,
          bankName: bankName || null,
          accountNumber: accountNumber || null,
          ifscCode: ifscCode || null,
          status: "PENDING_APPROVAL", // Goes into admin verification queue
          rating: 5.0,
          priority: 2,
        },
      });

      // Notify Super Admins
      const admins = await tx.user.findMany({
        where: { role: { in: ["SUPER_ADMIN", "ADMIN"] } },
        select: { id: true },
      });

      for (const adm of admins) {
        await tx.notification.create({
          data: {
            userId: adm.id,
            title: "New Vendor Registration Request",
            message: `${companyName} (${contactPerson}) submitted an onboarding application for review.`,
            type: "ALERT",
            link: "/admin/vendors",
          },
        });
      }

      return { user, vendor };
    });

    await logAudit({
      userId: result.user.id,
      action: "VENDOR_REGISTERED",
      entity: "VENDOR",
      entityId: result.vendor.id,
      details: `Vendor ${companyName} registered into approval queue.`,
    });

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully! Your vendor account is under review by our administration.",
      vendorId: result.vendor.id,
    });
  } catch (error: any) {
    console.error("Vendor register error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
