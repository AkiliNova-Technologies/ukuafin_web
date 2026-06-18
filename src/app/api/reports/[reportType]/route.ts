import { NextResponse } from "next/server";
import { secureEndpoint } from "@/app/api/route-wrapper";
import { ReportingEngine } from "@/services/report/reporting-service";
import { getAuthenticatedSession } from "@/lib/auth/session";

export const GET = secureEndpoint(
  async (_req, context) => {
    // Await the asynchronous params object provided by Next.js 15+
    const { reportType } = await context.params;
    const session = await getAuthenticatedSession();
    const orgId = session?.organizationId;

    if (!orgId) {
      return NextResponse.json({ error: "Context missing" }, { status: 400 });
    }

    try {
      const type = Array.isArray(reportType) ? reportType[0] : reportType;
      
      let report;
      if (type === "trial-balance") report = await ReportingEngine.getTrialBalance(orgId);
      else if (type === "loan-health") report = await ReportingEngine.getLoanPortfolioHealth(orgId);
      else return NextResponse.json({ error: "Invalid report type" }, { status: 404 });

      return NextResponse.json(report);
    } catch {
      // Removing the 'error' variable entirely satisfies the "unused-vars" rule
      return NextResponse.json({ error: "Report generation failed" }, { status: 500 });
    }
  },
  { requiredPermission: "report:view" }
);