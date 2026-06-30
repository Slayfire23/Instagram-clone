"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getUser } from "@/server/actions/user.actions";
import { createPostSchema } from "@/app/(main)/validations/CreatePost";

async function getAuthenticatedUserId() {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Not authenticated");

  const user = await getUser(clerkUser.id);
  if (!user) throw new Error("User not found");

  return user.id;
}

export async function createPost(data: {
  mediaUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  type: "IMAGE" | "REEL";
  caption?: string;
}) {
  const parsed = createPostSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const userId = await getAuthenticatedUserId();

  const post = await prisma.post.create({
    data: {
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType,
      type: data.type,
      caption: data.caption || null,
      authorId: userId,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/feed");

  return post;
}

export async function getPostById(postId: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        mediaUrl: true,
        mediaType: true,
        type: true,
        caption: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            username: true,
            image: true,
            name: true,
          },
        },
        interactions: {
          select: { type: true },
        },
      },
    });

    if (!post) return null;

    const likes = post.interactions.filter((i) => i.type === "LIKE").length;
    const comments = post.interactions.filter((i) => i.type === "COMMENT").length;
    return {
      id: post.id,
      mediaUrl: post.mediaUrl,
      mediaType: post.mediaType,
      type: post.type,
      caption: post.caption,
      createdAt: post.createdAt,
      author: post.author,
      _count: { likes, comments },
    };
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

export async function deletePost(postId: string) {
  const userId = await getAuthenticatedUserId();

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });
  if (!post) throw new Error("Post not found");
  if (post.authorId !== userId) throw new Error("Not authorized");

  await prisma.post.delete({ where: { id: postId } });

  revalidatePath("/profile");
  revalidatePath("/feed");
}

export async function getUserOwnPosts() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return [];

    const user = await getUser(clerkUser.id);
    if (!user) return [];

    return getPostsWithCounts(user.id);
  } catch (error) {
    console.error("Error fetching user own posts:", error);
    return [];
  }
}

export async function getUserPostsByUsername(username: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    if (!user) return [];

    return getPostsWithCounts(user.id);
  } catch (error) {
    console.error("Error fetching user posts by username:", error);
    return [];
  }
}

export async function getFeedPosts(cursor?: string) {
  const PAGE_SIZE = 10;

  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return { posts: [], hasMore: false };

    const user = await getUser(clerkUser.id);
    if (!user) return { posts: [], hasMore: false };

    // Get IDs of users the current user follows
    const currentUserWithFollowing = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        following: {
          select: { id: true },
        },
      },
    });

    const followingIds = [
      user.id,
      ...(currentUserWithFollowing?.following.map((u) => u.id) ?? []),
    ];

    const posts = await prisma.post.findMany({
      where: {
        authorId: { in: followingIds },
      },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: {
        id: true,
        mediaUrl: true,
        mediaType: true,
        type: true,
        caption: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            username: true,
            image: true,
            name: true,
          },
        },
        interactions: {
          where: { type: { in: ["LIKE", "SAVED"] } },
          select: { userId: true, type: true },
        },
        _count: {
          select: {
            interactions: {
              where: { type: "COMMENT" },
            },
          },
        },
      },
    });

    const hasMore = posts.length > PAGE_SIZE;
    const results = hasMore ? posts.slice(0, PAGE_SIZE) : posts;

    return {
      posts: results.map((post) => {
        const likeCount = post.interactions.filter((i) => i.type === "LIKE").length;
        const liked = post.interactions.some((i) => i.type === "LIKE" && i.userId === user.id);
        const saved = post.interactions.some((i) => i.type === "SAVED" && i.userId === user.id);
        return {
          id: post.id,
          mediaUrl: post.mediaUrl,
          mediaType: post.mediaType,
          type: post.type,
          caption: post.caption,
          createdAt: post.createdAt,
          author: post.author,
          likeCount,
          liked,
          saved,
          commentCount: post._count.interactions,
        };
      }),
      hasMore,
    };
  } catch (error) {
    console.error("Error fetching feed posts:", error);
    return { posts: [], hasMore: false };
  }
}

export async function getSuggestedUsers() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return [];

    const user = await getUser(clerkUser.id);
    if (!user) return [];

    // Get IDs of users the current user already follows + pending requests
    const currentUserData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        following: { select: { id: true } },
        sentInteractions: {
          where: { type: "FOLLOW_REQUEST" },
          select: { targetUserId: true },
        },
      },
    });

    const excludeIds = [
      user.id,
      ...(currentUserData?.following.map((u) => u.id) ?? []),
      ...(currentUserData?.sentInteractions
        .map((i) => i.targetUserId)
        .filter((id): id is string => id !== null) ?? []),
    ];

    const suggestions = await prisma.user.findMany({
      where: {
        id: { notIn: excludeIds },
      },
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return suggestions;
  } catch (error) {
    console.error("Error fetching suggested users:", error);
    return [];
  }
}

export async function getSavedPosts() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return [];

    const user = await getUser(clerkUser.id);
    if (!user) return [];

    const saved = await prisma.interaction.findMany({
      where: {
        userId: user.id,
        type: "SAVED",
        postId: { not: null },
      },
      orderBy: { createdAt: "desc" },
      select: {
        post: {
          select: {
            id: true,
            mediaUrl: true,
            mediaType: true,
            type: true,
            caption: true,
            createdAt: true,
            author: {
              select: {
                username: true,
                image: true,
              },
            },
            interactions: {
              select: { type: true },
            },
          },
        },
      },
    });

    return saved
      .map((item) => item.post)
      .filter((post): post is NonNullable<typeof post> => post !== null)
      .map((post) => {
        const likes = post.interactions.filter((i) => i.type === "LIKE").length;
        const comments = post.interactions.filter((i) => i.type === "COMMENT").length;
        return {
          id: post.id,
          mediaUrl: post.mediaUrl,
          mediaType: post.mediaType,
          type: post.type,
          caption: post.caption,
          createdAt: post.createdAt,
          author: post.author,
          _count: { likes, comments },
        };
      });
  } catch (error) {
    console.error("Error fetching saved posts:", error);
    return [];
  }
}

async function getPostsWithCounts(authorId: string) {
  const posts = await prisma.post.findMany({
    where: { authorId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      mediaUrl: true,
      mediaType: true,
      type: true,
      caption: true,
      createdAt: true,
      author: {
        select: {
          username: true,
          image: true,
        },
      },
      interactions: {
        select: { type: true },
      },
    },
  });

  return posts.map((post) => {
    const likes = post.interactions.filter((i) => i.type === "LIKE").length;
    const comments = post.interactions.filter((i) => i.type === "COMMENT").length;
    return {
      id: post.id,
      mediaUrl: post.mediaUrl,
      mediaType: post.mediaType,
      type: post.type,
      caption: post.caption,
      createdAt: post.createdAt,
      author: post.author,
      _count: { likes, comments },
    };
  });
}
