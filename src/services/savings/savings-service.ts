import { prisma } from "@/lib/prisma/client";
import { Prisma, AccountStatus, TransactionType, TransactionStatus } from "@prisma/client";

export interface OpenSavingsAccountInput {
  organizationId: string;
  branchId: string;
  memberId: string;
  name?: string;
}

export interface SavingsTransactionInput {
  organizationId: string;
  branchId: string;
  accountId: string;
  amount: number;
  reference?: string;
  narrative?: string;
  createdById: string;
}

interface LockedSavingsAccountRow {
  id: string;
  balance: number | string | Prisma.Decimal;
}

interface InterestExecutionReport {
  accountNo: string;
  added: string;
}

export const SavingsService = {
  /**
   * Initializes a new savings account ledger node for a verified member profile.
   */
  async openAccount(input: OpenSavingsAccountInput) {
    const member = await prisma.member.findFirst({
      where: { id: input.memberId, organizationId: input.organizationId, status: "ACTIVE" },
    });

    if (!member) {
      throw new Error("Target member profile is inactive or does not exist within your organization scope.");
    }

    const branch = await prisma.branch.findUnique({ where: { id: input.branchId } });
    if (!branch) throw new Error("Invalid operational branch context.");

    return await prisma.$transaction(async (tx) => {
      const globalAccountCount = await tx.savingsAccount.count({
        where: { organizationId: input.organizationId },
      });

      const padSequence = String(globalAccountCount + 1).padStart(6, "0");
      const accountNo = `${branch.code}-SAV-${padSequence}`;

      // FIX: Dropped invalid property 'productType' to conform strictly with your schema definitions
      const newAccount = await tx.savingsAccount.create({
        data: {
          organizationId: input.organizationId,
          branchId: input.branchId,
          memberId: input.memberId,
          accountNo,
          name: input.name || "Main Savings",
          balance: new Prisma.Decimal(0),
          status: "ACTIVE" as AccountStatus,
        },
      });

      // ATOMIC AUDIT LOG: Track account creation within the database transaction boundary
      await tx.auditLog.create({
        data: {
          organizationId: input.organizationId,
          userId: input.memberId,
          action: "SAVINGS_ACCOUNT_OPENED",
          entity: "SavingsAccount",
          entityId: newAccount.id,
          oldValues: {},
          newValues: { accountNo, name: newAccount.name, branchId: input.branchId },
        },
      });

      return newAccount;
    });
  },

  /**
   * Executes an atomic, balance-checked credit deposit transaction.
   */
  async deposit(input: SavingsTransactionInput) {
    if (input.amount <= 0) throw new Error("Deposit capital amount must be greater than zero.");

    return await prisma.$transaction(async (tx) => {
      const account = await tx.$queryRaw<LockedSavingsAccountRow[]>(
        Prisma.sql`SELECT id, balance FROM "SavingsAccount" WHERE id = ${input.accountId} AND "organizationId" = ${input.organizationId} FOR UPDATE`
      );

      if (!account || account.length === 0) {
        throw new Error("Target savings ledger account matrix node was missing or invalid.");
      }

      const currentBalance = new Prisma.Decimal(account[0].balance);
      const updatedBalance = currentBalance.add(input.amount);

      // FIX: Assigned explicit mapped TransactionType and TransactionStatus enums
      const transactionRecord = await tx.financialTransaction.create({
        data: {
          organizationId: input.organizationId,
          branchId: input.branchId,
          savingsAccountId: input.accountId,
          type: "DEPOSIT" as TransactionType,
          amount: new Prisma.Decimal(input.amount),
          reference: input.reference || `DEP-${Date.now()}`,
          description: input.narrative || "Regular cash deposit allocation.",
          status: "COMPLETED" as TransactionStatus,
          createdById: input.createdById,
        },
      });

      await tx.savingsAccount.update({
        where: { id: input.accountId },
        data: { balance: updatedBalance },
      });

      // ATOMIC AUDIT LOG: Log capital intake directly inside the database transaction
      await tx.auditLog.create({
        data: {
          organizationId: input.organizationId,
          userId: input.createdById,
          action: "SAVINGS_DEPOSIT_RECORDED",
          entity: "FinancialTransaction",
          entityId: transactionRecord.id,
          oldValues: { balanceBefore: currentBalance.toString() },
          newValues: { balanceAfter: updatedBalance.toString(), amount: input.amount, reference: transactionRecord.reference },
        },
      });

      return transactionRecord;
    });
  },

  /**
   * Executes an atomic, overdraft-locked debit withdrawal transaction.
   */
  async withdraw(input: SavingsTransactionInput) {
    if (input.amount <= 0) throw new Error("Withdrawal amount criteria metrics must be greater than zero.");

    return await prisma.$transaction(async (tx) => {
      const account = await tx.$queryRaw<LockedSavingsAccountRow[]>(
        Prisma.sql`SELECT id, balance FROM "SavingsAccount" WHERE id = ${input.accountId} AND "organizationId" = ${input.organizationId} FOR UPDATE`
      );

      if (!account || account.length === 0) {
        throw new Error("Target savings account was not found under your active tenant structure.");
      }

      const currentBalance = new Prisma.Decimal(account[0].balance);
      if (currentBalance.lt(input.amount)) {
        throw new Error(`Insufficient funds ledger restriction. Available balance is ${currentBalance.toFixed(2)}.`);
      }

      const updatedBalance = currentBalance.sub(input.amount);

      // FIX: Mapped types natively to schema enums
      const transactionRecord = await tx.financialTransaction.create({
        data: {
          organizationId: input.organizationId,
          branchId: input.branchId,
          savingsAccountId: input.accountId,
          type: "WITHDRAWAL" as TransactionType,
          amount: new Prisma.Decimal(input.amount),
          reference: input.reference || `WTH-${Date.now()}`,
          description: input.narrative || "Counter teller withdrawal payout.",
          status: "COMPLETED" as TransactionStatus,
          createdById: input.createdById,
        },
      });

      await tx.savingsAccount.update({
        where: { id: input.accountId },
        data: { balance: updatedBalance },
      });

      // ATOMIC AUDIT LOG: Secure the liability reduction track
      await tx.auditLog.create({
        data: {
          organizationId: input.organizationId,
          userId: input.createdById,
          action: "SAVINGS_WITHDRAWAL_RECORDED",
          entity: "FinancialTransaction",
          entityId: transactionRecord.id,
          oldValues: { balanceBefore: currentBalance.toString() },
          newValues: { balanceAfter: updatedBalance.toString(), amount: input.amount, reference: transactionRecord.reference },
        },
      });

      return transactionRecord;
    });
  },

  /**
   * Safe batch computation engine applying annualized interest splits to valid active ledgers.
   */
  async applyInterest(organizationId: string, annualRate: number, staffId: string) {
    if (annualRate <= 0) throw new Error("Annualized percentage compound metric parameters must be positive.");
    
    const monthlyMultiplier = annualRate / 12;

    const activeAccounts = await prisma.savingsAccount.findMany({
      where: { organizationId, status: "ACTIVE" as AccountStatus, balance: { gt: 0 } },
    });

    const executionReports: InterestExecutionReport[] = [];

    for (const account of activeAccounts) {
      try {
        await prisma.$transaction(async (tx) => {
          const currentBalance = new Prisma.Decimal(account.balance);
          const interestAccrued = currentBalance.mul(monthlyMultiplier);
          if (interestAccrued.lte(0.01)) return; 

          // FIX: Updated text body definitions from narrative to description and applied correct enums
          const transactionRecord = await tx.financialTransaction.create({
            data: {
              organizationId,
              branchId: account.branchId,
              savingsAccountId: account.id,
              type: "INTEREST" as TransactionType,
              amount: interestAccrued,
              reference: `INT-${Date.now()}-${account.id.slice(-4)}`,
              description: `Monthly interest accrued at an annualized yield rate of ${(annualRate * 100).toFixed(2)}%.`,
              status: "COMPLETED" as TransactionStatus,
              createdById: staffId,
            },
          });

          const updatedBalance = currentBalance.add(interestAccrued);

          await tx.savingsAccount.update({
            where: { id: account.id },
            data: { balance: updatedBalance },
          });

          // ATOMIC AUDIT LOG: Record system-driven interest capitalization events 
          await tx.auditLog.create({
            data: {
              organizationId,
              userId: staffId,
              action: "SAVINGS_INTEREST_CAPITALIZED",
              entity: "FinancialTransaction",
              entityId: transactionRecord.id,
              oldValues: { balanceBefore: currentBalance.toString() },
              newValues: { balanceAfter: updatedBalance.toString(), interestAmount: interestAccrued.toString() },
            },
          });

          executionReports.push({ accountNo: account.accountNo, added: interestAccrued.toFixed(2) });
        });
      } catch (error) {
        console.error(`[INTEREST_COMPUTE_CRASH] Failed to execute interest on account ${account.accountNo}:`, error);
      }
    }

    return executionReports;
  }
};