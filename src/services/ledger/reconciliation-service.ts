import { prisma } from "@/lib/prisma/client";
import { Prisma } from "@prisma/client";

export interface ReconciliationSummary {
  reconDate: string;
  totalTransactionsProcessed: number;
  accumulatedVolume: number;
  unbalancedAccountsCount: number;
}

export const LedgerReconciliationEngine = {
  /**
   * Scans transaction registers and compares asset updates 
   * against active account definitions to ensure general ledger balances match.
   */
  async executeGlobalDailyReconciliation(organizationId: string): Promise<ReconciliationSummary> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 1. Pull daily transaction aggregates safely via BigInt/Decimal mappings
    const transactionSummary = await prisma.financialTransaction.aggregate({
      where: {
        createdAt: { gte: startOfToday },
        status: "COMPLETED"
      },
      _count: { id: true },
      _sum: { amount: true }
    });

    const totalCount = transactionSummary._count.id;
    const totalSumDecimal = (transactionSummary._sum as Record<string, Prisma.Decimal | null | undefined>).amount;
    const totalVolume = totalSumDecimal?.toNumber() || 0;

    // 2. Audit check: Scan for accounts whose running balances do not match their actual itemized transaction ledger sums
    const savingsAccounts = await prisma.savingsAccount.findMany({
      where: { organizationId, status: "ACTIVE" },
      select: {
        id: true,
        balance: true,
        transactions: {
          where: { status: "COMPLETED" },
          select: { amount: true, type: true }
        }
      }
    });

    let anomalousAccountsCount = 0;

    for (const account of savingsAccounts) {
      let calculatedSum = 0;

      for (const tx of account.transactions) {
        const txAmount = tx.amount.toNumber();
        if (tx.type === "DEPOSIT" || tx.type === "INTEREST") {
          calculatedSum += txAmount;
        } else if (tx.type === "WITHDRAWAL") {
          calculatedSum -= txAmount;
        }
      }

      const structuralDifference = Math.abs(account.balance.toNumber() - calculatedSum);
      
      // Flags discrepancies larger than a fractional precision ceiling (e.g., 0.01)
      if (structuralDifference > 0.01) {
        anomalousAccountsCount++;
        
        // Log the balancing anomaly for manual ledger review teams
        await prisma.auditLog.create({
          data: {
            action: "LEDGER_MISMATCH_DETECTED",
            entity: "SAVINGS_ACCOUNT",
            entityId: account.id,
            userId: "SYSTEM_RECON_REPORTER",
            oldValues: { balanceSnapshot: account.balance.toNumber() },
            newValues: { expectedCalculatedBalance: calculatedSum, variance: structuralDifference }
          }
        });
      }
    }

    return {
      reconDate: startOfToday.toISOString().split("T")[0],
      totalTransactionsProcessed: totalCount,
      accumulatedVolume: totalVolume,
      unbalancedAccountsCount: anomalousAccountsCount
    };
  }
};