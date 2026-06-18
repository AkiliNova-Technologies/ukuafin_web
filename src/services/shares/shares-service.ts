import { prisma } from "@/lib/prisma/client";
import { Prisma, AccountStatus, TransactionType, TransactionStatus } from "@prisma/client";

export interface InitializeShareAccountInput {
  organizationId: string;
  memberId: string;
  sharePrice: number;
}

export interface PurchaseSharesInput {
  organizationId: string;
  branchId: string;
  memberId: string;
  shareAccountId: string;
  amountPaid: number;
  reference?: string;
  narrative?: string;
  createdById: string;
}

export interface TransferSharesInput {
  organizationId: string;
  branchId: string;
  sourceMemberId: string;
  sourceShareAccountId: string;
  destinationMemberId: string;
  destinationShareAccountId: string;
  shareCountToTransfer: number;
  createdById: string;
}

interface LockedShareAccountRow {
  id: string;
  shares: number | string | Prisma.Decimal;
  shareValue: number | string | Prisma.Decimal;
}

export const SharesService = {
  /**
   * Provisions a brand new structural equity stake profile node for a member.
   */
  async initializeAccount(input: InitializeShareAccountInput) {
    const member = await prisma.member.findFirst({
      where: { id: input.memberId, organizationId: input.organizationId, status: "ACTIVE" },
    });

    if (!member) {
      throw new Error("Target member profile must be active within your tenant perimeter.");
    }

    const existingAccount = await prisma.shareAccount.findFirst({
      where: { memberId: input.memberId, organizationId: input.organizationId },
    });

    if (existingAccount) {
      throw new Error("This cooperative member already possesses an initialized share equity account node.");
    }

    const globalCount = await prisma.shareAccount.count({ where: { organizationId: input.organizationId } });
    const accountNo = `SHR-${String(globalCount + 1).padStart(6, "0")}`;

    return await prisma.$transaction(async (tx) => {
      const shareAccount = await tx.shareAccount.create({
        data: {
          organizationId: input.organizationId,
          memberId: input.memberId,
          accountNo,
          shares: new Prisma.Decimal(0),
          shareValue: new Prisma.Decimal(0),
          status: "ACTIVE" as AccountStatus,
        },
      });

      await tx.auditLog.create({
        data: {
          organizationId: input.organizationId,
          userId: input.memberId,
          action: "SHARE_ACCOUNT_INITIALIZED",
          entity: "ShareAccount",
          entityId: shareAccount.id,
          oldValues: {},
          newValues: { accountNo, initialShares: 0 },
        },
      });

      return shareAccount;
    });
  },

  /**
   * Executes a capital purchase transaction, updating equity balances.
   */
  async purchaseShares(input: PurchaseSharesInput) {
    if (input.amountPaid <= 0) throw new Error("Capital cash injections must be positive.");

    return await prisma.$transaction(async (tx) => {
      const accountQuery = await tx.$queryRaw<LockedShareAccountRow[]>(
        Prisma.sql`SELECT id, shares, "shareValue" FROM "ShareAccount" WHERE id = ${input.shareAccountId} AND "organizationId" = ${input.organizationId} FOR UPDATE`
      );

      if (!accountQuery || accountQuery.length === 0) {
        throw new Error("Target share account configuration was not found.");
      }

      const account = accountQuery[0];
      const currentShares = new Prisma.Decimal(account.shares);
      const currentShareValue = new Prisma.Decimal(account.shareValue);

      const incrementalShares = new Prisma.Decimal(input.amountPaid);
      const updatedShares = currentShares.add(incrementalShares);
      const updatedShareValue = currentShareValue.add(input.amountPaid);

      // FIX: Aligned narrative block with the 'description' field and assigned explicit enum statuses
      const transactionRecord = await tx.financialTransaction.create({
        data: {
          organizationId: input.organizationId,
          branchId: input.branchId,
          shareAccountId: input.shareAccountId,
          type: "DEPOSIT" as TransactionType,
          amount: new Prisma.Decimal(input.amountPaid),
          reference: input.reference || `SHR-${Date.now()}`,
          description: input.narrative || `Capitalization injection of ${input.amountPaid} currency units.`,
          status: "COMPLETED" as TransactionStatus,
          createdById: input.createdById,
        },
      });

      await tx.shareAccount.update({
        where: { id: input.shareAccountId },
        data: {
          shares: updatedShares,
          shareValue: updatedShareValue,
        },
      });

      await tx.auditLog.create({
        data: {
          organizationId: input.organizationId,
          userId: input.createdById,
          action: "SHARES_PURCHASE_COMPLETED",
          entity: "ShareAccount",
          entityId: input.shareAccountId,
          oldValues: { shares: currentShares.toString(), shareValue: currentShareValue.toString() },
          newValues: { shares: updatedShares.toString(), shareValue: updatedShareValue.toString(), reference: transactionRecord.reference },
        },
      });

      return transactionRecord;
    });
  },

  /**
   * Moves shares between members internally without bleeding institutional capital reserves.
   */
  async transferShares(input: TransferSharesInput) {
    if (input.shareCountToTransfer <= 0) throw new Error("Transfer target unit counts must be positive integers.");

    return await prisma.$transaction(async (tx) => {
      const sourceQuery = await tx.$queryRaw<LockedShareAccountRow[]>(
        Prisma.sql`SELECT id, shares, "shareValue" FROM "ShareAccount" WHERE id = ${input.sourceShareAccountId} AND "organizationId" = ${input.organizationId} FOR UPDATE`
      );

      if (!sourceQuery || sourceQuery.length === 0) {
        throw new Error("Source share asset profile not found.");
      }

      const sourceAccount = sourceQuery[0];
      const sourceShares = new Prisma.Decimal(sourceAccount.shares);
      const transferVolume = new Prisma.Decimal(input.shareCountToTransfer);

      if (sourceShares.lt(transferVolume)) {
        throw new Error("Insufficient equity holdings within the source ledger node.");
      }

      const destinationQuery = await tx.$queryRaw<LockedShareAccountRow[]>(
        Prisma.sql`SELECT id, shares, "shareValue" FROM "ShareAccount" WHERE id = ${input.destinationShareAccountId} AND "organizationId" = ${input.organizationId} FOR UPDATE`
      );

      if (!destinationQuery || destinationQuery.length === 0) {
        throw new Error("Destination share ledger asset profile node not found.");
      }

      const destAccount = destinationQuery[0];
      const destShares = new Prisma.Decimal(destAccount.shares);

      const newSourceShares = sourceShares.sub(transferVolume);
      const newSourceValue = new Prisma.Decimal(sourceAccount.shareValue).sub(transferVolume);

      const newDestShares = destShares.add(transferVolume);
      const newDestValue = new Prisma.Decimal(destAccount.shareValue).add(transferVolume);

      await tx.shareAccount.update({
        where: { id: input.sourceShareAccountId },
        data: { shares: newSourceShares, shareValue: newSourceValue },
      });

      await tx.shareAccount.update({
        where: { id: input.destinationShareAccountId },
        data: { shares: newDestShares, shareValue: newDestValue },
      });

      const trackingReference = `TXFR-${Date.now()}`;

      // FIX: Aligned narrative with description, and bound strict transaction tracking enums
      await tx.financialTransaction.create({
        data: {
          organizationId: input.organizationId,
          branchId: input.branchId,
          shareAccountId: input.sourceShareAccountId,
          type: "TRANSFER" as TransactionType,
          amount: transferVolume,
          reference: trackingReference,
          description: `Internal equity volume allocation transfer to account index: ${input.destinationShareAccountId}`,
          status: "COMPLETED" as TransactionStatus,
          createdById: input.createdById,
        },
      });

      await tx.auditLog.create({
        data: {
          organizationId: input.organizationId,
          userId: input.createdById,
          action: "EQUITY_SHARE_TRANSFER_EXECUTED",
          entity: "ShareAccount",
          entityId: input.sourceShareAccountId,
          oldValues: { sourceSharesCountBefore: sourceShares.toString() },
          newValues: { sourceSharesCountAfter: newSourceShares.toString(), volumeMoved: transferVolume.toString(), targetNode: input.destinationShareAccountId },
        },
      });
    });
  },

  /**
   * Risk validation guard ensuring compliance constraints before allowing credit pipeline releases.
   */
  async validateMinimumShareCapFloor(organizationId: string, memberId: string, institutionalFloorAmount: number): Promise<boolean> {
    const account = await prisma.shareAccount.findFirst({
      where: { memberId, organizationId, status: "ACTIVE" as AccountStatus },
    });

    if (!account) return false;
    const currentHoldingValue = new Prisma.Decimal(account.shareValue);
    return currentHoldingValue.gte(institutionalFloorAmount);
  }
};