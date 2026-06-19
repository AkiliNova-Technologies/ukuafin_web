import { prisma } from "@/lib/prisma/client";
import { 
  submitPesapalOrder, 
  cancelPesapalOrder, 
  requestPesapalRefund 
} from "@/lib/pesapal/client";
import { SubscriptionStatus, InvoiceStatus } from "@prisma/client";

const USD_TO_UGX_RATE = 3750;

interface PesapalTransactionPayload {
  confirmation_code?: string;
  payment_method?: string;
  status_code?: string | number;
  payment_status_description?: string;
}

export class PesapalBillingService {
  /**
   * Initializes or upgrades an organic billing track by spawning a standard invoice ledger entry.
   */
  static async initiateCheckout(organizationId: string, planId: string, userId?: string) {
    const baseData = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.findUnique({
        where: { id: organizationId },
        include: { subscriptions: true },
      });

      const plan = await tx.subscriptionPlan.findUnique({
        where: { id: planId },
      });

      if (!org || !plan) {
        throw new Error("Invalid organization or plan selected for subscription processing.");
      }
      
      let finalInvoiceAmount = Number(plan.price);
      const targetCurrency = org.currency || "UGX";

      if (plan.currency === "USD" && targetCurrency === "UGX") {
        finalInvoiceAmount = Math.round(finalInvoiceAmount * USD_TO_UGX_RATE);
        console.log(`[CONVERSION]: Handled dynamic mapping of $${plan.price} USD to ${finalInvoiceAmount} UGX`);
      }

      const uniqueRef = `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const invoice = await tx.invoice.create({
        data: {
          organizationId: org.id,
          invoiceNo: uniqueRef,
          subTotal: finalInvoiceAmount,
          amount: finalInvoiceAmount,
          currency: targetCurrency, // Aligned with tenant's localized operating balance system
          status: InvoiceStatus.DRAFT,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          items: {
            create: {
              description: `UkuaFin Base ${plan.name} Package Access Fee (${plan.price} ${plan.currency})`,
              quantity: 1,
              unitPrice: finalInvoiceAmount,
              totalPrice: finalInvoiceAmount,
            },
          },
        },
      });

      let sub = org.subscriptions.find((s) => s.planId === planId);
      if (!sub) {
        sub = await tx.organizationSubscription.create({
          data: {
            organizationId: org.id,
            planId: plan.id,
            status: SubscriptionStatus.TRIAL,
          },
        });
      }

      const updatedInvoice = await tx.invoice.update({
        where: { id: invoice.id },
        data: { subscriptionId: sub.id },
      });

      await tx.auditLog.create({
        data: {
          organizationId: org.id,
          userId: userId || null,
          action: "INVOICE_CHECKOUT_INITIATED",
          entity: "Invoice",
          entityId: updatedInvoice.id,
          oldValues: {},
          newValues: {
            invoiceNo: updatedInvoice.invoiceNo,
            amount: updatedInvoice.amount.toString(),
            currency: targetCurrency,
            planId: plan.id,
            status: InvoiceStatus.DRAFT,
          },
        },
      });

      return { org, plan, invoice: updatedInvoice };
    });

    // Step 2: Perform the third-party network API call OUTSIDE the database transaction
    const nameParts = baseData.org.name ? baseData.org.name.trim().split(/\s+/) : ["SACCO", "Admin"];
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "Member";

    try {
      const checkoutData = await submitPesapalOrder({
        id: baseData.invoice.invoiceNo,
        currency: baseData.invoice.currency, // Already converted to UGX
        amount: Number(baseData.invoice.amount), // Already converted to full valuation (e.g. 183750)
        description: `UkuaFin Subscription Renewal: ${baseData.plan.name}`.substring(0, 100),
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/tenant/billing`,
        redirect_mode: "TOP_WINDOW",
        notification_id: process.env.PESAPAL_IPN_ID!,
        billing_address: {
          email_address: baseData.org.email || "billing@ukuafin.com",
          phone_number: baseData.org.phone || "0700000000",
          country_code: "UG",
          first_name: firstName,
          middle_name: "",
          last_name: lastName,
          line_1: "Kampala Headquarters",
          line_2: "",
          city: "Kampala",
          state: "",
          postal_code: "",
          zip_code: "",
        },
      });

      await prisma.invoice.update({
        where: { id: baseData.invoice.id },
        data: { pesapalTrackingId: checkoutData.order_tracking_id },
      });

      return checkoutData.redirect_url;
    } catch (error) {
      await prisma.invoice.update({
        where: { id: baseData.invoice.id },
        data: { status: InvoiceStatus.FAILED },
      });
      throw error;
    }
  }

  /**
   * Safe execution hook triggered entirely from validated Webhook contexts to apply service provisioning.
   */
  // FIXED: Changed 'gatewayData: any' to typed interface reference
  static async fulfillOrder(merchantRef: string, orderTrackingId: string, gatewayData: PesapalTransactionPayload) {
    return await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findFirst({
        where: { invoiceNo: merchantRef },
        include: { subscription: { include: { plan: true } } },
      });

      if (!invoice) throw new Error(`Target record not matched for processing reference token: ${merchantRef}`);
      if (invoice.status === InvoiceStatus.PAID) return true;

      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          status: InvoiceStatus.PAID,
          paidAt: new Date(),
        },
      });

      // FIXED: Save the confirmation code from gateway data so refund requests have access to it
      const payment = await tx.payment.create({
        data: {
          invoiceId: invoice.id,
          amount: invoice.amount,
          provider: "PESAPAL",
          providerRef: orderTrackingId,
          confirmationCode: gatewayData.confirmation_code || orderTrackingId, 
        },
      });

      if (invoice.subscription) {
        const extensionDays = invoice.subscription.plan.billingCycle === "YEARLY" ? 365 : 30;
        
        // IMPROVEMENT: If they renew early, append to their current end date instead of stripping their remaining days
        const currentEnd = invoice.subscription.currentPeriodEnd && invoice.subscription.currentPeriodEnd > new Date()
          ? invoice.subscription.currentPeriodEnd
          : new Date();
          
        const nextPeriodEnd = new Date(currentEnd.getTime() + extensionDays * 24 * 60 * 60 * 1000);

        await tx.organizationSubscription.update({
          where: { id: invoice.subscription.id },
          data: {
            status: SubscriptionStatus.ACTIVE,
            currentPeriodStart: new Date(),
            currentPeriodEnd: nextPeriodEnd,
            gracePeriodEndsAt: null,
          },
        });

        await tx.organization.update({
          where: { id: invoice.organizationId },
          data: { status: "ACTIVE" },
        });

        await tx.auditLog.create({
          data: {
            organizationId: invoice.organizationId,
            userId: null, 
            action: "SUBSCRIPTION_FULFILLED_WEBHOOK",
            entity: "OrganizationSubscription",
            entityId: invoice.subscription.id,
            oldValues: {
              status: invoice.subscription.status,
              currentPeriodEnd: invoice.subscription.currentPeriodEnd?.toISOString() || null,
            },
            newValues: {
              status: SubscriptionStatus.ACTIVE,
              currentPeriodEnd: nextPeriodEnd.toISOString(),
              paymentId: payment.id,
              invoiceStatus: InvoiceStatus.PAID,
              pesapalOrderTrackingId: orderTrackingId,
              pesapalMerchantRef: merchantRef,
              paymentMethod: gatewayData.payment_method || "UNKNOWN",
              gatewayStatusCode: String(gatewayData.status_code || ""),
            },
          },
        });
      }

      return true;
    });
  }

  /**
   * Revokes an incomplete checkout journey before completion occurs
   */
  static async cancelPendingOrder(invoiceId: string, userId: string) {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice || !invoice.pesapalTrackingId) {
      throw new Error("No active tracking tokens found to process cancellation request.");
    }
    
    if (invoice.status === InvoiceStatus.PAID) {
      throw new Error("Cannot cancel an invoice that has already been paid.");
    }

    const res = await cancelPesapalOrder(invoice.pesapalTrackingId);
    if (res.status === "200") {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: InvoiceStatus.CANCELLED }
      });

      await prisma.auditLog.create({
        data: {
          organizationId: invoice.organizationId,
          userId,
          action: "INVOICE_CANCELLED_BY_USER",
          entity: "Invoice",
          entityId: invoice.id,
          oldValues: { status: invoice.status },
          newValues: { status: InvoiceStatus.CANCELLED, pesapalMsg: res.message }
        }
      });
      return { success: true, message: res.message };
    }

    throw new Error(res.message || "Pesapal refused order structural cancellation parameters.");
  }

  /**
   * Submits a formal refund request through the network
   */
  static async executeRefund(paymentId: string, requestedByUsername: string, reason: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { invoice: true }
    });

    if (!payment || !payment.confirmationCode) {
      throw new Error("Payment record lacks valid banking confirmation token properties.");
    }

    const res = await requestPesapalRefund({
      confirmation_code: payment.confirmationCode,
      amount: Number(payment.amount),
      username: requestedByUsername,
      remarks: reason
    });

    if (res.status === "200") {
      await prisma.invoice.update({
        where: { id: payment.invoiceId },
        data: { status: InvoiceStatus.REFUNDED } 
      });

      await prisma.auditLog.create({
        data: {
          organizationId: payment.invoice.organizationId,
          userId: null,
          action: "PAYMENT_REFUND_INITIATED",
          entity: "Payment",
          entityId: payment.id,
          oldValues: { invoiceStatus: "PAID" },
          newValues: { invoiceStatus: "REFUNDED", serverRemarks: res.message }
        }
      });
      return { success: true, message: res.message };
    }

    throw new Error(res.message || "Pesapal refused processing refund guidelines parameters.");
  }
}