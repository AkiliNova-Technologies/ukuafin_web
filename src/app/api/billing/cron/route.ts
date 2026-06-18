import { NextRequest, NextResponse } from "next/server";
import { secureEndpoint } from "@/app/api/route-wrapper";
import { SavingsBillingEngine } from "@/services/billing/maintenance-service";
import { getAuthenticatedSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

export const POST = secureEndpoint(
  async (req: NextRequest) => {
    const session = await getAuthenticatedSession();
    
    if (session?.userId === "VERCEL_CRON_WORKER" && !session.organizationId) {
      const { searchParams } = new URL(req.url);
      const manualTargetOrg = searchParams.get("organizationId");

      if (manualTargetOrg) {
        const billingReport = await SavingsBillingEngine.processAutomatedMonthlyBilling(manualTargetOrg);
        return NextResponse.json({ success: true, runs: [billingReport] });
      }

      const organizations = await prisma.organization.findMany({
        where: { status: "ACTIVE" },
        select: { id: true }
      });

      const billingReports = [];
      for (const org of organizations) {
        const billingReport = await SavingsBillingEngine.processAutomatedMonthlyBilling(org.id);
        billingReports.push(billingReport);
      }

      return NextResponse.json({
        success: true,
        processedCount: organizations.length,
        runs: billingReports
      });
    }

    const targetOrgId = session?.organizationId || "";
    const billingReport = await SavingsBillingEngine.processAutomatedMonthlyBilling(targetOrgId);

    return NextResponse.json({
      success: true,
      runs: [billingReport]
    });
  },
  {
    requiredPermission: "audit:read"
  }
);