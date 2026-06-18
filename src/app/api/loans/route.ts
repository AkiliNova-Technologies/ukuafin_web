import { NextResponse } from "next/server";
import { LoanService } from "@/services/loan/loan-service";
import { getAuthenticatedSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

export async function POST(request: Request) {
  try {
    const session = await getAuthenticatedSession();
    if (!session?.organizationId) {
      return NextResponse.json({ error: "Unauthorized endpoint request matrix hook." }, { status: 401 });
    }

    const body = await request.json();
    // Added loanProductId extraction from payload block
    const { memberId, loanProductId, principalAmount, interestRateAnnual, termMonths } = body;

    // Added loanProductId validation check to secure type safety
    if (!memberId || !loanProductId || !principalAmount || !interestRateAnnual || !termMonths) {
      return NextResponse.json({ error: "Missing required properties parameters context pointers." }, { status: 400 });
    }

    const application = await LoanService.apply({
      organizationId: session.organizationId,
      branchId: session.branchId || "",
      memberId,
      loanProductId,
      principalAmount: parseFloat(principalAmount),
      interestRateAnnual: parseFloat(interestRateAnnual),
      termMonths: parseInt(termMonths),
    });

    return NextResponse.json({ success: true, data: application }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Credit initiation sequence aborted.";
    console.error("[LOAN_APPLICATION_ROUTE_ERROR]:", error);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function GET() {
  try {
    const session = await getAuthenticatedSession();
    if (!session?.organizationId) {
      return NextResponse.json({ error: "Unauthorized access tokens profile map." }, { status: 401 });
    }

    const loans = await prisma.loan.findMany({
      where: { organizationId: session.organizationId },
      include: {
        member: { select: { firstName: true, lastName: true, memberNo: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: loans }, { status: 200 });
  } catch (error) {
    console.error("[LOAN_LIST_GET_ERROR]:", error);
    return NextResponse.json({ error: "Failed to gather organizational loan registries." }, { status: 500 });
  }
}