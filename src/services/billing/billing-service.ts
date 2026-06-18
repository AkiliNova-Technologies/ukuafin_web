import { prisma } from "@/lib/prisma/client";
import { Prisma, OrganizationStatus, SubscriptionStatus, InvoiceStatus, NotificationType } from "@prisma/client";

export interface ProvisionOrganizationInput {
  name: string;
  slug: string;
  taxIdentifier?: string;
  adminUserId: string;
  planId: string; // References the hard database ID of a SubscriptionPlan row
}

export interface RecordInvoicePaymentInput {
  organizationId: string;
  amountPaid: number;
  invoiceId: string;
  reference: string;
}

export const BillingService = {
  /**
   * Onboards a brand-new SACCO tenant workspace and spins up an associated 
   * subscription track tied directly to the specified global infrastructure tier.
   */
  async provisionOrganization(input: ProvisionOrganizationInput) {
    const existingSlug = await prisma.organization.findUnique({
      where: { slug: input.slug },
    });

    if (existingSlug) {
      throw new Error("This cooperative URL prefix identifier workspace slug is already allocated.");
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Create baseline corporate workspace identity node
      const organization = await tx.organization.create({
        data: {
          name: input.name,
          slug: input.slug,
          status: "ACTIVE" as OrganizationStatus,
          registrationNumber: input.taxIdentifier || null,
          activatedAt: new Date(),
        },
      });

      // 2. Set up initial period boundaries (30-day window anchor)
      const periodStart = new Date();
      const periodEnd = new Date();
      periodEnd.setDate(periodEnd.getDate() + 30);

      // 3. Bind tenant to the plan inside OrganizationSubscription
      const subscription = await tx.organizationSubscription.create({
        data: {
          organizationId: organization.id,
          planId: input.planId,
          status: "ACTIVE" as SubscriptionStatus,
          startedAt: periodStart,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
        },
      });

      // ATOMIC AUDIT LOG: Lock setup event variables safely
      await tx.auditLog.create({
        data: {
          organizationId: organization.id,
          userId: input.adminUserId,
          action: "ORGANIZATION_PROVISIONED",
          entity: "Organization",
          entityId: organization.id,
          oldValues: {},
          newValues: {
            name: input.name,
            slug: input.slug,
            subscriptionId: subscription.id,
            planId: input.planId,
            expiresAt: periodEnd.toISOString(),
          },
        },
      });

      return { organization, subscription };
    });
  },

  /**
   * Reconciles invoice assets, registers payment tokens, and extends 
   * the active subscription boundaries precisely by another billing cycle.
   */
  async recordInvoicePayment(input: RecordInvoicePaymentInput) {
    if (input.amountPaid <= 0) throw new Error("Subscription liquidity ledger tokens must be positive.");

    return await prisma.$transaction(async (tx) => {
      // Find the specific structural invoice node matching parameters
      const invoice = await tx.invoice.findFirst({
        where: { id: input.invoiceId, organizationId: input.organizationId },
        include: { subscription: true },
      });

      if (!invoice) {
        throw new Error("Target service utility contract asset invoice reference was not found.");
      }

      if (invoice.status === ("PAID" as InvoiceStatus)) {
        throw new Error("This accounting settlement record invoice trace has already been finalized.");
      }

      // 1. Reconcile baseline collection accounts via the nested payment model ledger
      await tx.payment.create({
        data: {
          invoiceId: input.invoiceId,
          amount: new Prisma.Decimal(input.amountPaid),
          provider: "SYSTEM_GATEWAY",
          providerRef: input.reference,
        },
      });

      // 2. Clear outstanding balance flags on invoice itemization charts
      const updatedInvoice = await tx.invoice.update({
        where: { id: input.invoiceId },
        data: {
          status: "PAID" as InvoiceStatus,
          paidAt: new Date(),
        },
      });

      // 3. Increment subscription expiration dates by exactly 30 days
      const activePeriodStart = new Date();
      const activePeriodEnd = new Date();
      activePeriodEnd.setDate(activePeriodEnd.getDate() + 30);

      if (invoice.subscriptionId) {
        await tx.organizationSubscription.update({
          where: { id: invoice.subscriptionId },
          data: {
            status: "ACTIVE" as SubscriptionStatus,
            currentPeriodStart: activePeriodStart,
            currentPeriodEnd: activePeriodEnd,
            cancelledAt: null,
          },
        });
      }

      // 4. Fully restore workspace statuses out of isolated holds
      await tx.organization.update({
        where: { id: input.organizationId },
        data: { status: "ACTIVE" as OrganizationStatus },
      });

      // ATOMIC AUDIT LOG: Permanently archive core lifecycle state movements
      await tx.auditLog.create({
        data: {
          organizationId: input.organizationId,
          action: "SUBSCRIPTION_INVOICE_SETTLED",
          entity: "Invoice",
          entityId: updatedInvoice.id,
          oldValues: { status: invoice.status },
          newValues: {
            status: "PAID",
            extendedUntil: activePeriodEnd.toISOString(),
            referenceToken: input.reference,
          },
        },
      });

      return updatedInvoice;
    });
  },

  /**
   * Background process evaluating approaching expirations, issuing in-app notifications 
   * to admin accounts, and isolating workspaces that cross past-due thresholds.
   */
  async processBillingRemindersAndExpirations() {
    const today = new Date();
    
    const reminderThreshold = new Date();
    reminderThreshold.setDate(reminderThreshold.getDate() + 5);

    // 1. DISPATCH SYSTEM WARNINGS FOR UPCOMING CONTRACT EXPIRATIONS
    const expiringSubscriptions = await prisma.organizationSubscription.findMany({
      where: {
        status: "ACTIVE" as SubscriptionStatus,
        currentPeriodEnd: { gte: today, lte: reminderThreshold },
      },
    });

    for (const sub of expiringSubscriptions) {
      // Direct pull against platform users who run the target workspace cluster node
      const administrators = await prisma.user.findMany({
        where: {
          organizationId: sub.organizationId,
          status: "ACTIVE",
          // Fallback relies on checking system administration patterns via your nested role schemas
        },
      });

      for (const admin of administrators) {
        await prisma.notification.create({
          data: {
            organizationId: sub.organizationId,
            userId: admin.id,
            title: "Subscription Expiration & Billing Warning",
            message: `Your platform workspace billing window closes on ${sub.currentPeriodEnd?.toLocaleDateString()}. Outstanding balances must be settled immediately to prevent tenant suspension.`,
            type: "WARNING" as NotificationType,
          },
        });
      }

      await prisma.auditLog.create({
        data: {
          organizationId: sub.organizationId,
          action: "RENEWAL_REMINDER_NOTIFIED",
          entity: "OrganizationSubscription",
          entityId: sub.id,
          oldValues: { targetExpiry: sub.currentPeriodEnd?.toISOString() },
          newValues: { notificationsDispatchedCount: administrators.length },
        },
      });
    }

    // 2. LOCK TEAMS RUNNING PAST ACCESS WINDOW EXPIRATIONS
    const delinquentSubscriptions = await prisma.organizationSubscription.findMany({
      where: {
        status: "ACTIVE" as SubscriptionStatus,
        currentPeriodEnd: { lt: today },
      },
    });

    for (const delSub of delinquentSubscriptions) {
      await prisma.$transaction(async (tx) => {
        // Drop the track down into standard past due states
        await tx.organizationSubscription.update({
          where: { id: delSub.id },
          data: { status: "PAST_DUE" as SubscriptionStatus },
        });

        // Toggle tenant configuration flags to lock mutations out safely
        await tx.organization.update({
          where: { id: delSub.organizationId },
          data: {
            status: "SUSPENDED" as OrganizationStatus,
            suspendedAt: new Date(),
          },
        });

        await tx.auditLog.create({
          data: {
            organizationId: delSub.organizationId,
            action: "TENANT_ACCESS_AUTO_SUSPENDED",
            entity: "Organization",
            entityId: delSub.organizationId,
            oldValues: { systemStatus: "ACTIVE" },
            newValues: { systemStatus: "SUSPENDED", coreSubscriptionId: delSub.id },
          },
        });
      });
    }

    return {
      remindersSent: expiringSubscriptions.length,
      suspensionsApplied: delinquentSubscriptions.length,
    };
  },

  /**
   * System security gate monitoring if a tenant's access window is valid.
   */
  async enforceSubscriptionGuard(organizationId: string): Promise<boolean> {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) throw new Error("Context cooperative tenant parameters are missing from registries.");

    return org.status === ("ACTIVE" as OrganizationStatus);
  }
};