import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const settings = await prisma.systemSetting.findMany();
    const auditLogs = await prisma.auditLog.findMany({
      take: 30,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true, role: true } },
      },
    });

    return NextResponse.json({ settings, auditLogs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    const body = await req.json(); // Array of { key, value }

    if (Array.isArray(body)) {
      for (const item of body) {
        await prisma.systemSetting.upsert({
          where: { key: item.key },
          update: { value: item.value },
          create: { key: item.key, value: item.value },
        });
      }
    }

    await logAudit({
      userId: user?.id,
      action: "SETTINGS_UPDATED",
      entity: "SYSTEM_SETTINGS",
      details: "System settings updated by administrator.",
    });

    return NextResponse.json({ success: true, message: "Settings saved successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
