import { prisma } from "@/lib/prisma/client";

interface AuditLogOptions {
  organizationId: string | null;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function logAuditEvent(payload: AuditLogOptions) {
  try {
    return await prisma.auditLog.create({
      data: {
        organizationId: payload.organizationId,
        userId: payload.userId,
        action: payload.action,
        entity: payload.entity,
        entityId: payload.entityId,
        oldValues: payload.oldValues ? JSON.parse(JSON.stringify(payload.oldValues)) : null,
        newValues: payload.newValues ? JSON.parse(JSON.stringify(payload.newValues)) : null,
        ipAddress: payload.ipAddress || null,
        userAgent: payload.userAgent || null,
      },
    });
  } catch (error) {
    console.error("CRITICAL ERROR: Failed to log audit sequence event:", error);
  }
}