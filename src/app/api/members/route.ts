import { NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth/session";
import { enforceSecurityContext } from "@/lib/auth/guards";
import { MemberService } from "@/services/member/member-service";
import { logAuditEvent } from "@/services/audit/audit-service";
import { MemberStatus, Gender } from "@prisma/client";

/**
 * GET Endpoint: Queries the SACCO client member rosters directory with complete filter properties.
 */
export async function GET(request: Request) {
  try {
    const session = await getAuthenticatedSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: "Unauthorized security validation token payload missing." }, { status: 401 });
    }

    const isPermitted = enforceSecurityContext({
      id: session.userId,
      userPermissions: [],
      ...session
    }, "user:read");

    if (!isPermitted) {
      return NextResponse.json({ error: "Forbidden: Insufficient access clearance parameters." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status") as MemberStatus | null;
    const queryParam = searchParams.get("q") || undefined;

    const branchScope = session.saccoRole === "BRANCH_MANAGER" || session.saccoRole === "STAFF"
      ? session.branchId 
      : searchParams.get("branchId");

    const databaseMembersData = await MemberService.getMembersDirectory({
      organizationId: session.organizationId,
      branchId: branchScope || undefined,
      searchQuery: queryParam,
      ...(statusParam && { status: statusParam }),
    });

    return NextResponse.json({ success: true, data: databaseMembersData });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to execute customers retrieval lookup pipeline.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST Endpoint: Orchestrates standard client customer onboardings inside a multi-tenant node layout.
 */
export async function POST(request: Request) {
  try {
    const session = await getAuthenticatedSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: "Unauthorized context session." }, { status: 401 });
    }

    const isPermitted = enforceSecurityContext({
      id: session.userId,
      userPermissions: [],
      ...session
    }, "user:create");

    if (!isPermitted) {
      return NextResponse.json({ error: "Forbidden: Management administrative role credentials required." }, { status: 403 });
    }

    const body = await request.json();
    // FIX: Extracted split name variations safely matching configuration
    const { firstName, middleName, lastName, email, phone, nationalId, passportNo, dateOfBirth, gender, address, branchId } = body;

    if (!firstName || !lastName || !phone || !branchId) {
      return NextResponse.json({ error: "Missing required onboarding attributes: First Name, Last Name, Active Phone, and Target Branch." }, { status: 400 });
    }

    const registeredMember = await MemberService.onboard({
      organizationId: session.organizationId,
      branchId,
      firstName,
      middleName,
      lastName,
      email,
      phone,
      nationalId,
      passportNo,
      dateOfBirth,
      gender: gender as Gender,
      address
    });

    await logAuditEvent({
      organizationId: session.organizationId,
      userId: session.userId,
      action: "SACCO_MEMBER_REGISTERED",
      entity: "Member",
      entityId: registeredMember.id,
      newValues: { 
        clientFullName: `${firstName} ${lastName}`, 
        memberNumber: registeredMember.memberNo,
        assignedBranchId: branchId
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "SACCO Membership Profile successfully recorded.", 
      data: registeredMember 
    }, { status: 201 });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to complete transaction onboarding routines for target customer.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}