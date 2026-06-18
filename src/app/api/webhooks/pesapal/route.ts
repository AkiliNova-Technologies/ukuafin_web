// src/app/api/webhooks/pesapal/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { verifyPesapalTransaction } from "@/lib/pesapal/client";
import { PesapalBillingService } from "@/services/billing/pesapal-service";
import { WebhookProcessStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  let logRecordId: string | null = null;
  
  try {
    // Note: Assumes IPN URL registration was explicitly set to "POST"
    const body = await req.json();
    const { OrderTrackingId, OrderMerchantReference, OrderNotificationType } = body;

    if (!OrderTrackingId || !OrderMerchantReference) {
      return NextResponse.json({ error: "Malformed payload structure detected." }, { status: 400 });
    }

    const existingProcessedLog = await prisma.pesapalWebhookLog.findFirst({
      where: {
        orderTrackingId: OrderTrackingId,
        status: WebhookProcessStatus.PROCESSED,
      },
    });

    if (existingProcessedLog) {
      return NextResponse.json({
        orderNotificationType: "IPNCHANGE",
        orderTrackingId: OrderTrackingId,
        orderMerchantReference: OrderMerchantReference,
        status: 200,
      }, { status: 200 });
    }

    // 2. Create audit trace log inside the DB vault immediately
    const log = await prisma.pesapalWebhookLog.create({
      data: {
        orderTrackingId: OrderTrackingId,
        merchantRef: OrderMerchantReference,
        eventType: OrderNotificationType || "IPN_ALERT",
        payload: body,
        status: WebhookProcessStatus.UNPROCESSED,
      },
    });
    logRecordId = log.id;

    // 3. Fetch payment state directly from Pesapal to prevent payload spoofing
    const paymentVerification = await verifyPesapalTransaction(OrderTrackingId);

    const statusCode = Number(paymentVerification.status_code);
    const isCompleted = statusCode === 1 || paymentVerification.payment_status_description?.toLowerCase() === "completed";

    if (isCompleted) {
      await PesapalBillingService.fulfillOrder(
        OrderMerchantReference, 
        OrderTrackingId, 
        paymentVerification
      );

      await prisma.pesapalWebhookLog.update({
        where: { id: logRecordId },
        data: { status: WebhookProcessStatus.PROCESSED },
      });
    } else {
      await prisma.pesapalWebhookLog.update({
        where: { id: logRecordId },
        data: { 
          status: WebhookProcessStatus.FAILED,
          errorMessage: `Payment status unresolved: ${paymentVerification.payment_status_description} (Code: ${statusCode})`,
        },
      });
    }

    return NextResponse.json({
      orderNotificationType: "IPNCHANGE",
      orderTrackingId: OrderTrackingId,
      orderMerchantReference: OrderMerchantReference,
      status: 200,
    }, { status: 200 });

  } catch (error: unknown) {
    // FIXED: Removed runtime 'any' variable type definition to satisfy strict compiler configurations
    console.error("WEBHOOK_HANDSHAKE_FATAL_ERROR:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown execution runtime fault.";

    if (logRecordId) {
      try {
        await prisma.pesapalWebhookLog.update({
          where: { id: logRecordId },
          data: { 
            status: WebhookProcessStatus.FAILED,
            errorMessage,
          },
        });
      } catch (dbError) {
        console.error("FAILED_TO_UPDATE_WEBHOOK_LOG_STATUS:", dbError);
      }
    }

    // Return a 500 status to prompt a standard retry fallback cycle from Pesapal
    return NextResponse.json({ error: "Internal processing flow execution fault." }, { status: 500 });
  }
}