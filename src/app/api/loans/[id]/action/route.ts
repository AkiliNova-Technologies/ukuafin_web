import { NextResponse } from "next/server";
import { LoanService } from "@/services/loan/loan-service";
import { getAuthenticatedSession } from "@/lib/auth/session";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    // Un-wrap the dynamic parameters promise first
    const { id } = await params;

    const session = await getAuthenticatedSession();
    if (!session?.organizationId || !session.userId) {
      return NextResponse.json({ error: "Unauthorized action context verification status missing." }, { status: 401 });
    }

    const body = await request.json();
    const { action, amountPaid, reference } = body;

    if (action === "APPROVE") {
      const activeAsset = await LoanService.approveAndDisburse(session.organizationId, id, session.userId);
      return NextResponse.json({ success: true, data: activeAsset }, { status: 200 });
    } 
    
    if (action === "REPAY") {
      if (!amountPaid) return NextResponse.json({ error: "Missing parameter requirement pointer: amountPaid" }, { status: 400 });
      
      const transaction = await LoanService.processRepayment({
        organizationId: session.organizationId,
        branchId: session.branchId || "",
        loanId: id,
        amountPaid: parseFloat(amountPaid),
        reference,
        createdById: session.userId,
      });

      return NextResponse.json({ success: true, data: transaction }, { status: 200 });
    }

    return NextResponse.json({ error: "The provided workflow engine action parameter has no target mapping rules." }, { status: 400 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Workflow state transition failure encountered.";
    console.error("[LOAN_ACTION_ROUTE_ERROR]:", error);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}