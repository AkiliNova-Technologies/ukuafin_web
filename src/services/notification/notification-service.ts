import { prisma } from "@/lib/prisma/client";
import { NotificationType } from "@prisma/client";

interface NotificationOptions {
  organizationId: string;
  userId: string | null;
  type: NotificationType;
  title: string;
  message: string;
}

export async function dispatchNotification(payload: NotificationOptions) {
  try {
    return await prisma.notification.create({
      data: {
        organizationId: payload.organizationId,
        userId: payload.userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
      },
    });
  } catch (error) {
    console.error("ERROR: Failed to cascade notification pipeline transaction:", error);
  }
}