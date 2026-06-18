import { prisma } from "@/lib/prisma/client";

export interface TransactionAlertPayload {
  transactionId: string;
  accountNumber: string;
  amount: number;
  type: "DEPOSIT" | "WITHDRAWAL" | "LOAN_DISBURSEMENT" | "REPAYMENT";
  memberId: string;
}

export const TransactionAlertService = {
  /**
   * Processes outbound notification dispatch sequences following financial ledger updates.
   */
  async dispatchLedgerAlert(payload: TransactionAlertPayload): Promise<{ success: boolean; channel: string }> {
    // 1. Fetch targeted profile details cleanly without triggering unused-vars bounds
    const member = await prisma.member.findUnique({
      where: { id: payload.memberId },
      select: { phone: true, firstName: true }
    });

    if (!member || !member.phone) {
      return { success: false, channel: "NONE" };
    }

    const formattedAmount = new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX"
    }).format(payload.amount);

    const messageBody = `Hello ${member.firstName}, your account ${payload.accountNumber} has been updated. Type: ${payload.type}, Amount: ${formattedAmount}. Ref: ${payload.transactionId}.`;

    // 2. Stream to external SMS Gateway (Mock implementation using standard logs)
    console.log(`[SMS_GATEWAY_DISPATCH] To: ${member.phone} | Body: ${messageBody}`);

    // 3. Persist the record inside the communications log table
    await prisma.auditLog.create({
      data: {
        action: "NOTIFICATION_DISPATCH",
        entity: "MEMBER",
        entityId: payload.memberId,
        userId: "SYSTEM_WORKER",
        oldValues: {},
        newValues: {
          recipientChannel: member.phone,
          messagePayload: messageBody,
          deliveryStatus: "SENT"
        }
      }
    });

    return { success: true, channel: "SMS" };
  }
};