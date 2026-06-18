"use server";

import { PesapalBillingService } from "@/services/billing/pesapal-service";
import { redirect } from "next/navigation";

export async function handlePlanCheckout(formData: { planId: string; organizationId: string; userId: string }) {
  let redirectUrl: string;

  try {
    redirectUrl = await PesapalBillingService.initiateCheckout(
      formData.organizationId,
      formData.planId,
      formData.userId
    );
  } catch (error) {
    console.error("SERVER_ACTION_CHECKOUT_FAILED:", error);
    throw new Error("Could not process your checkout request at this time.");
  }

  if (redirectUrl) {
    redirect(redirectUrl);
  }
}