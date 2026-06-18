import { AppPermissionKey, DEFAULT_ROLE_PERMISSIONS, PLATFORM_ROLE_PERMISSIONS } from "./permissions";
import { OrganizationUserRole, PlatformRole } from "@prisma/client";

interface UserSecuritySession {
  id: string;
  platformRole: PlatformRole | null;
  saccoRole: OrganizationUserRole | null; 
  organizationId: string | null;
  branchId: string | null;
  userPermissions: { key: string; allowed: boolean }[]; 
}

interface ResourceContext {
  organizationId?: string | null;
  branchId?: string | null;
}

export function enforceSecurityContext(
  user: UserSecuritySession,
  permission: AppPermissionKey,
  resource?: ResourceContext
): boolean {
  if (user.platformRole) {
    const pPerms = PLATFORM_ROLE_PERMISSIONS[user.platformRole];
    if (pPerms?.includes("platform:manage")) return true;
    return pPerms?.includes(permission) ?? false;
  }

  if (!user.organizationId) return false;
  if (resource?.organizationId && resource.organizationId !== user.organizationId) {
    return false; 
  }

  const explicitOverride = user.userPermissions.find((p) => p.key === permission);
  if (explicitOverride !== undefined) {
    return explicitOverride.allowed;
  }

  if (!user.saccoRole) return false;
  const standardPermissions = DEFAULT_ROLE_PERMISSIONS[user.saccoRole];
  const hasBasePermission = standardPermissions?.includes(permission) ?? false;

  if (!hasBasePermission) return false;

  if (
    user.saccoRole === "BRANCH_MANAGER" &&
    resource?.branchId &&
    resource.branchId !== user.branchId
  ) {
    return false;
  }

  return true;
}