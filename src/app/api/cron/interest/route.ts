import { NextRequest, NextResponse } from "next/server";
import { secureEndpoint } from "@/app/api/route-wrapper";
import { SavingsInterestEngine } from "@/services/interest/accumulator-service";
import { getAuthenticatedSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

export const POST = secureEndpoint(
  async (req: NextRequest) => {
    const session = await getAuthenticatedSession();
    
    // 1. Verify cron worker access tokens
    if (session?.userId === "VERCEL_CRON_WORKER" && !session.organizationId) {
      const { searchParams } = new URL(req.url);
      const manualTargetOrg = searchParams.get("organizationId");

      if (manualTargetOrg) {
        const jobReport = await SavingsInterestEngine.processDailyInterestAccrual(manualTargetOrg);
        return NextResponse.json({ success: true, executions: [jobReport] });
      }

      // Loop through all active organizations sequentially
      const organizations = await prisma.organization.findMany({
        where: { status: "ACTIVE" },
        select: { id: true }
      });

      const jobReports = [];
      for (const org of organizations) {
        const jobReport = await SavingsInterestEngine.processDailyInterestAccrual(org.id);
        jobReports.push(jobReport);
      }

      return NextResponse.json({
        success: true,
        processedCount: organizations.length,
        executions: jobReports
      });
    }

    // 2. Direct manual trigger path for users with high-level access
    const targetOrgId = session?.organizationId || "";
    const jobReport = await SavingsInterestEngine.processDailyInterestAccrual(targetOrgId);

    return NextResponse.json({
      success: true,
      executions: [jobReport]
    });
  },
  {
    requiredPermission: "audit:read" // Restricts manual overrides strictly to verified roles
  }
);