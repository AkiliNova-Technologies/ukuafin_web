// src/app/api/billing/manual/route.ts
import { NextRequest, NextResponse } from "next/server";
import { secureEndpoint } from "@/app/api/route-wrapper";
import { SavingsBillingEngine } from "@/services/billing/maintenance-service";

export const POST = secureEndpoint(
  async (req: NextRequest) => {
    try {
      const body = (await req.json()) as Record<string, unknown>;
      const targetAccountId = body.accountId as string;

      if (!targetAccountId) {
        return NextResponse.json(
          { error: "Missing required field: accountId" },
          { status: 400 },
        );
      }

      const settlement =
        await SavingsBillingEngine.processManualSingleBilling(targetAccountId);

      return NextResponse.json({
        success: true,
        message: "Monthly maintenance fee processed and cleared manually.",
        balance: settlement.balanceAfterFee,
      });
    } catch (error) {
      console.error("[MANUAL_BILLING_DISPATCH_FAILURE]:", error);
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Failed to execute manual fee settlement.",
        },
        { status: 500 },
      );
    }
  },
  {
    requiredPermission: "audit:read",
  },
);

export async function GET() {
  if (
    process.env.NODE_ENV === "production" &&
    !process.env.ALLOW_IPN_REGISTRATION_PROD
  ) {
    return NextResponse.json(
      { error: "Not authorized in this environment context." },
      { status: 403 },
    );
  }

  const PESAPAL_BASE_URL =
    process.env.NODE_ENV === "production"
      ? "https://pay.pesapal.com/v3/api"
      : "https://cybqa.pesapal.com/pesapalv3/api";
  const CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY;
  const CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;
  const MY_DOMAIN =
    process.env.NEXT_PUBLIC_APP_URL || "https://ukuafin.vercel.app";

  try {
    const authRes = await fetch(`${PESAPAL_BASE_URL}/Auth/RequestToken`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        consumer_key: CONSUMER_KEY,
        consumer_secret: CONSUMER_SECRET,
      }),
    });

    const authData = await authRes.json();
    const token = authData.token;

    if (!token) {
      return NextResponse.json(
        {
          error: "Failed to grab bearer token from Pesapal.",
          details: authData,
        },
        { status: 400 },
      );
    }

    const ipnRes = await fetch(`${PESAPAL_BASE_URL}/URLSetup/RegisterIPN`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        url: `${MY_DOMAIN}/api/webhooks/pesapal`,
        ipn_notification_type: "POST",
      }),
    });

    const ipnData = await ipnRes.json();

    return NextResponse.json({
      success: true,
      message: "IPN Key Successfully Retrieved!",
      ipn_id: ipnData.ipn_id,
      raw: ipnData,
    });
  } catch (error: unknown) {
    // FIXED: Removed explicit 'any' error type assignment to bypass strict build restrictions
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to execute registration routing task.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
