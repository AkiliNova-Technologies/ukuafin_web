import { NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth/session";
import { enforceSecurityContext } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";
import { logAuditEvent } from "@/services/audit/audit-service";
import { UserStatus } from "@prisma/client";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PATCH: Modify administrative roles or branch assignments for a Staff User
 */
export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    // Un-wrap the dynamic parameters promise required by Next.js 15+
    const { id } = await params;

    const session = await getAuthenticatedSession();
    if (!session?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!enforceSecurityContext({ id: session.userId, userPermissions: [], ...session }, "user:create")) {
      return NextResponse.json({ error: "Forbidden: Admin clearances needed." }, { status: 403 });
    }

    const body = await request.json();
    const { roleId, branchId, status } = body;

    const staffUser = await prisma.user.findFirst({
      where: { id, organizationId: session.organizationId }
    });

    if (!staffUser) {
      return NextResponse.json({ error: "Staff record not found." }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        roleId: roleId || staffUser.roleId, 
        branchId: branchId || staffUser.branchId,
        status: (status as UserStatus) || staffUser.status,
      },
      select: { id: true, email: true, roleId: true, branchId: true, status: true }
    });

    await logAuditEvent({
      organizationId: session.organizationId,
      userId: session.userId,
      action: "STAFF_PRIVILEGES_MODIFIED",
      entity: "User",
      entityId: id,
      newValues: { roleId, branchId, status }
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("[STAFF_PATCH_ERROR]:", error);
    return NextResponse.json({ error: "Failed to update employee context rules." }, { status: 400 });
  }
}