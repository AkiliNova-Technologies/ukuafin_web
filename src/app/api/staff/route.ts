import { NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth/session";
import { enforceSecurityContext } from "@/lib/auth/guards";
import { StaffService } from "@/services/staff/staff-service";
import { logAuditEvent } from "@/services/audit/audit-service";
import { UserStatus, OrganizationUserRole } from "@prisma/client";

/**
 * GET Endpoint: Compiles your internal employees dashboard registry with explicit filters.
 */
export async function GET(request: Request) {
  try {
    const session = await getAuthenticatedSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: "Unauthorized user security context token." }, { status: 401 });
    }

    const isPermitted = enforceSecurityContext({
      id: session.userId,
      userPermissions: [],
      ...session
    }, "staff:read");

    if (!isPermitted) {
      return NextResponse.json({ error: "Forbidden: Insufficient administration permissions." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status") as UserStatus | null;
    const roleParam = searchParams.get("role") as OrganizationUserRole | null;

    // Enforce data boundaries: Branch managers can only inspect staff assigned inside their own node
    const targetBranchId = session.saccoRole === "BRANCH_MANAGER" 
      ? session.branchId 
      : searchParams.get("branchId");

    const staffData = await StaffService.getStaffRegistry({
      organizationId: session.organizationId,
      branchId: targetBranchId || undefined,
      ...(statusParam && { status: statusParam }),
      ...(roleParam && { role: roleParam }),
    });

    return NextResponse.json({ success: true, data: staffData });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to query back-office employees directory data.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST Endpoint: Registers a new system operator within the SACCO network domain spaces.
 */
export async function POST(request: Request) {
  try {
    const session = await getAuthenticatedSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: "Unauthorized access profile." }, { status: 401 });
    }

    const isPermitted = enforceSecurityContext({
      id: session.userId,
      userPermissions: [],
      ...session
    }, "staff:create");

    if (!isPermitted) {
      return NextResponse.json({ error: "Forbidden: Management operational override clearance missing." }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, phone, branchId, saccoRole, password } = body;

    if (!name || !email || !branchId || !saccoRole) {
      return NextResponse.json({ error: "Missing mandatory fields (Name, Email, Branch assignment, or System Role)." }, { status: 400 });
    }

    // Execute the staff onboarding pipeline process logic safely
    const onboardingResult = await StaffService.onboard({
      organizationId: session.organizationId,
      branchId,
      name,
      email,
      phone,
      saccoRole: saccoRole as OrganizationUserRole,
      password,
    });

    // Record audit transaction sequences tracking systemic changes
    await logAuditEvent({
      organizationId: session.organizationId,
      userId: session.userId,
      action: "USER_STAFF_ONBOARDED",
      entity: "User",
      entityId: onboardingResult.user.id,
      newValues: { 
        employeeName: name, 
        assignedRole: saccoRole, 
        branchContext: onboardingResult.user.branch?.name 
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "SACCO Staff Employee recorded successfully.",
      data: onboardingResult 
    }, { status: 201 });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal engine system failed to onboard employee.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}