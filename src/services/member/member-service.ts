import { prisma } from "@/lib/prisma/client";
import { MemberStatus, Prisma, Gender } from "@prisma/client";

export interface OnboardMemberInput {
  organizationId: string;
  branchId: string;
  firstName: string;    
  middleName?: string;
  lastName: string;
  email?: string;
  phone: string;
  nationalId?: string;
  passportNo?: string;
  dateOfBirth?: string;
  gender?: Gender;
  address?: string;
}

export interface MemberFilterOptions {
  organizationId: string;
  branchId?: string | null;
  status?: MemberStatus;
  searchQuery?: string;
}

export const MemberService = {
  /**
   * Safe transaction execution. Validates identity uniqueness per tenant framework.
   */
  async onboard(input: OnboardMemberInput) {
    const standardizedEmail = input.email?.toLowerCase().trim() || null;
    const standardizedPhone = input.phone.trim();
    const cleanNationalId = input.nationalId?.trim() || null;

    if (cleanNationalId) {
      const idConflict = await prisma.member.findFirst({
        where: { organizationId: input.organizationId, nationalId: cleanNationalId },
      });
      if (idConflict) {
        throw new Error(`A member with National ID "${cleanNationalId}" is already registered within your SACCO.`);
      }
    }

    const phoneConflict = await prisma.member.findFirst({
      where: { organizationId: input.organizationId, phone: standardizedPhone },
    });
    if (phoneConflict) {
      throw new Error(`The phone number "${standardizedPhone}" is already tied to an active member profile.`);
    }

    const targetBranch = await prisma.branch.findFirst({
      where: { id: input.branchId, organizationId: input.organizationId, deletedAt: null },
    });
    if (!targetBranch) {
      throw new Error("Target registration branch configuration was missing or invalid for your organization context.");
    }

    return await prisma.$transaction(async (tx) => {
      const tenantMemberCount = await tx.member.count({
        where: { organizationId: input.organizationId },
      });

      const formattedSequence = String(tenantMemberCount + 1).padStart(5, "0");
      const computedMemberNo = `${targetBranch.code}-MBR-${formattedSequence}`;

      return await tx.member.create({
        data: {
          organizationId: input.organizationId,
          branchId: input.branchId,
          memberNo: computedMemberNo,
          firstName: input.firstName.trim(),      
          middleName: input.middleName?.trim() || null,
          lastName: input.lastName.trim(),
          email: standardizedEmail,
          phone: standardizedPhone,
          nationalId: cleanNationalId,
          passportNo: input.passportNo?.trim() || null,
          dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
          gender: input.gender || null,
          address: input.address || null,
          status: MemberStatus.ACTIVE,
        }
      });
    });
  },

  /**
   * Multi-tenant lookup matrix filter query execution engine pipelines.
   */
  async getMembersDirectory(filters: MemberFilterOptions) {
    const whereClause: Prisma.MemberWhereInput = {
      organizationId: filters.organizationId,
    };

    if (filters.branchId) {
      whereClause.branchId = filters.branchId;
    }

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.searchQuery) {
      const searchStr = filters.searchQuery.trim();
      
      whereClause.OR = [
        { firstName: { contains: searchStr, mode: "insensitive" } },
        { lastName: { contains: searchStr, mode: "insensitive" } },
        { middleName: { contains: searchStr, mode: "insensitive" } },
        { memberNo: { contains: searchStr, mode: "insensitive" } },
        { phone: { contains: searchStr } },
      ];
    }

    return prisma.member.findMany({
      where: whereClause,
      include: {
        branch: {
          select: { name: true, code: true },
        },
        _count: {
          select: {
            loans: true,
            savingsAccounts: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  /**
   * Safe closure of a member profile with dynamic financial dependency verification.
   * Ensures zero hanging credit liabilities or unaccounted capital floats.
   */
  async closeAccount(organizationId: string, memberId: string) {
    const outstandingLoans = await prisma.loan.count({
      where: {
        memberId,
        organizationId,
        status: { in: ["PENDING_DISBURSEMENT", "ACTIVE", "DEFAULTED"] }
      }
    });

    if (outstandingLoans > 0) {
      throw new Error("Cannot close membership. This profile has outstanding or pending loan obligations.");
    }

    const floatingBalances = await prisma.savingsAccount.findMany({
      where: { 
        memberId, 
        organizationId,
        status: "ACTIVE"
      },
      select: { accountNo: true, balance: true }
    });

    for (const account of floatingBalances) {
      if (Number(account.balance) > 0) {
        throw new Error(`Cannot close membership. Savings account (${account.accountNo}) still contains floating funds.`);
      }
    }

    return await prisma.member.update({
      where: { 
        id: memberId,
        organizationId 
      },
      data: { 
        status: MemberStatus.EXITED 
      }
    });
  }
};