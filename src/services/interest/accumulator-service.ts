import { prisma } from "@/lib/prisma/client";
import { Prisma } from "@prisma/client";

export interface InterestJobResult {
  executionDate: string;
  accountsProcessedCount: number;
  totalInterestCapitalized: number;
}

export const SavingsInterestEngine = {
  /**
   * Scans active savings positions, calculates daily prorated interest splits,
   * capitalizes balances, and writes supporting financial ledger entries.
   */
  async processDailyInterestAccrual(organizationId: string): Promise<InterestJobResult> {
    const processDate = new Date();
    
    // 1. Fetch active savings accounts matching multi-tenant bounds
    const savingsAccounts = await prisma.savingsAccount.findMany({
      where: {
        organizationId,
        status: "ACTIVE",
        balance: { gt: 0 }
      }
    });

    let accountsProcessedCount = 0;
    let accumulatedInterestSum = 0;

    for (const account of savingsAccounts) {
      const currentBalance = account.balance;

      // 2. Safely read product interest fields from the record using structural overrides
      const annualRate = (account as Record<string, unknown>).interestRate instanceof Prisma.Decimal
        ? ((account as Record<string, unknown>).interestRate as Prisma.Decimal).toNumber()
        : Number((account as Record<string, unknown>).interestRate || 8.5);

      const minRequiredBalance = (account as Record<string, unknown>).minimumBalanceForInterest instanceof Prisma.Decimal
        ? ((account as Record<string, unknown>).minimumBalanceForInterest as Prisma.Decimal).toNumber()
        : Number((account as Record<string, unknown>).minimumBalanceForInterest || 0);

      // Skip processing if account balance doesn't meet requirements
      if (currentBalance.toNumber() < minRequiredBalance || annualRate <= 0) {
        continue;
      }

      // 3. Compute daily interest yield fraction: (Balance * (Rate / 100)) / 365 days
      const dailyInterestYield = currentBalance
        .mul(new Prisma.Decimal(annualRate).div(100))
        .div(365);

      const capitalizedAmount = dailyInterestYield.toNumber();

      if (capitalizedAmount > 0.0001) {
        accumulatedInterestSum += capitalizedAmount;
        accountsProcessedCount++;

        // 4. Update account balance and append transaction logs using active ledger relations
        await prisma.$transaction([
          prisma.savingsAccount.update({
            where: { id: account.id },
            data: {
              balance: { increment: dailyInterestYield }
            }
          }),
          
          prisma.financialTransaction.create({
            data: {
              amount: dailyInterestYield,
              type: "INTEREST",
              status: "COMPLETED",
              reference: `INT-ACCRUE-${account.id}-${processDate.toISOString().split("T")[0]}`,
              description: `Daily automated savings capitalization at annualized rate of ${annualRate}%`,
              organizationId: account.organizationId,
              branchId: account.branchId,
              savingsAccountId: account.id // FIX: Dropped 'memberId' to align with schema requirements
            }
          })
        ]);
      }
    }

    // 5. Log batch summary to audits
    if (accountsProcessedCount > 0) {
      await prisma.auditLog.create({
        data: {
          action: "DAILY_INTEREST_DISTRIBUTION_COMPLETE",
          entity: "SAVINGS_ACCOUNT",
          entityId: organizationId,
          userId: "SYSTEM_INTEREST_JOB_WORKER",
          oldValues: {},
          newValues: {
            totalProcessed: accountsProcessedCount,
            totalCapitalizedVolume: accumulatedInterestSum
          }
        }
      });
    }

    return {
      executionDate: processDate.toISOString().split("T")[0],
      accountsProcessedCount,
      totalInterestCapitalized: accumulatedInterestSum
    };
  }
};