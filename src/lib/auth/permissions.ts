import { OrganizationUserRole, PlatformRole } from "@prisma/client";

export type AppPermissionKey =
  | "org:read" | "org:update" | "org:delete"
  | "branch:create" | "branch:read" | "branch:update" | "branch:delete"
  | "member:create" | "member:read" | "member:update" | "member:delete"
  | "user:create" | "user:read" | "user:update" | "user:delete"
  | "staff:create" | "staff:read" | "staff:update" | "staff:delete"
  | "savings:deposit" | "savings:withdraw" | "savings:read"
  | "loan:apply" | "loan:review" | "loan:approve" | "loan:disburse" | "loan:read" | "loan:repay"
  | "report:view" | "audit:read" | "platform:manage";

export const DEFAULT_ROLE_PERMISSIONS: Record<OrganizationUserRole, AppPermissionKey[]> = {
  OWNER: [
    "org:read", "org:update", "org:delete",
    "branch:create", "branch:read", "branch:update", "branch:delete",
    "member:create", "member:read", "member:update", "member:delete",
    "user:create", "user:read", "user:update", "user:delete",
    "staff:create", "staff:read", "staff:update", "staff:delete",
    "savings:deposit", "savings:withdraw", "savings:read",
    "loan:apply", "loan:review", "loan:approve", "loan:disburse", "loan:read", "loan:repay",
    "report:view", "audit:read"
  ],
  ADMIN: [
    "org:read", "org:update",
    "branch:create", "branch:read", "branch:update",
    "member:create", "member:read", "member:update",
    "user:create", "user:read", "user:update",
    "staff:create", "staff:read", "staff:update",
    "savings:deposit", "savings:withdraw", "savings:read",
    "loan:apply", "loan:review", "loan:approve", "loan:read", "loan:repay",
    "report:view", "audit:read"
  ],
  BRANCH_MANAGER: [
    "branch:read", "branch:update",
    "member:create", "member:read", "member:update",
    "user:create", "user:read", "user:update",
    "staff:create", "staff:read", "staff:update",
    "savings:deposit", "savings:withdraw", "savings:read",
    "loan:apply", "loan:review", "loan:read", "loan:repay",
    "report:view"
  ],
  ACCOUNTANT: [
    "member:read",
    "savings:deposit", "savings:withdraw", "savings:read",
    "loan:read", "loan:repay", "report:view"
  ],
  LOAN_OFFICER: [
    "member:read",
    "loan:apply", "loan:review", "loan:read", "loan:repay"
  ],
  AUDITOR: [
    "org:read", "branch:read", "member:read", "savings:read", "loan:read",
    "report:view", "audit:read"
  ],
  STAFF: [
    "member:read", "savings:read", "loan:read"
  ],
  MEMBER: [
    "savings:read", "loan:apply", "loan:read", "loan:repay"
  ]
};

export const PLATFORM_ROLE_PERMISSIONS: Record<PlatformRole, AppPermissionKey[]> = {
  PLATFORM_SUPER_ADMIN: ["platform:manage"],
  PLATFORM_ADMIN: ["platform:manage"],
  PLATFORM_SUPPORT: ["org:read", "audit:read"],
  PLATFORM_BILLING: ["org:read", "report:view"]
};

interface UserAuthorizationToken {
  role?: OrganizationUserRole | null;
  platformRole?: PlatformRole | null;
}

/**
 * Validates whether a user token possesses clearance flags for a targeted permission scope.
 */
export function hasPermission(auth: UserAuthorizationToken, required: AppPermissionKey): boolean {
  // 1. Evaluate cross-tenant management scopes
  if (auth.platformRole && PLATFORM_ROLE_PERMISSIONS[auth.platformRole]) {
    if (PLATFORM_ROLE_PERMISSIONS[auth.platformRole].includes(required)) return true;
  }

  // 2. Evaluate tenant-isolated business operation scopes
  if (auth.role && DEFAULT_ROLE_PERMISSIONS[auth.role]) {
    if (DEFAULT_ROLE_PERMISSIONS[auth.role].includes(required)) return true;
  }

  return false;
}