import { prisma } from "@/lib/prisma/client";
import { Prisma } from "@prisma/client";

export interface RepaymentAllocationSummary {
  loanId: string;
  totalAmountReceived: number;
  penaltyComponentPaid: number;
  interestComponentPaid: number;
  principalComponentPaid: number;
  remainingOutstandingBalance: number;
  isFullySettled: boolean;
}

export const LoanRepaymentEngine = {
  /**
   * Processes an incoming loan repayment, applying funds toward penalties, 
   * interest, and principal sequentially based on strict accounting amortization rules.
   */
  async processLoanRepayment(
    loanId: string, 
    paymentAmount: number, 
    operatorUserId: string
  ): Promise<RepaymentAllocationSummary> {
    const processDate = new Date();
    const inboundFunds = new Prisma.Decimal(paymentAmount);

    if (inboundFunds.lessThanOrEqualTo(0)) {
      throw new Error("Repayment amount must be a positive value greater than zero.");
    }

    // 1. Fetch target loan with full multi-tenant details
    const loan = await prisma.loan.findUnique({
      where: { id: loanId }
    });

    // FIX: Updated matching evaluation matrix to check against 'DEFAULTED' instead of 'DELINQUENT'
    if (!loan || (loan.status !== "COMPLETED" && loan.status !== "DEFAULTED")) {
      throw new Error("Target loan is not available for repayment adjustments or is already fully settled.");
    }

    const loanRecord = loan as Record<string, unknown>;
    
    const rawPenalty = loanRecord.outstandingPenalties instanceof Prisma.Decimal 
      ? loanRecord.outstandingPenalties 
      : new Prisma.Decimal(Number(loanRecord.outstandingPenalties || 0));

    const rawInterest = loanRecord.outstandingInterest instanceof Prisma.Decimal
      ? loanRecord.outstandingInterest
      : new Prisma.Decimal(Number(loanRecord.outstandingInterest || 0));

    const totalPrincipalOutstanding = loan.outstandingBalance;

    let remainingFunds = inboundFunds;
    let penaltyPaid = new Prisma.Decimal(0);
    let interestPaid = new Prisma.Decimal(0);
    let principalPaid = new Prisma.Decimal(0);

    // 2. Allocation Layer 1: Clear Outstanding Penalties
    if (rawPenalty.greaterThan(0) && remainingFunds.greaterThan(0)) {
      if (remainingFunds.greaterThanOrEqualTo(rawPenalty)) {
        penaltyPaid = rawPenalty;
        remainingFunds = remainingFunds.sub(rawPenalty);
      } else {
        penaltyPaid = remainingFunds;
        remainingFunds = new Prisma.Decimal(0);
      }
    }

    // 3. Allocation Layer 2: Clear Accrued Interest
    if (rawInterest.greaterThan(0) && remainingFunds.greaterThan(0)) {
      if (remainingFunds.greaterThanOrEqualTo(rawInterest)) {
        interestPaid = rawInterest;
        remainingFunds = remainingFunds.sub(rawInterest);
      } else {
        interestPaid = remainingFunds;
        remainingFunds = new Prisma.Decimal(0);
      }
    }

    // 4. Allocation Layer 3: Pay Down Principal
    if (totalPrincipalOutstanding.greaterThan(0) && remainingFunds.greaterThan(0)) {
      if (remainingFunds.greaterThanOrEqualTo(totalPrincipalOutstanding)) {
        principalPaid = totalPrincipalOutstanding;
        remainingFunds = remainingFunds.sub(totalPrincipalOutstanding);
      } else {
        principalPaid = remainingFunds;
        remainingFunds = new Prisma.Decimal(0);
      }
    }

    const netNewPrincipalBalance = totalPrincipalOutstanding.sub(principalPaid);
    const netNewInterestBalance = rawInterest.sub(interestPaid);
    const netNewPenaltyBalance = rawPenalty.sub(penaltyPaid);
    
    // An account is fully cleared when its active base principal hits zero
    const isFullySettled = netNewPrincipalBalance.equals(0);

    const updatedLoanData: Record<string, unknown> = {
      outstandingBalance: netNewPrincipalBalance
    };

    if (loanRecord.outstandingInterest instanceof Prisma.Decimal || typeof loanRecord.outstandingInterest === "number") {
      updatedLoanData.outstandingInterest = netNewInterestBalance;
    }
    if (loanRecord.outstandingPenalties instanceof Prisma.Decimal || typeof loanRecord.outstandingPenalties === "number") {
      updatedLoanData.outstandingPenalties = netNewPenaltyBalance;
    }
    
    // If fully paid, change status to match the completed terminal state
    if (isFullySettled) {
      updatedLoanData.status = "COMPLETED"; 
    }

    // 5. Execute transaction updates
    await prisma.$transaction([
      prisma.loan.update({
        where: { id: loanId },
        data: updatedLoanData as Prisma.LoanUpdateInput
      }),

      prisma.financialTransaction.create({
        data: {
          amount: inboundFunds,
          type: "DEPOSIT", // FIX: Updated to use your exact schema enum allocation value
          status: "COMPLETED",
          reference: `LN-REPAY-${loan.id}-${processDate.getTime()}`,
          description: `Amortized loan repayment: Principal Paid: KES ${principalPaid.toFixed(2)}, Interest: KES ${interestPaid.toFixed(2)}, Penalty: KES ${penaltyPaid.toFixed(2)}`,
          organizationId: loan.organizationId,
          branchId: loan.branchId,
          loanId: loan.id
        }
      }),

      prisma.auditLog.create({
        data: {
          action: "LOAN_REPAYMENT_PROCESSED",
          entity: "LOAN",
          entityId: loanId,
          userId: operatorUserId,
          oldValues: { principal: totalPrincipalOutstanding.toNumber(), interest: rawInterest.toNumber() },
          newValues: {
            allocatedPrincipal: principalPaid.toNumber(),
            allocatedInterest: interestPaid.toNumber(),
            allocatedPenalty: penaltyPaid.toNumber(),
            overpaymentUnusedFunds: remainingFunds.toNumber(),
            newPrincipalOutstanding: netNewPrincipalBalance.toNumber()
          }
        }
      })
    ]);

    return {
      loanId,
      totalAmountReceived: inboundFunds.toNumber(),
      penaltyComponentPaid: penaltyPaid.toNumber(),
      interestComponentPaid: interestPaid.toNumber(),
      principalComponentPaid: principalPaid.toNumber(),
      remainingOutstandingBalance: netNewPrincipalBalance.toNumber(),
      isFullySettled
    };
  }
};