import { NextResponse } from "next/server";
import { BillingService } from "@/services/billing/billing-service";
import { getAuthenticatedSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const session = await getAuthenticatedSession();
    if (!session?.organizationId || !session.userId) {
      return NextResponse.json(
        { error: "Access credentials structural footprint validation failed." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amountPaid, invoiceId, reference } = body;

    if (!amountPaid || !invoiceId || !reference) {
      return NextResponse.json(
        { error: "Missing required properties: amountPaid, invoiceId, or reference." },
        { status: 400 }
      );
    }

    const updatedInvoice = await BillingService.recordInvoicePayment({
      organizationId: session.organizationId,
      amountPaid: parseFloat(amountPaid),
      invoiceId,
      reference,
    });

    return NextResponse.json({ success: true, data: updatedInvoice }, { status: 200 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Invoice settlement execution failure.";
    console.error("[INVOICE_RECORD_PAYMENT_ROUTE_ERROR]:", error);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}