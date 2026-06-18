import { prisma } from "@/lib/prisma/client";
import { Prisma } from "@prisma/client";

export interface BillingJobResult {
  executionDate: string;
  accountsBilledCount: number;
  totalFeesCollected: number;
}

export const SavingsBillingEngine = {
  /**
   * RUNS VIA CRON: Processes accounts configured for automated monthly deductions.
   */
  async processAutomatedMonthlyBilling(organizationId: string): Promise<BillingJobResult> {
    const processDate = new Date();
    const monthlyFeeAmount = new Prisma.Decimal(100.00); // KES 100.00
    let accountsBilledCount = 0;
    let accumulatedFeesSum = 0;

    // 1. Fetch ONLY accounts set to AUTOMATIC billing
    // Note: Using a fallback strategy if 'billingMode' isn't fully migrated in your schema yet
    const savingsAccounts = await prisma.savingsAccount.findMany({
      where: {
        organizationId,
        status: "ACTIVE"
      }
    });

    for (const account of savingsAccounts) {
      // Structural check: Skip this account if it has explicitly opted into MANUAL payments
      const accountMode = (account as Record<string, unknown>).billingMode as string | undefined;
      if (accountMode === "MANUAL") {
        
        // OPTIONAL: Create a pending invoice entry here if your schema tracks them
        continue; 
      }

      accountsBilledCount++;
      accumulatedFeesSum += monthlyFeeAmount.toNumber();

      await this.executeDebitTransaction(account, monthlyFeeAmount, processDate);
    }

    return {
      executionDate: processDate.toISOString().split("T")[0],
      accountsBilledCount,
      totalFeesCollected: accumulatedFeesSum
    };
  },

  /**
   * TRIGGERED VIA USER/ADMIN UI: Instantly bills a specific account manually.
   */
  async processManualSingleBilling(accountId: string): Promise<{ success: boolean; balanceAfterFee: number }> {
    const processDate = new Date();
    const monthlyFeeAmount = new Prisma.Decimal(100.00);

    const account = await prisma.savingsAccount.findUnique({
      where: { id: accountId }
    });

    if (!account || account.status !== "ACTIVE") {
      throw new Error("Target account is inactive or could not be found.");
    }

    const updatedAccount = await this.executeDebitTransaction(account, monthlyFeeAmount, processDate);

    return {
      success: true,
      balanceAfterFee: updatedAccount.balance.toNumber()
    };
  },

  /**
   * Helper utility to keep atomicity dry and robust.
   */
  async executeDebitTransaction(
    account: Record<string, unknown> & { id: string; balance: Prisma.Decimal; organizationId: string; branchId: string | null },
    fee: Prisma.Decimal,
    date: Date
  ) {
    const [updatedAccount] = await prisma.$transaction([
      prisma.savingsAccount.update({
        where: { id: account.id },
        data: { balance: { decrement: fee } }
      }),
      
      prisma.financialTransaction.create({
        data: {
          amount: fee,
          type: "WITHDRAWAL",
          status: "COMPLETED",
          reference: `FEE-MAINT-${account.id}-${date.getFullYear()}-${date.getMonth() + 1}`,
          description: `Monthly system ledger maintenance service fee collection`,
          organizationId: account.organizationId,
          branchId: account.branchId,
          savingsAccountId: account.id
        }
      })
    ]);

    if (account.balance.sub(fee).toNumber() < 0) {
      await prisma.auditLog.create({
        data: {
          action: "ACCOUNT_OVERDRAWN_BY_FEES",
          entity: "SAVINGS_ACCOUNT",
          entityId: account.id,
          userId: "SYSTEM_BILLING_WORKER",
          oldValues: { balanceBeforeFee: account.balance.toNumber() },
          newValues: { balanceAfterFee: account.balance.sub(fee).toNumber() }
        }
      });
    }

    return updatedAccount;
  }
};