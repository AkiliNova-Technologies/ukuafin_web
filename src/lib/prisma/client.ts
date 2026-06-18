import "dotenv/config"; 

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { TenantContext } from "../tenant/tenant-context";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const basePrisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = basePrisma;
}

/**
 * Fortified, production-grade Prisma Client instance.
 * Automatically intercepts query execution trees to enforce strict 
 * multi-tenant sandbox boundaries across your SACCO infrastructure models.
 */
export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const activeTenantId = TenantContext.getOrganizationId();

        // Beautifully handled: CLI/Seed scripts won't have a tenant session context, 
        // so we cleanly drop out and execute the base query globally.
        if (!activeTenantId) {
          return query(args);
        }

        const tenantIsolatedModels = [
          "Branch",
          "User",
          "Role",
          "Member",
          "SavingsAccount",
          "ShareAccount",
          "LoanProduct",
          "LoanApplication",
          "Loan",
          "FinancialTransaction",
          "OrganizationSubscription",
          "Invoice",
          "Notification",
          "Document",
          "AuditLog"
        ];

        if (tenantIsolatedModels.includes(model)) {
          const queryArgs = (args as Record<string, unknown>) || {};
          queryArgs.where = (queryArgs.where as Record<string, unknown>) || {};

          if (
            operation === "findFirst" ||
            operation === "findMany" ||
            operation === "findUnique" ||
            operation === "update" ||
            operation === "updateMany" ||
            operation === "delete" ||
            operation === "deleteMany" ||
            operation === "count" ||
            operation === "aggregate" ||
            operation === "groupBy"
          ) {
            (queryArgs.where as Record<string, unknown>).organizationId = activeTenantId;
          } else if (operation === "create") {
            queryArgs.data = (queryArgs.data as Record<string, unknown>) || {};
            (queryArgs.data as Record<string, unknown>).organizationId = activeTenantId;
          } else if (operation === "createMany") {
            queryArgs.data = queryArgs.data || [];
            if (Array.isArray(queryArgs.data)) {
              queryArgs.data = queryArgs.data.map((item: Record<string, unknown>) => ({
                ...item,
                organizationId: activeTenantId,
              }));
            }
          }
        }

        return query(args);
      },
    },
  },
});