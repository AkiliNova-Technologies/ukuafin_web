import { NextRequest, NextResponse } from "next/server";
import { secureEndpoint } from "@/app/api/route-wrapper";
import { LedgerReconciliationEngine } from "@/services/ledger/reconciliation-service";
import { getAuthenticatedSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

export const POST = secureEndpoint(
  async (req: NextRequest) => {
    const session = await getAuthenticatedSession();
    
    if (session?.userId === "VERCEL_CRON_WORKER" && !session.organizationId) {
      const { searchParams } = new URL(req.url);
      const manualTargetOrg = searchParams.get("organizationId");

      if (manualTargetOrg) {
        const diagnosticReport = await LedgerReconciliationEngine.executeGlobalDailyReconciliation(manualTargetOrg);
        return NextResponse.json({ success: true, targets: [diagnosticReport] });
      }

      // 2. Otherwise loop through active tenant spaces securely
      const organizations = await prisma.organization.findMany({
        where: { status: "ACTIVE" },
        select: { id: true }
      });

      const reports = [];
      for (const org of organizations) {
        const report = await LedgerReconciliationEngine.executeGlobalDailyReconciliation(org.id);
        reports.push(report);
      }

      return NextResponse.json({ success: true, processedCount: organizations.length, targets: reports });
    }

    const targetOrgId = session?.organizationId || "";
    const diagnosticReport = await LedgerReconciliationEngine.executeGlobalDailyReconciliation(targetOrgId);

    return NextResponse.json({
      success: true,
      targets: [diagnosticReport]
    });
  },
  {
    requiredPermission: "audit:read"
  }
);