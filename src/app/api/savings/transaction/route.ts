import { NextResponse } from "next/server";
import { SavingsService } from "@/services/savings/savings-service";
import { getAuthenticatedSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const session = await getAuthenticatedSession();
    if (!session?.organizationId || !session.userId) {
      return NextResponse.json({ error: "Unauthorized workspace access credentials." }, { status: 401 });
    }

    const body = await request.json();
    const { accountId, amount, type, reference, narrative } = body;

    if (!accountId || !amount || !type) {
      return NextResponse.json({ error: "Missing payload constraints: accountId, amount, type." }, { status: 400 });
    }

    const payload = {
      organizationId: session.organizationId,
      branchId: session.branchId || "",
      accountId,
      amount: parseFloat(amount),
      reference,
      narrative,
      createdById: session.userId,
    };

    let resultRecord;
    if (type === "DEPOSIT") {
      resultRecord = await SavingsService.deposit(payload);
    } else if (type === "WITHDRAWAL") {
      resultRecord = await SavingsService.withdraw(payload);
    } else if (type === "INTEREST_BATCH") {
      const log = await SavingsService.applyInterest(session.organizationId, parseFloat(body.annualRate || "0.05"), session.userId);
      return NextResponse.json({ success: true, executedCount: log.length, batchLog: log });
    } else {
      return NextResponse.json({ error: "Unsupported or unmapped transaction operation type parameter." }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: resultRecord }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Transaction handling failure encountered.";
    console.error("[SAVINGS_TRANSACTION_ROUTE_ERROR]:", error);
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}