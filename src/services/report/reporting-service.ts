import { prisma } from "@/lib/prisma/client";

export interface ReportPayload {
  reportType: string;
  generatedAt: Date;
  data: Record<string, unknown>;
}

export const ReportingEngine = {
  /**
   * Generates a multi-tenant Trial Balance report.
   */
  async getTrialBalance(organizationId: string): Promise<ReportPayload> {
    const activeSavings = await prisma.savingsAccount.aggregate({
      where: { organizationId, status: "ACTIVE" },
      _sum: { balance: true }
    });

    const activeLoans = await prisma.loan.aggregate({
      where: { organizationId, status: { not: "CANCELLED" } },
      _sum: { outstandingBalance: true }
    });

    return {
      reportType: "TRIAL_BALANCE",
      generatedAt: new Date(),
      data: {
        totalSavingsBalance: activeSavings._sum.balance?.toNumber() || 0,
        totalLoanExposure: activeLoans._sum.outstandingBalance?.toNumber() || 0
      }
    };
  },

  /**
   * Generates a Portfolio Health report for loan risk monitoring.
   */
  async getLoanPortfolioHealth(organizationId: string): Promise<ReportPayload> {
    const portfolio = await prisma.loan.groupBy({
      by: ["status"],
      where: { organizationId },
      _count: { id: true },
      _sum: { outstandingBalance: true }
    });

    return {
      reportType: "LOAN_PORTFOLIO_HEALTH",
      generatedAt: new Date(),
      data: {
        breakdown: portfolio.map(p => ({
          status: p.status,
          count: p._count.id,
          totalExposure: p._sum.outstandingBalance?.toNumber() || 0
        }))
      }
    };
  },

  /**
   * Generates an Audit Report of collected interest and maintenance fees.
   */
  async getRevenueAudit(organizationId: string, startDate: Date, endDate: Date): Promise<ReportPayload> {
    const transactions = await prisma.financialTransaction.findMany({
      where: {
        organizationId,
        createdAt: { gte: startDate, lte: endDate },
        type: { in: ["DEPOSIT", "WITHDRAWAL"] } 
      },
      select: { amount: true, type: true, description: true }
    });

    return {
      reportType: "REVENUE_AUDIT",
      generatedAt: new Date(),
      data: {
        period: { start: startDate, end: endDate },
        transactions
      }
    };
  }
};