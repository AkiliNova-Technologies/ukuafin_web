import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { OrganizationStatus, UserStatus } from "@prisma/client";
import { logAuditEvent } from "@/services/audit/audit-service";
import { dispatchNotification } from "@/services/notification/notification-service";
import { hashPassword } from "@/lib/auth/hash"; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sSaccoName, sSlug, sEmail, sPhone, sOwnerName, sOwnerEmail, sPassword } = body;

    if (!sSaccoName || !sSlug || !sOwnerEmail || !sPassword) {
      return NextResponse.json({ error: "Missing core onboarding initialization fields." }, { status: 400 });
    }

    const dynamicConflictCheck = await prisma.organization.findFirst({
      where: { OR: [{ slug: sSlug }, { email: sEmail }] }
    });

    if (dynamicConflictCheck) {
      return NextResponse.json({ error: "Organization Slug identity or Email profile matches active tenant." }, { status: 409 });
    }

    const sUserConflict = await prisma.user.findUnique({ where: { email: sOwnerEmail } });
    if (sUserConflict) {
      return NextResponse.json({ error: "Owner email is already registered inside our platform access registers." }, { status: 409 });
    }

    const executionResult = await prisma.$transaction(async (tx) => {
      const fallbackPlan = await tx.subscriptionPlan.findFirst({
        where: { slug: "starter", isActive: true }
      });

      if (!fallbackPlan) {
        throw new Error("Default Platform Package Configuration mapping was missing.");
      }

      const newOrg = await tx.organization.create({
        data: {
          name: sSaccoName,
          slug: sSlug.toLowerCase().trim(),
          email: sEmail,
          phone: sPhone,
          status: OrganizationStatus.ACTIVE, 
          trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 
          activatedAt: new Date(),
        }
      });

      await tx.organizationSubscription.create({
        data: {
          organizationId: newOrg.id,
          planId: fallbackPlan.id,
          status: "TRIAL",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });

      const systemOwnerRole = await tx.role.create({
        data: {
          organizationId: newOrg.id,
          name: "Sacco Owner Group",
          key: "OWNER",
          isSystem: true
        }
      });

      const sSecuredHash = await hashPassword(sPassword);
      const hostUserAdmin = await tx.user.create({
        data: {
          organizationId: newOrg.id,
          name: sOwnerName,
          email: sOwnerEmail.toLowerCase().trim(),
          passwordHash: sSecuredHash,
          status: UserStatus.ACTIVE,
          roleId: systemOwnerRole.id,
          emailVerifiedAt: new Date()
        }
      });

      return { newOrg, hostUserAdmin };
    });

    await logAuditEvent({
      organizationId: executionResult.newOrg.id,
      userId: executionResult.hostUserAdmin.id,
      action: "TENANT_ORGANIZATION_INITIALIZED",
      entity: "Organization",
      entityId: executionResult.newOrg.id,
      newValues: { orgName: executionResult.newOrg.name, owner: executionResult.hostUserAdmin.email }
    });

    await dispatchNotification({
      organizationId: executionResult.newOrg.id,
      userId: executionResult.hostUserAdmin.id,
      type: "SYSTEM",
      title: "Welcome to Square SACCO Core Network Platform",
      message: `Your tenant architecture profile platform space for ${executionResult.newOrg.name} has initialized successfully.`
    });

    return NextResponse.json({
      success: true,
      message: "SACCO Platform Onboarded Successfully",
      data: {
        organizationId: executionResult.newOrg.id,
        slug: executionResult.newOrg.slug
      }
    }, { status: 201 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal system process operation engine failure.";
    console.error("CRITICAL ONBOARDING FAILURE EXCEPTION ENGINE ERROR:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}