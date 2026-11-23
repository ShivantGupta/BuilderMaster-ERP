import prisma from "./prisma";

export async function logAudit({
  userId,
  action,
  entity,
  entityId,
  details,
  ipAddress = "127.0.0.1",
}: {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: string;
  ipAddress?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        entity,
        entityId: entityId || null,
        details: details || "",
        ipAddress,
      },
    });
  } catch (err) {
    console.error("Audit log error:", err);
  }
}
