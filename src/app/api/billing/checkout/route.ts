import { NextResponse } from "next/server";
import { PesapalBillingService } from "@/services/billing/pesapal-service";
import { prisma } from "@/lib/prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { organizationId, planId, userId } = body;

    if (!organizationId || !planId) {
      return NextResponse.json(
        { error: "Missing required organizationId or planId parameters." },
        { status: 400 }
      );
    }

    const checkoutUrl = await PesapalBillingService.initiateCheckout(
      organizationId,
      planId,
      userId
    );

    await prisma.auditLog.create({
      data: {
        organizationId: organizationId,
        userId: userId || null,
        action: "INVOICE_CHECKOUT_INITIATED",
        entity: "Invoice",
        entityId: organizationId,
        oldValues: {},
        newValues: {
          planId,
          checkoutUrl,
          initiatedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({ url: checkoutUrl });
  } catch (error: unknown) {
    console.error("Checkout error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to initialize checkout";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}