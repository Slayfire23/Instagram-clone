"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { getUser } from "@/server/actions/user.actions";
import {
  createNotification,
  deleteNotification,
  markNotificationAsRead,
} from "@/server/actions/notification.actions";

export type FollowStatus = "self" | "following" | "requested" | "none";

async function getAuthenticatedUserId() {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Not authenticated");

  const user = await getUser(clerkUser.id);
  if (!user) throw new Error("User not found");

  return user.id;
}

export async function getFollowStatus(targetUserId: string): Promise<FollowStatus> {
  try {
    const userId = await getAuthenticatedUserId();

    if (userId === targetUserId) return "self";

    const isFollowing = await prisma.user.findFirst({
      where: {
        id: userId,
        following: { some: { id: targetUserId } },
      },
      select: { id: true },
    });
    if (isFollowing) return "following";

    const pendingRequest = await prisma.interaction.findFirst({
      where: {
        userId,
        targetUserId,
        type: "FOLLOW_REQUEST",
      },
      select: { id: true },
    });
    if (pendingRequest) return "requested";

    return "none";
  } catch (error) {
    console.error("Error getting follow status:", error);
    return "none";
  }
}

export async function followUser(targetUserId: string) {
  const userId = await getAuthenticatedUserId();

  if (userId === targetUserId) throw new Error("Cannot follow yourself");

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, isPrivate: true },
  });
  if (!targetUser) throw new Error("Target user not found");

  if (targetUser.isPrivate) {
    return sendFollowRequest(targetUserId);
  }

  return instantFollow(targetUserId);
}

async function instantFollow(targetUserId: string) {
  const userId = await getAuthenticatedUserId();

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { following: { connect: { id: targetUserId } } },
    }),
    prisma.interaction.create({
      data: {
        type: "FOLLOW",
        userId,
        targetUserId,
      },
    }),
  ]);

  await createNotification(userId, targetUserId, "FOLLOW");

  return "following" as FollowStatus;
}

export async function unfollowUser(targetUserId: string) {
  const userId = await getAuthenticatedUserId();

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { following: { disconnect: { id: targetUserId } } },
    }),
    prisma.interaction.deleteMany({
      where: {
        userId,
        targetUserId,
        type: "FOLLOW",
      },
    }),
  ]);

  return "none" as FollowStatus;
}

async function sendFollowRequest(targetUserId: string) {
  const userId = await getAuthenticatedUserId();

  await prisma.interaction.create({
    data: {
      type: "FOLLOW_REQUEST",
      userId,
      targetUserId,
    },
  });

  await createNotification(userId, targetUserId, "FOLLOW_REQUEST");

  return "requested" as FollowStatus;
}

export async function cancelFollowRequest(targetUserId: string) {
  const userId = await getAuthenticatedUserId();

  await prisma.interaction.deleteMany({
    where: {
      userId,
      targetUserId,
      type: "FOLLOW_REQUEST",
    },
  });

  await deleteNotification(userId, targetUserId, "FOLLOW_REQUEST");

  return "none" as FollowStatus;
}

export async function toggleFollow(targetUserId: string): Promise<FollowStatus> {
  const userId = await getAuthenticatedUserId();

  if (userId === targetUserId) throw new Error("Cannot follow yourself");

  // Already following → unfollow
  const isFollowing = await prisma.user.findFirst({
    where: {
      id: userId,
      following: { some: { id: targetUserId } },
    },
    select: { id: true },
  });
  if (isFollowing) return unfollowUser(targetUserId);

  // Pending request → cancel
  const pendingRequest = await prisma.interaction.findFirst({
    where: {
      userId,
      targetUserId,
      type: "FOLLOW_REQUEST",
    },
    select: { id: true },
  });
  if (pendingRequest) return cancelFollowRequest(targetUserId);

  // Not following → follow (handles public vs private internally)
  return followUser(targetUserId);
}

export async function acceptFollowRequest(notificationId: string) {
  const userId = await getAuthenticatedUserId();

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    select: { senderId: true, recipientId: true, type: true },
  });

  if (!notification || notification.type !== "FOLLOW_REQUEST") {
    throw new Error("Invalid notification");
  }
  if (notification.recipientId !== userId) {
    throw new Error("Not authorized");
  }

  const senderId = notification.senderId;

  await prisma.$transaction([
    // Create follow relationship
    prisma.user.update({
      where: { id: senderId },
      data: { following: { connect: { id: userId } } },
    }),
    // Replace FOLLOW_REQUEST interaction with FOLLOW
    prisma.interaction.deleteMany({
      where: {
        userId: senderId,
        targetUserId: userId,
        type: "FOLLOW_REQUEST",
      },
    }),
    prisma.interaction.create({
      data: {
        type: "FOLLOW",
        userId: senderId,
        targetUserId: userId,
      },
    }),
  ]);

  await markNotificationAsRead(notificationId);
  await createNotification(userId, senderId, "FOLLOW_REQUEST_ACCEPTED");
}

export async function rejectFollowRequest(notificationId: string) {
  const userId = await getAuthenticatedUserId();

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    select: { senderId: true, recipientId: true, type: true },
  });

  if (!notification || notification.type !== "FOLLOW_REQUEST") {
    throw new Error("Invalid notification");
  }
  if (notification.recipientId !== userId) {
    throw new Error("Not authorized");
  }

  await prisma.interaction.deleteMany({
    where: {
      userId: notification.senderId,
      targetUserId: userId,
      type: "FOLLOW_REQUEST",
    },
  });

  await markNotificationAsRead(notificationId);
}