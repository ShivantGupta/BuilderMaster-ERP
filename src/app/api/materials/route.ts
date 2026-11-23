import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const materials = await prisma.material.findMany({
      include: {
        consumptions: {
          include: { project: { select: { id: true, name: true } } },
          orderBy: { date: "desc" },
          take: 5,
        },
      },
      orderBy: { name: "asc" },
    });

    const lowStockAlerts = materials.filter((m) => m.currentStock <= m.minStockLevel);

    return NextResponse.json({
      materials,
      lowStockCount: lowStockAlerts.length,
      lowStockAlerts,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    const body = await req.json();

    // Check if recording consumption or adding new material
    if (body.action === "CONSUME") {
      const { projectId, materialId, quantity, notes } = body;
      const parsedQty = parseFloat(quantity);

      if (!projectId || !materialId || isNaN(parsedQty) || parsedQty <= 0) {
        return NextResponse.json({ error: "Project, Material and positive quantity are required" }, { status: 400 });
      }

      const result = await prisma.$transaction(async (tx) => {
        const material = await tx.material.findUnique({ where: { id: materialId } });
        if (!material) throw new Error("Material not found");

        if (material.currentStock < parsedQty) {
          throw new Error(`Insufficient stock. Current stock: ${material.currentStock} ${material.unit}`);
        }

        const consumption = await tx.materialConsumption.create({
          data: {
            projectId,
            materialId,
            quantity: parsedQty,
            notes: notes || "Site consumption",
            recordedBy: user?.name || "Site Supervisor",
          },
        });

        await tx.material.update({
          where: { id: materialId },
          data: { currentStock: { decrement: parsedQty } },
        });

        return consumption;
      });

      return NextResponse.json(result, { status: 201 });
    }

    // Add new material
    const { name, category, unit, currentStock, minStockLevel, unitPrice } = body;
    if (!name || !unit) {
      return NextResponse.json({ error: "Name and unit are required" }, { status: 400 });
    }

    const material = await prisma.material.create({
      data: {
        name,
        category: category || "Raw Material",
        unit,
        currentStock: parseFloat(currentStock) || 0,
        minStockLevel: parseFloat(minStockLevel) || 10,
        unitPrice: parseFloat(unitPrice) || 0,
      },
    });

    await logAudit({
      userId: user?.id,
      action: "MATERIAL_CREATED",
      entity: "MATERIAL",
      entityId: material.id,
      details: `Material ${material.name} added.`,
    });

    return NextResponse.json(material, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
