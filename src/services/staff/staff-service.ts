import { prisma } from "@/lib/prisma/client";
import { UserStatus, OrganizationUserRole, Prisma } from "@prisma/client";
import { hashPassword } from "@/lib/auth/hash";

export interface OnboardStaffInput {
  organizationId: string;
  branchId: string;
  name: string;
  email: string;
  phone?: string;
  saccoRole: OrganizationUserRole;
  password?: string;
}

export interface StaffFilterOptions {
  organizationId: string;
  branchId?: string | null;
  role?: OrganizationUserRole;
  status?: UserStatus;
}

export const StaffService = {
  /**
   * Onboards a back-office staff worker, ensures unique email metrics globally,
   * hashes credentials, and assigns standard platform linkages.
   */
  async onboard(input: OnboardStaffInput) {
    const standardizedEmail = input.email.toLowerCase().trim();

    // Enforce platform email uniqueness early before entering Prisma transactions
    const emailConflict = await prisma.user.findUnique({
      where: { email: standardizedEmail },
    });

    if (emailConflict) {
      throw new Error(`The email identity "${standardizedEmail}" is already registered on this platform.`);
    }

    // Verify branch existence and confirm it belongs to the active organization
    const branchRecord = await prisma.branch.findFirst({
      where: { id: input.branchId, organizationId: input.organizationId, deletedAt: null },
    });

    if (!branchRecord) {
      throw new Error("Target branch layout registry was missing or does not match your organization context.");
    }

    // Generate or process secure initialization credentials
    const initialPlaintextPassword = input.password || `SaccoStaff@${Math.random().toString(36).slice(-6).toUpperCase()}`;
    const securePasswordHash = await hashPassword(initialPlaintextPassword);

    // Resolve or automatically configure a system role reference template from the database
    let systemRole = await prisma.role.findFirst({
      where: { organizationId: input.organizationId, key: input.saccoRole },
    });

    // Fallback: build a dynamic custom role allocation layout group if not found initialized
    if (!systemRole) {
      systemRole = await prisma.role.create({
        data: {
          organizationId: input.organizationId,
          name: `${input.saccoRole.replace("_", " ")} Group`,
          key: input.saccoRole,
          isSystem: true,
        },
      });
    }

    const createdUser = await prisma.user.create({
      data: {
        organizationId: input.organizationId,
        branchId: input.branchId,
        roleId: systemRole.id,
        name: input.name,
        email: standardizedEmail,
        phone: input.phone || null,
        passwordHash: securePasswordHash,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        branch: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    return {
      user: createdUser,
      temporaryCredentials: input.password ? null : initialPlaintextPassword,
    };
  },

  /**
   * Safe list fetcher fetching staff registers within an organization context.
   */
  async getStaffRegistry(filters: StaffFilterOptions) {
    const whereClause: Prisma.UserWhereInput = {
      organizationId: filters.organizationId,
      role: {
        key: { not: "MEMBER" }
      }
    };

    if (filters.branchId) {
      whereClause.branchId = filters.branchId;
    }

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.role) {
      whereClause.role = { key: filters.role };
    }

    return prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        branch: {
          select: { id: true, name: true, code: true }
        },
        role: {
          select: { name: true, key: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });
  },

  /**
   * Revokes staff operational access safely while fully preserving the database audit map.
   * Prevents bricking organization infrastructure by enforcing key fallback checks.
   */
  async deactivateStaffAccount(organizationId: string, staffId: string, actorId: string) {
    if (staffId === actorId) {
      throw new Error("Self-deactivation safety lock triggered. You cannot revoke your own workspace access.");
    }

    // 1. Fetch current details to check role profile mapping
    const targetStaff = await prisma.user.findFirst({
      where: { id: staffId, organizationId },
      include: { role: true }
    });

    if (!targetStaff) {
      throw new Error("The requested staff record does not exist under your organization domain.");
    }

    // 2. Structural Rule: Prevent turning off the absolute last OWNER/ADMIN account
    if (targetStaff.role?.key === "OWNER" || targetStaff.role?.key === "ADMIN") {
      const remainingAdmins = await prisma.user.count({
        where: {
          organizationId,
          status: UserStatus.ACTIVE,
          role: { key: targetStaff.role.key }
        }
      });

      if (remainingAdmins <= 1) {
        throw new Error(`Cannot deactivate account. This user is currently the absolute last active ${targetStaff.role.key} in your SACCO framework.`);
      }
    }

    const pendingTransactions = await prisma.financialTransaction.count({
      where: {
        organizationId,
        status: "PENDING",
        OR: [
          { createdById: staffId },
          { approvedById: staffId }
        ]
      }
    });

    if (pendingTransactions > 0) {
      throw new Error("Cannot deactivate account. This user has pending transaction logs that require completion or rejection clearance.");
    }

    return await prisma.user.update({
      where: { id: staffId },
      data: { status: UserStatus.DEACTIVATED },
      select: { id: true, name: true, status: true }
    });
  }
};