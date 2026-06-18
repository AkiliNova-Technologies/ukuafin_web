import { prisma } from "@/lib/prisma/client";
import { Prisma, LoanStatus, TransactionType, TransactionStatus, InterestMethod, RepaymentStatus } from "@prisma/client";

export interface ApplyLoanInput {
  organizationId: string;
  branchId: string;
  memberId: string;
  principalAmount: number;
  interestRateAnnual: number;
  termMonths: number;
  loanProductId: string; // Made required to reflect your non-nullable schema relation
}

export interface AmortizationInstallment {
  installmentNo: number;
  dueDate: Date;
  principalAmount: Prisma.Decimal;
  interestAmount: Prisma.Decimal;
  totalInstallment: Prisma.Decimal;
}

export interface ProcessRepaymentInput {
  organizationId: string;
  branchId: string;
  loanId: string;
  amountPaid: number;
  reference?: string;
  createdById: string;
}

interface LockedLoanRow {
  id: string;
  outstandingBalance: number | string | Prisma.Decimal;
}

export const LoanService = {
  /**
   * Generates a reducing balance amortization schedule mapping.
   */
  generateSchedule(
    principal: number,
    annualRate: number,
    termMonths: number,
    startDate: Date,
  ): AmortizationInstallment[] {
    const schedule: AmortizationInstallment[] = [];
    const monthlyPrincipal = new Prisma.Decimal(principal).div(termMonths);
    const monthlyRate = annualRate / 12;
    let remainingBalance = new Prisma.Decimal(principal);

    for (let i = 1; i <= termMonths; i++) {
      const interestAmount = remainingBalance.mul(monthlyRate);
      const totalInstallment = monthlyPrincipal.add(interestAmount);
      remainingBalance = remainingBalance.sub(monthlyPrincipal);

      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      schedule.push({
        installmentNo: i,
        dueDate,
        principalAmount: monthlyPrincipal,
        interestAmount,
        totalInstallment,
      });
    }

    return schedule;
  },

  /**
   * Submits a new loan record to the database ledger.
   */
  async apply(input: ApplyLoanInput) {
    const member = await prisma.member.findFirst({
      where: {
        id: input.memberId,
        organizationId: input.organizationId,
        status: "ACTIVE",
      },
    });

    if (!member) {
      throw new Error("Target member profile does not match active multi-tenant organization constraints.");
    }

    const branch = await prisma.branch.findUnique({
      where: { id: input.branchId },
    });
    if (!branch) throw new Error("Operational branch context missing.");

    const globalLoanCount = await prisma.loan.count({
      where: { organizationId: input.organizationId },
    });

    const padSequence = String(globalLoanCount + 1).padStart(6, "0");
    const loanNo = `${branch.code}-LON-${padSequence}`;

    // Simple flat approximation for overall database payload tracking boundaries
    const totalPayable = new Prisma.Decimal(input.principalAmount).add(
      new Prisma.Decimal(input.principalAmount)
        .mul(input.interestRateAnnual / 12)
        .mul(input.termMonths),
    );

    return await prisma.$transaction(async (tx) => {
      // FIX: Aligned status, interestMethod, and relations exactly with your Prisma schema
      const loan = await tx.loan.create({
        data: {
          organizationId: input.organizationId,
          branchId: input.branchId,
          memberId: input.memberId,
          loanNo,
          loanProductId: input.loanProductId,
          interestMethod: "REDUCING_BALANCE" as InterestMethod,
          principalAmount: new Prisma.Decimal(input.principalAmount),
          outstandingBalance: new Prisma.Decimal(input.principalAmount),
          interestRate: new Prisma.Decimal(input.interestRateAnnual),
          termMonths: input.termMonths,
          totalPayable,
          status: "PENDING_DISBURSEMENT" as LoanStatus,
        },
      });

      await tx.auditLog.create({
        data: {
          organizationId: input.organizationId,
          userId: input.memberId,
          action: "LOAN_APPLICATION_SUBMITTED",
          entity: "Loan",
          entityId: loan.id,
          oldValues: {},
          newValues: {
            loanNo,
            principalAmount: input.principalAmount,
            termMonths: input.termMonths,
          },
        },
      });

      return loan;
    });
  },

  /**
   * Approves a loan request, creates its schedule records, and moves it to an ACTIVE status.
   */
  async approveAndDisburse(
    organizationId: string,
    loanId: string,
    staffId: string,
  ) {
    return await prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findFirst({
        where: { id: loanId, organizationId, status: "PENDING_DISBURSEMENT" as LoanStatus },
      });

      if (!loan) {
        throw new Error("Target loan portfolio node was not found or is already advanced beyond review states.");
      }

      const rawSchedule = this.generateSchedule(
        Number(loan.principalAmount),
        Number(loan.interestRate),
        loan.termMonths,
        new Date(),
      );

      // FIX: Replaced dynamic table guessing loops with your exact schema-backed 'loanSchedule' delegate model call
      await tx.loanSchedule.createMany({
        data: rawSchedule.map((inst) => ({
          loanId: loan.id,
          installmentNo: inst.installmentNo,
          dueDate: inst.dueDate,
          principalDue: inst.principalAmount,
          interestDue: inst.interestAmount,
          totalDue: inst.totalInstallment,
          amountPaid: new Prisma.Decimal(0),
          status: "PENDING" as RepaymentStatus,
        })),
      });

      const updatedLoan = await tx.loan.update({
        where: { id: loan.id },
        data: {
          status: "ACTIVE" as LoanStatus,
          disbursedAt: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          organizationId,
          userId: staffId,
          action: "LOAN_APPROVED_AND_DISBURSED",
          entity: "Loan",
          entityId: loan.id,
          oldValues: { status: "PENDING_DISBURSEMENT" },
          newValues: { status: "ACTIVE", disbursedAt: updatedLoan.disbursedAt },
        },
      });

      return updatedLoan;
    });
  },

  /**
   * Processes an incoming principal repayment and updates the portfolio balance.
   */
  async processRepayment(input: ProcessRepaymentInput) {
    if (input.amountPaid <= 0)
      throw new Error("Repayment liquidity influx tokens must be positive.");

    return await prisma.$transaction(async (tx) => {
      const loanQuery = await tx.$queryRaw<LockedLoanRow[]>(
        Prisma.sql`SELECT id, "outstandingBalance" FROM "Loan" WHERE id = ${input.loanId} AND "organizationId" = ${input.organizationId} FOR UPDATE`,
      );

      if (!loanQuery || loanQuery.length === 0) {
        throw new Error("Target loan ledger file asset was missing or out of context bounds.");
      }

      const currentOutstanding = new Prisma.Decimal(loanQuery[0].outstandingBalance);
      if (currentOutstanding.lte(0)) {
        throw new Error("This asset portfolio balance is already completely cleared down.");
      }

      const newOutstanding = currentOutstanding.sub(input.amountPaid);
      
      // FIX: Evaluated against actual schema status parameters ('COMPLETED' or 'ACTIVE')
      const computedStatus: LoanStatus = newOutstanding.lte(0)
        ? ("COMPLETED" as LoanStatus)
        : ("ACTIVE" as LoanStatus);

      // FIX: Changed property key from 'narrative' to 'description' to align directly with schema model definition
      const transactionRecord = await tx.financialTransaction.create({
        data: {
          organizationId: input.organizationId,
          branchId: input.branchId,
          loanId: input.loanId,
          type: "REPAYMENT" as TransactionType,
          amount: new Prisma.Decimal(input.amountPaid),
          reference: input.reference || `PAY-${Date.now()}`,
          description: `Loan recovery repayment received. Remaining balance float: ${Prisma.Decimal.max(0, newOutstanding).toFixed(2)}.`,
          status: "COMPLETED" as TransactionStatus,
          createdById: input.createdById,
        },
      });

      await tx.loan.update({
        where: { id: input.loanId },
        data: {
          outstandingBalance: Prisma.Decimal.max(0, newOutstanding),
          status: computedStatus,
        },
      });

      await tx.auditLog.create({
        data: {
          organizationId: input.organizationId,
          userId: input.createdById,
          action: "LOAN_REPAYMENT_PROCESSED",
          entity: "FinancialTransaction",
          entityId: transactionRecord.id,
          oldValues: { outstandingBalance: currentOutstanding.toString() },
          newValues: {
            outstandingBalance: Prisma.Decimal.max(0, newOutstanding).toString(),
            amountPaid: input.amountPaid,
          },
        },
      });

      return transactionRecord;
    });
  },
};