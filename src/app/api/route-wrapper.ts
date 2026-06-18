import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth/session"; 
import { TenantContext } from "@/lib/tenant/tenant-context";
import { AppPermissionKey, hasPermission } from "@/lib/auth/permissions";

type SecureHandler = (
  req: NextRequest,
context: { params: Promise<Record<string, string | string[]>> }
) => Promise<NextResponse>;

interface SecurityOptions {
  requiredPermission?: AppPermissionKey;
  bypassTenantContext?: boolean; 
}

/**
 * Next.js global route processor injecting multi-tenant isolation contexts 
 * alongside active dual-hierarchy RBAC schema validations.
 */
export function secureEndpoint(handler: SecureHandler, options: SecurityOptions = {}) {
  return async (req: NextRequest, context: { params: Promise<Record<string, string | string[]>> }) => {
    try {
      const session = await getAuthenticatedSession();

      if (!session || !session.userId) {
        return NextResponse.json(
          { error: "Access denied. Valid session identification token expected." },
          { status: 401 }
        );
      }

      // 1. Evaluate system RBAC authorization policies natively
      if (options.requiredPermission) {
        const hasClearance = hasPermission(
          { 
            role: session.saccoRole, // Clean, native matching with saccoRole contract
            platformRole: session.platformRole 
          },
          options.requiredPermission
        );

        if (!hasClearance) {
          return NextResponse.json(
            { error: `Forbidden. Deficient permissions context footprint: [${options.requiredPermission}]` },
            { status: 403 }
          );
        }
      }

      // 2. Short-circuit directly if context requires bypassing isolation bounds (such as platform billing dashboards)
      if (options.bypassTenantContext) {
        return await handler(req, context);
      }

      if (!session.organizationId) {
        return NextResponse.json(
          { error: "Action requires an assigned multi-tenant organization bounding block." },
          { status: 400 }
        );
      }

      // 3. Bind execution context safely inside the storage isolation sandbox
      return await TenantContext.run(session.organizationId, async () => {
        return await handler(req, context);
      });
    } catch (error) {
      console.error("[SECURITY_ROUTE_ERROR]: Global interception failure:", error);
      return NextResponse.json(
        { error: "An unexpected processing fault occurred within the core platform routing." },
        { status: 500 }
      );
    }
  };
}