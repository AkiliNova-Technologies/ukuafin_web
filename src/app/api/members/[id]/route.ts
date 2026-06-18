import { NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth/session";
import { enforceSecurityContext } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";
import { logAuditEvent } from "@/services/audit/audit-service";
import { Gender, MemberStatus } from "@prisma/client";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET: Fetch a single member profile with complete relational counts
 */
export async function GET(request: Request, { params }: RouteContext) {
  try {
    // Un-wrap the parameters promise required by Next.js 15+
    const { id } = await params;

    const session = await getAuthenticatedSession();
    if (!session?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!enforceSecurityContext({ id: session.userId, userPermissions: [], ...session }, "user:read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const member = await prisma.member.findFirst({
      where: {
        id,
        organizationId: session.organizationId,
      },
      include: {
        branch: { select: { name: true, code: true } },
        _count: { select: { loans: true, savingsAccounts: true } }
      }
    });

    if (!member) {
      return NextResponse.json({ error: "Member profile not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: member });
  } catch (error) {
    // Edge-case catch handler fallback to guarantee no unhandled param tracking crash
    console.error("[MEMBER_GET_ERROR] Failed to fetch member profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * PATCH: Update specific fields of a member profile (KYC updates)
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
    const { firstName, middleName, lastName, phone, email, address, occupation, gender, status } = body;

    // Verify ownership inside the tenant environment before writing updates
    const existing = await prisma.member.findFirst({
      where: { id, organizationId: session.organizationId }
    });

    if (!existing) {
      return NextResponse.json({ error: "Member profile not found." }, { status: 404 });
    }

    const updatedMember = await prisma.member.update({
      where: { id },
      data: {
        firstName: firstName?.trim() || existing.firstName,
        middleName: middleName !== undefined ? middleName?.trim() : existing.middleName,
        lastName: lastName?.trim() || existing.lastName,
        phone: phone?.trim() || existing.phone,
        email: email !== undefined ? email?.toLowerCase().trim() : existing.email,
        address: address !== undefined ? address : existing.address,
        occupation: occupation !== undefined ? occupation : existing.occupation,
        gender: gender as Gender || existing.gender,
        status: status as MemberStatus || existing.status,
      }
    });

    await logAuditEvent({
      organizationId: session.organizationId,
      userId: session.userId,
      action: "SACCO_MEMBER_UPDATED",
      entity: "Member",
      entityId: id,
      newValues: { updatedFields: Object.keys(body) }
    });

    return NextResponse.json({ success: true, data: updatedMember });
  } catch (error) {
    console.error("[MEMBER_PATCH_ERROR] Failed to update member profile:", error);
    return NextResponse.json({ error: "Failed to update member profile data." }, { status: 400 });
  }
}