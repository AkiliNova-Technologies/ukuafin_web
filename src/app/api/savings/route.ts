import { NextResponse } from "next/server";
import { SavingsService } from "@/services/savings/savings-service";
import { getAuthenticatedSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const session = await getAuthenticatedSession();
    if (!session?.organizationId) {
      return NextResponse.json(
        { error: "Unauthorized access context detected." },
        { status: 401 },
      );
    }

    const body = await request.json();
    // Swapped to the standard 'productId' naming convention
    const { memberId, name } = body;

    if (!memberId || !name) {
      return NextResponse.json(
        { error: "Missing required parameters: memberId, name." },
        { status: 400 },
      );
    }

    const newAccount = await SavingsService.openAccount({
      organizationId: session.organizationId,
      branchId: session.branchId || "",
      memberId,
      name: name || "Main Savings",
    });

    return NextResponse.json(
      { success: true, data: newAccount },
      { status: 201 },
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to create savings entry.";
    console.error("[SAVINGS_POST_ROUTE_ERROR]:", error);
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
