import { NextResponse } from "next/server";
import { SharesService } from "@/services/shares/shares-service";
import { getAuthenticatedSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const session = await getAuthenticatedSession();
    if (!session?.organizationId || !session.userId || !session.branchId) {
      return NextResponse.json({ error: "Context identification trace markers missing." }, { status: 401 });
    }

    const body = await request.json();
    const { shareAccountId, memberId, amountPaid, reference, narrative } = body;

    if (!shareAccountId || !memberId || !amountPaid) {
      return NextResponse.json({ error: "Missing parameter elements: shareAccountId, memberId, amountPaid." }, { status: 400 });
    }

    const txn = await SharesService.purchaseShares({
      organizationId: session.organizationId,
      branchId: session.branchId,
      memberId,
      shareAccountId,
      amountPaid: parseFloat(amountPaid),
      reference,
      narrative,
      createdById: session.userId,
    });

    return NextResponse.json({ success: true, data: txn }, { status: 200 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Capital shares acquisition runtime exception.";
    console.error("[SHARES_POST_ROUTE_ERROR]:", error);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}