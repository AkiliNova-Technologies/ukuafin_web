import { headers } from "next/headers";
import { OrganizationUserRole, PlatformRole } from "@prisma/client";

export interface AuthenticatedUserSession {
  userId: string;
  email: string;
  organizationId: string | null;
  branchId: string | null;
  saccoRole: OrganizationUserRole | null;
  platformRole: PlatformRole | null;
}

/**
 * Fast-access server helper. Extracts the authenticated multi-tenant context 
 * injected directly by the edge middleware shield OR validates automated cron worker tokens.
 */
export async function getAuthenticatedSession(): Promise<AuthenticatedUserSession | null> {
  const requestHeaders = await headers();
  
  const authHeader = requestHeaders.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return {
      userId: "VERCEL_CRON_WORKER",
      email: "cron@vercel.infrastructure",
      organizationId: requestHeaders.get("x-sacco-org-id"),
      branchId: null,
      saccoRole: "OWNER" as OrganizationUserRole, // Elevate automatically to system execution level
      platformRole: "PLATFORM_SUPER_ADMIN" as PlatformRole,
    };
  }

  // 2. Fall back to reading typical human identity cookies converted to network headers by the gateway
  const userId = requestHeaders.get("x-sacco-user-id");
  const email = requestHeaders.get("x-sacco-email");

  if (!userId || !email) {
    return null;
  }

  return {
    userId,
    email,
    organizationId: requestHeaders.get("x-sacco-org-id"),
    branchId: requestHeaders.get("x-sacco-branch-id"),
    saccoRole: requestHeaders.get("x-sacco-role") as OrganizationUserRole | null,
    platformRole: requestHeaders.get("x-sacco-platform-role") as PlatformRole | null,
  };
}