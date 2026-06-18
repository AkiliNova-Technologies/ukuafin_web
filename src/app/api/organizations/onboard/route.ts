import { NextResponse } from "next/server";
import { BillingService } from "@/services/billing/billing-service";
import { getAuthenticatedSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const session = await getAuthenticatedSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Access credentials structural footprint validation failed." }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, taxIdentifier, planId } = body; // Destructure standard baseline infrastructure record IDs directly

    if (!name || !slug || !planId) {
      return NextResponse.json({ error: "Missing required properties: name, slug, or planId." }, { status: 400 });
    }

    const cluster = await BillingService.provisionOrganization({
      name,
      slug,
      taxIdentifier,
      adminUserId: session.userId,
      planId: planId,
    });

    return NextResponse.json({ success: true, data: cluster }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Tenancy initialization engine failure.";
    console.error("[ORGANIZATION_ONBOARDING_ROUTE_ERROR]:", error);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}