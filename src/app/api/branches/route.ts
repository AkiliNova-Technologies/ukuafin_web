import { NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth/session";
import { enforceSecurityContext } from "@/lib/auth/guards";
import { BranchService } from "@/services/branch/branch-service";
import { logAuditEvent } from "@/services/audit/audit-service";
import { BranchStatus } from "@prisma/client";

/**
 * GET Endpoint: Fetches branch locations for a tenant, complete with metrics.
 */
export async function GET(request: Request) {
  try {
    const session = await getAuthenticatedSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: "Unauthorized access token payload context." }, { status: 401 });
    }

    const isPermitted = enforceSecurityContext({
      id: session.userId,
      userPermissions: [],
      ...session
    }, "branch:read");

    if (!isPermitted) {
      return NextResponse.json({ error: "Forbidden: Insufficient role credentials clearance." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status") as BranchStatus | null;

    const filters = {
      organizationId: session.organizationId,
      branchId: session.saccoRole === "BRANCH_MANAGER" ? session.branchId : searchParams.get("branchId"),
      ...(statusParam && { status: statusParam }),
    };

    const branchesData = await BranchService.getAllWithMetrics(filters);
    return NextResponse.json({ success: true, data: branchesData });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to load branch records data.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST Endpoint: Handles new branch deployment setups.
 */
export async function POST(request: Request) {
  try {
    const session = await getAuthenticatedSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isPermitted = enforceSecurityContext({
      id: session.userId,
      userPermissions: [],
      ...session
    }, "branch:create");

    if (!isPermitted) {
      return NextResponse.json({ error: "Forbidden: Admin access level required." }, { status: 403 });
    }

    const body = await request.json();
    const { name, code, phone, email, address } = body;

    if (!name || !code) {
      return NextResponse.json({ error: "Missing required identifying parameters: Name and Code." }, { status: 400 });
    }

    const createdBranch = await BranchService.create({
      organizationId: session.organizationId,
      name,
      code,
      phone,
      email,
      address
    });

    await logAuditEvent({
      organizationId: session.organizationId,
      userId: session.userId,
      action: "BRANCH_LOCATION_CREATED",
      entity: "Branch",
      entityId: createdBranch.id,
      newValues: { branchName: name, branchCode: code.toUpperCase() }
    });

    return NextResponse.json({ success: true, data: createdBranch }, { status: 201 });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to execute branch creation engine routine.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}