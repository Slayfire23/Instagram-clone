"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { getUser } from "@/server/actions/user.actions";

export type FollowNotificationType =
  | "FOLLOW"
  | "FOLLOW_REQUEST"
  | "FOLLOW_REQUEST_ACCEPTED"
  | "FOLLOW_REQUEST_REJECTED";

export async function createNotification(
  senderId: string,
  recipientId: string,
  type: FollowNotificationType,
  postId?: string
) {
  await prisma.notification.create({
    data: {
      type,
      senderId,
      recipientId,
      ...(postId && { postId }),
    },
  });
}

export async function deleteNotification(
  senderId: string,
  recipientId: string,
  type: FollowNotificationType
) {
  await prisma.notification.deleteMany({
    where: { senderId, recipientId, type },
  });
}

export async function markNotificationAsRead(notificationId: string) {
  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

export async function getNotifications() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return [];

    const user = await getUser(clerkUser.id);
    if (!user) return [];

    const notifications = await prisma.notification.findMany({
      where: { recipientId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        type: true,
        isRead: true,
        createdAt: true,
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
        post: {
          select: {
            id: true,
            mediaUrl: true,
            mediaType: true,
          },
        },
      },
    });

    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return;

    const user = await getUser(clerkUser.id);
    if (!user) return;

    await prisma.notification.updateMany({
      where: { recipientId: user.id, isRead: false },
      data: { isRead: true },
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
  }
}

export async function getUnreadNotificationCount() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return 0;

    const user = await getUser(clerkUser.id);
    if (!user) return 0;

    return await prisma.notification.count({
      where: { recipientId: user.id, isRead: false },
    });
  } catch (error) {
    console.error("Error fetching unread notification count:", error);
    return 0;
  }
}