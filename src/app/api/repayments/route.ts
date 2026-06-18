import { NextRequest, NextResponse } from "next/server";
import { secureEndpoint } from "@/app/api/route-wrapper";
import { LoanRepaymentEngine } from "@/services/repayment/repayment-service";
import { getAuthenticatedSession } from "@/lib/auth/session";

export const POST = secureEndpoint(
  async (req: NextRequest) => {
    try {
      const session = await getAuthenticatedSession();
      if (!session) {
        return NextResponse.json({ error: "Unauthorized endpoint execution session context access request." }, { status: 401 });
      }

      const body = (await req.json()) as Record<string, unknown>;
      const targetLoanId = body.loanId as string;
      const inboundAmount = Number(body.amount);

      if (!targetLoanId || isNaN(inboundAmount)) {
        return NextResponse.json(
          { error: "Validation parameters failed. Check structure for missing loanId or malformed payment amount values." },
          { status: 400 }
        );
      }

      const paymentDistributionReport = await LoanRepaymentEngine.processLoanRepayment(
        targetLoanId,
        inboundAmount,
        session.userId
      );

      return NextResponse.json({
        success: true,
        message: "Amortized financial asset repayment engine execution finished cleanly.",
        distribution: paymentDistributionReport
      });
    } catch (error) {
      console.error("[LOAN_REPAYMENT_ENGINE_CRASH]: Processing sequence exception:", error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "System balancing error encountered inside ledger routines." },
        { status: 500 }
      );
    }
  },
  {
    requiredPermission: "audit:read" // Ensure the executing client role holds necessary mutation profiles
  }
);