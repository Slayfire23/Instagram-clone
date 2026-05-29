"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { getUser } from "@/server/actions/user.actions";

async function getAuthenticatedUserId() {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Not authenticated");

  const user = await getUser(clerkUser.id);
  if (!user) throw new Error("User not found");

  return user.id;
}

// ─── Likes ──────────────────────────────────────────────────────────────────

export async function likePost(postId: string) {
  const userId = await getAuthenticatedUserId();

  const existing = await prisma.interaction.findFirst({
    where: { userId, postId, type: "LIKE" },
    select: { id: true },
  });
  if (existing) return;

  await prisma.interaction.create({
    data: {
      type: "LIKE",
      userId,
      postId,
    },
  });

  // Send notification to post author
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });
  if (post && post.authorId !== userId) {
    await prisma.notification.create({
      data: {
        type: "LIKE",
        senderId: userId,
        recipientId: post.authorId,
        postId,
      },
    });
  }
}

export async function unlikePost(postId: string) {
  const userId = await getAuthenticatedUserId();

  await prisma.interaction.deleteMany({
    where: { userId, postId, type: "LIKE" },
  });

  // Remove like notification
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });
  if (post) {
    await prisma.notification.deleteMany({
      where: {
        senderId: userId,
        recipientId: post.authorId,
        postId,
        type: "LIKE",
      },
    });
  }
}

export async function hasUserLikedPost(postId: string) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return false;

    const user = await getUser(clerkUser.id);
    if (!user) return false;

    const like = await prisma.interaction.findFirst({
      where: { userId: user.id, postId, type: "LIKE" },
      select: { id: true },
    });

    return !!like;
  } catch {
    return false;
  }
}

// ─── Comments ───────────────────────────────────────────────────────────────

export async function addComment(postId: string, content: string, parentId?: string) {
  const userId = await getAuthenticatedUserId();

  const comment = await prisma.interaction.create({
    data: {
      type: "COMMENT",
      content,
      userId,
      postId,
      parentId: parentId || null,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: {
        select: {
          username: true,
          image: true,
        },
      },
      _count: {
        select: { replies: true },
      },
    },
  });

  // Send notification to post author (or parent comment author for replies)
  if (parentId) {
    const parentComment = await prisma.interaction.findUnique({
      where: { id: parentId },
      select: { userId: true },
    });
    if (parentComment && parentComment.userId !== userId) {
      await prisma.notification.create({
        data: {
          type: "REPLY",
          senderId: userId,
          recipientId: parentComment.userId,
          postId,
        },
      });
    }
  } else {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });
    if (post && post.authorId !== userId) {
      await prisma.notification.create({
        data: {
          type: "COMMENT",
          senderId: userId,
          recipientId: post.authorId,
          postId,
        },
      });
    }
  }

  return {
    id: comment.id,
    content: comment.content!,
    createdAt: comment.createdAt.toISOString(),
    user: comment.user,
    _count: { replies: comment._count.replies },
  };
}

export async function deleteComment(commentId: string) {
  const userId = await getAuthenticatedUserId();

  const comment = await prisma.interaction.findUnique({
    where: { id: commentId },
    select: { userId: true, postId: true },
  });
  if (!comment) throw new Error("Comment not found");

  // Allow deletion by comment author or post author
  if (comment.userId !== userId) {
    if (comment.postId) {
      const post = await prisma.post.findUnique({
        where: { id: comment.postId },
        select: { authorId: true },
      });
      if (!post || post.authorId !== userId) {
        throw new Error("Not authorized");
      }
    } else {
      throw new Error("Not authorized");
    }
  }

  await prisma.interaction.delete({ where: { id: commentId } });
}

export async function getComments(postId: string, cursor?: string) {
  const PAGE_SIZE = 20;

  const comments = await prisma.interaction.findMany({
    where: {
      postId,
      type: "COMMENT",
      parentId: null,
    },
    orderBy: { createdAt: "asc" },
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: {
        select: {
          username: true,
          image: true,
        },
      },
      _count: {
        select: { replies: true },
      },
    },
  });

  const hasMore = comments.length > PAGE_SIZE;
  const results = hasMore ? comments.slice(0, PAGE_SIZE) : comments;

  return {
    comments: results.map((c) => ({
      id: c.id,
      content: c.content!,
      createdAt: c.createdAt.toISOString(),
      user: c.user,
      _count: { replies: c._count.replies },
    })),
    hasMore,
  };
}

export async function getCommentReplies(commentId: string) {
  const replies = await prisma.interaction.findMany({
    where: {
      parentId: commentId,
      type: "COMMENT",
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: {
        select: {
          username: true,
          image: true,
        },
      },
      _count: {
        select: { replies: true },
      },
    },
  });

  return replies.map((r) => ({
    id: r.id,
    content: r.content!,
    createdAt: r.createdAt.toISOString(),
    user: r.user,
    _count: { replies: r._count.replies },
  }));
}

export async function getLikeCount(postId: string) {
  return prisma.interaction.count({
    where: { postId, type: "LIKE" },
  });
}