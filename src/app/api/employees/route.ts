import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        attendances: {
          take: 7,
          orderBy: { date: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalSalaryCommitment = employees.reduce((sum, e) => sum + (e.salary || 0), 0);
    const activeStaffCount = employees.filter((e) => e.status === "ACTIVE").length;

    return NextResponse.json({
      employees,
      stats: {
        totalEmployees: employees.length,
        activeStaffCount,
        totalMonthlyPayroll: totalSalaryCommitment,
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

    // Attendance recording
    if (body.action === "ATTENDANCE") {
      const { employeeId, status, checkIn, checkOut, hoursWorked, notes } = body;
      const att = await prisma.attendance.create({
        data: {
          employeeId,
          date: new Date(),
          status: status || "PRESENT",
          checkIn: checkIn || "09:00 AM",
          checkOut: checkOut || "06:00 PM",
          hoursWorked: parseFloat(hoursWorked) || 8.0,
          notes: notes || null,
        },
      });
      return NextResponse.json(att, { status: 201 });
    }

    // Add employee
    const { name, email, phone, roleTitle, department, salary, address, city, panNumber, aadharNumber } = body;
    if (!name || !email || !phone) {
      return NextResponse.json({ error: "Name, email and phone are required" }, { status: 400 });
    }

    const employee = await prisma.employee.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        phone,
        roleTitle: roleTitle || "Site Engineer",
        department: department || "Operations",
        salary: parseFloat(salary) || 0,
        address: address || null,
        city: city || "Mumbai",
        panNumber: panNumber || null,
        aadharNumber: aadharNumber || null,
        status: "ACTIVE",
      },
    });

    await logAudit({
      userId: user?.id,
      action: "EMPLOYEE_ADDED",
      entity: "EMPLOYEE",
      entityId: employee.id,
      details: `Employee ${employee.name} (${employee.roleTitle}) added.`,
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
