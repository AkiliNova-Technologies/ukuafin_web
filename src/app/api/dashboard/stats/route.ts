import { NextResponse } from "next/server";
import { secureEndpoint } from "@/app/api/route-wrapper";
import { prisma } from "@/lib/prisma/client";
import { LoanStatus, Prisma } from "@prisma/client";

export const GET = secureEndpoint(
  async () => {
    try {
      const [
        totalMembers,
        savingsAggregate,
        sharesAggregate,
        loanAggregate,
        delinquentLoansCount
      ] = await Promise.all([
        prisma.member.count({
          where: { status: "ACTIVE" }
        }),

        prisma.savingsAccount.aggregate({
          where: { status: "ACTIVE" },
          _sum: { balance: true }
        }),

        prisma.shareAccount.aggregate({
          where: { status: "ACTIVE" },
          _sum: { shareValue: true }
        }),

        prisma.loan.aggregate({
          where: { status: "ACTIVE" as LoanStatus },
          _sum: { outstandingBalance: true } 
        }),

        prisma.loan.count({
          where: {
            status: "ACTIVE" as LoanStatus,
            dueDate: { lt: new Date() },
            outstandingBalance: { gt: 0 }
          }
        })
      ]);

      // Natively parsing values out of un-typed Prisma sum structures
      const savingsSum = savingsAggregate._sum as Record<string, unknown>;
      const sharesSum = sharesAggregate._sum as Record<string, unknown>;
      const loanSum = loanAggregate._sum as Record<string, unknown>;

      const savingsBalance = savingsSum?.balance as Prisma.Decimal | null | undefined;
      const sharesValue = sharesSum?.shareValue as Prisma.Decimal | null | undefined;
      const loanBalance = loanSum?.outstandingBalance as Prisma.Decimal | null | undefined;

      const totalSavingsReserves = savingsBalance?.toNumber() || 0;
      const totalShareCapital = sharesValue?.toNumber() || 0;
      const outstandingLoanPortfolio = loanBalance?.toNumber() || 0;

      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const transactionalHistoryGroupings = await prisma.financialTransaction.groupBy({
        by: ["type", "createdAt"],
        where: {
          status: "COMPLETED",
          createdAt: { gte: sixMonthsAgo }
        },
        _sum: { amount: true }
      });

      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        metrics: {
          activeMembersCount: totalMembers,
          totalSavingsReserves,
          totalShareCapital,
          outstandingLoanPortfolio,
          delinquentRiskCount: delinquentLoansCount,
          portfolioAtRiskPercentage: outstandingLoanPortfolio 
            ? ((delinquentLoansCount / totalMembers) * 100)
            : 0
        },
        trendsRawSummary: transactionalHistoryGroupings.map(group => ({
          type: group.type,
          date: group.createdAt,
          volume: group._sum.amount?.toNumber() || 0
        }))
      });
    } catch (error) {
      console.error("[DASHBOARD_STATS_API_FAILURE]: Accumulator processing error:", error);
      return NextResponse.json(
        { error: "Failed to assemble systemic analytics summaries natively." },
        { status: 500 }
      );
    }
  },
  {
    requiredPermission: "report:view"
  }
);