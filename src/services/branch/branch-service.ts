import { prisma } from "@/lib/prisma/client";
import { BranchStatus, Prisma, UserStatus, MemberStatus } from "@prisma/client";

export interface CreateBranchInput {
  organizationId: string;
  name: string;
  code: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface BranchFilterOptions {
  organizationId: string;
  branchId?: string | null;
  status?: BranchStatus;
  startDate?: string;
  endDate?: string;
}

export const BranchService = {
  /**
   * Safe data write wrapper. Creates a branch while checking for intra-tenant code unique conflicts.
   */
  async create(input: CreateBranchInput) {
    const standardizedCode = input.code.toUpperCase().trim();

    const existingBranch = await prisma.branch.findUnique({
      where: {
        organizationId_code: {
          organizationId: input.organizationId,
          code: standardizedCode,
        },
      },
    });

    if (existingBranch) {
      throw new Error(
        `Branch code "${standardizedCode}" is already in use by this organization.`,
      );
    }

    return prisma.branch.create({
      data: {
        organizationId: input.organizationId,
        name: input.name,
        code: standardizedCode,
        phone: input.phone || null,
        email: input.email || null,
        address: input.address || null,
        status: BranchStatus.ACTIVE,
      },
    });
  },

  /**
   * Advanced multi-tenant filtering query pipeline.
   * Dynamically tracks staff and member aggregations down-stream.
   */
  async getAllWithMetrics(filters: BranchFilterOptions) {
    const whereClause: Prisma.BranchWhereInput = {
      organizationId: filters.organizationId,
      deletedAt: null,
    };

    if (filters.branchId) {
      whereClause.id = filters.branchId;
    }

    if (filters.status) {
      whereClause.status = filters.status;
    }

    return prisma.branch.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            users: true, 
            members: true,
            loans: true,
          },
        },
      },
      orderBy: { code: "asc" },
    });
  },

  /**
   * Compiles the performance metrics dashboard for a specific branch.
   */
  async getPerformanceDashboard(organizationId: string, branchId: string, startDate?: Date, endDate?: Date) {
    const createdAtFilter: Prisma.DateTimeFilter<"Loan"> = {};
    
    if (startDate) createdAtFilter.gte = startDate;
    if (endDate) createdAtFilter.lte = endDate;

    const hasDateRange = startDate || endDate;

    const [savingsAgg, shareAgg, loanAgg] = await Promise.all([
      prisma.savingsAccount.aggregate({
        where: { organizationId, branchId, status: "ACTIVE" },
        _sum: { balance: true }
      }),
      prisma.shareAccount.aggregate({
        where: { organizationId, branchId, status: "ACTIVE" },
        _sum: { shareValue: true }
      }),
      prisma.loan.aggregate({
        where: { 
          organizationId, 
          branchId, 
          status: { in: ["ACTIVE", "DEFAULTED"] },
          ...(hasDateRange ? { createdAt: createdAtFilter } : {})
        },
        _sum: { outstandingBalance: true, totalPayable: true }
      })
    ]);

    return {
      totalSavingsBalance: savingsAgg._sum.balance || new Prisma.Decimal(0),
      totalShareCapital: shareAgg._sum.shareValue || new Prisma.Decimal(0),
      outstandingLoanPortfolio: loanAgg._sum.outstandingBalance || new Prisma.Decimal(0),
    };
  },

  /**
   * Deactivates and marks an organizational branch as CLOSED.
   * Enforces deep compliance validation constraints so orphan entities aren't left behind.
   */
  async deactivateBranch(organizationId: string, branchId: string) {
    const activeStaffCount = await prisma.user.count({
      where: {
        branchId,
        organizationId,
        status: { in: [UserStatus.ACTIVE, UserStatus.PENDING] }
      }
    });

    if (activeStaffCount > 0) {
      throw new Error(`Cannot close branch. There are still ${activeStaffCount} active staff members assigned here. Relocate them before deactivation.`);
    }

    const activeMemberCount = await prisma.member.count({
      where: {
        branchId,
        organizationId,
        status: { in: [MemberStatus.ACTIVE, MemberStatus.PENDING, MemberStatus.SUSPENDED] }
      }
    });

    if (activeMemberCount > 0) {
      throw new Error(`Cannot close branch. This location still holds ${activeMemberCount} registered members. Migrate their profiles to an active branch first.`);
    }

    // 3. Verify there are no floating active loan accounts currently managed under this branch code block
    const activePortfolioCount = await prisma.loan.count({
      where: {
        branchId,
        organizationId,
        status: { in: ["PENDING_DISBURSEMENT", "ACTIVE", "DEFAULTED"] }
      }
    });

    if (activePortfolioCount > 0) {
      throw new Error(`Cannot close branch. There are ${activePortfolioCount} unresolved loan books attached to this branch asset layer.`);
    }

    return await prisma.branch.update({
      where: { 
        id: branchId,
        organizationId 
      },
      data: { 
        status: BranchStatus.CLOSED 
      }
    });
  }
};