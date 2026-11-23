import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser(req);
    const body = await req.json();

    const { title, description, percentage, labourCount, weather, notes, materialUsed } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const progress = await prisma.$transaction(async (tx) => {
      const entry = await tx.projectProgress.create({
        data: {
          projectId: params.id,
          title,
          description,
          percentage: parseInt(percentage) || 0,
          labourCount: parseInt(labourCount) || 0,
          weather: weather || "Sunny",
          notes: notes || null,
          materialUsed: materialUsed || null,
          reportedBy: user?.name || "Site Engineer",
        },
      });

      if (percentage) {
        await tx.project.update({
          where: { id: params.id },
          data: { progressPercent: parseInt(percentage) },
        });
      }

      return entry;
    });

    await logAudit({
      userId: user?.id,
      action: "PROJECT_PROGRESS_LOGGED",
      entity: "PROJECT",
      entityId: params.id,
      details: `Progress entry added: "${title}" (${percentage || 0}%)`,
    });

    return NextResponse.json(progress, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
