import { NextRequest, NextResponse } from "next/server";
import { secureEndpoint } from "@/app/api/route-wrapper";
import { prisma } from "@/lib/prisma/client";
import { Prisma } from "@prisma/client";

type AuditLogWhereInput = Prisma.AuditLogWhereInput;

interface UserMeta {
  id: string;
  email: string;
  name: string | null;
}

// Explicit type layout to fulfill Next.js 15 asynchronous handler compilation expectations
type Next15Args = [NextRequest, { params: Promise<Record<string, string | string[]>> }];

const baseHandler = secureEndpoint(
  async (req: NextRequest) => {
    try {
      const { searchParams } = new URL(req.url);
      
      const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
      const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "25")));
      const actionFilter = searchParams.get("action") || undefined;
      const entityFilter = searchParams.get("entity") || undefined;
      const targetUserId = searchParams.get("userId") || undefined;
      
      const skip = (page - 1) * limit;

      const queryFilters: AuditLogWhereInput = {};
      if (actionFilter) queryFilters.action = actionFilter;
      if (entityFilter) queryFilters.entity = entityFilter;
      if (targetUserId) queryFilters.userId = targetUserId;

      const [totalLogs, logs] = await Promise.all([
        prisma.auditLog.count({ where: queryFilters }),
        prisma.auditLog.findMany({
          where: queryFilters,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          }
        })
      ]);

      return NextResponse.json({
        success: true,
        pagination: {
          currentPage: page,
          pageSize: limit,
          totalRecordsCount: totalLogs,
          totalPagesCount: Math.ceil(totalLogs / limit)
        },
        records: logs.map(log => {
          // Natively typing the optional relational sub-field to dodge linter rules
          const operatorUser = (log as Record<string, unknown>).user as UserMeta | null | undefined;

          return {
            id: log.id,
            userId: log.userId,
            operatorMeta: operatorUser ? { name: operatorUser.name, email: operatorUser.email } : null,
            action: log.action,
            entity: log.entity,
            entityId: log.entityId,
            oldStateSnapshot: log.oldValues,
            newStateSnapshot: log.newValues,
            executionTimestamp: log.createdAt
          };
        })
      });
    } catch (error) {
      console.error("[AUDIT_LOG_EXPLORER_CRASH]: Route inspection stream failure:", error);
      return NextResponse.json(
        { error: "Failed to compile the immutable transactional audit streams." },
        { status: 500 }
      );
    }
  },
  {
    requiredPermission: "audit:read"
  }
);

// Cast the wrapper structure cleanly into the shape Next.js needs for production optimization
export const GET = baseHandler as (...args: Next15Args) => Promise<NextResponse>;