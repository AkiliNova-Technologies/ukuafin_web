import { NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth/session";
import { enforceSecurityContext } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";
import { logAuditEvent } from "@/services/audit/audit-service";

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * PATCH: Edit branch configurations (e.g., changing names or physical addresses)
 */
export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    // Un-wrap the parameters promise required by Next.js 15+
    const { id } = await params;

    const session = await getAuthenticatedSession();
    if (!session?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!enforceSecurityContext({ id: session.userId, userPermissions: [], ...session }, "user:create")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, address } = body;

    const branch = await prisma.branch.findFirst({
      where: { id, organizationId: session.organizationId, deletedAt: null }
    });

    if (!branch) {
      return NextResponse.json({ error: "Active branch record not found." }, { status: 404 });
    }

    const updatedBranch = await prisma.branch.update({
      where: { id },
      data: {
        name: name?.trim() || branch.name,
        address: address?.trim() || branch.address
      }
    });

    return NextResponse.json({ success: true, data: updatedBranch });
  } catch (error) {
    console.error("[BRANCH_PATCH_ERROR]:", error);
    return NextResponse.json({ error: "Failed to update branch properties." }, { status: 400 });
  }
}

/**
 * DELETE: Soft-delete a branch setting flag safely
 */
export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    // Un-wrap the parameters promise required by Next.js 15+
    const { id } = await params;

    const session = await getAuthenticatedSession();
    if (!session?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!enforceSecurityContext({ id: session.userId, userPermissions: [], ...session }, "user:create")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const branch = await prisma.branch.findFirst({
      where: { id, organizationId: session.organizationId, deletedAt: null }
    });

    if (!branch) {
      return NextResponse.json({ error: "Branch asset not found or already deleted." }, { status: 404 });
    }

    await prisma.branch.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await logAuditEvent({
      organizationId: session.organizationId,
      userId: session.userId,
      action: "BRANCH_SOFT_DELETED",
      entity: "Branch",
      entityId: id,
      newValues: { branchCode: branch.code, branchName: branch.name }
    });

    return NextResponse.json({ success: true, message: "Branch was successfully deactivated." });
  } catch (error) {
    console.error("[BRANCH_DELETE_ERROR]:", error);
    return NextResponse.json({ error: "Failed to safely clear branch registration data." }, { status: 400 });
  }
}