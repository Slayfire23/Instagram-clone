"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getUser } from "@/server/actions/user.actions";

const STORY_EXPIRY_HOURS = 24;

function expiryDate() {
  const d = new Date();
  d.setHours(d.getHours() - STORY_EXPIRY_HOURS);
  return d;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type StoryWithMeta = {
  id: string;
  mediaUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  createdAt: Date;
  author: {
    id: string;
    username: string;
    image: string | null;
  };
  viewed: boolean;
  viewCount: number;
};

export type FeedStoryGroup = {
  author: {
    id: string;
    username: string;
    image: string | null;
  };
  latestStoryId: string;
  hasUnviewed: boolean;
  isOwn: boolean;
};

// ─── Feed stories (one circle per user) ─────────────────────────────────────

export async function getFeedStoryGroups(): Promise<FeedStoryGroup[]> {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return [];

    const user = await getUser(clerkUser.id);
    if (!user) return [];

    const since = expiryDate();

    // Get own stories + stories from followed users
    const userWithFollowing = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        following: { select: { id: true } },
      },
    });

    const followingIds = userWithFollowing?.following.map((u) => u.id) ?? [];
    const authorIds = [user.id, ...followingIds];

    // Fetch one latest story per author (active in last 24h)
    const stories = await prisma.story.findMany({
      where: {
        authorId: { in: authorIds },
        createdAt: { gte: since },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        authorId: true,
        createdAt: true,
        author: {
          select: { id: true, username: true, image: true },
        },
        viewedBy: {
          where: { userId: user.id },
          select: { id: true },
        },
      },
    });

    // Group by author — one circle per author
    const groupMap = new Map<string, FeedStoryGroup>();

    for (const story of stories) {
      if (!groupMap.has(story.authorId)) {
        const viewed = story.viewedBy.length > 0;
        groupMap.set(story.authorId, {
          author: story.author,
          latestStoryId: story.id,
          hasUnviewed: !viewed,
          isOwn: story.authorId === user.id,
        });
      } else {
        // Already have a newer story; check if any are unviewed
        if (story.viewedBy.length === 0) {
          groupMap.get(story.authorId)!.hasUnviewed = true;
        }
      }
    }

    const groups = Array.from(groupMap.values());

    // Own story always first, then others
    return groups.sort((a, b) => {
      if (a.isOwn) return -1;
      if (b.isOwn) return 1;
      return 0;
    });
  } catch (error) {
    console.error("Error fetching feed story groups:", error);
    return [];
  }
}

// ─── All stories by a specific author ───────────────────────────────────────

export async function getStoriesByAuthor(authorId: string): Promise<StoryWithMeta[]> {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return [];

    const user = await getUser(clerkUser.id);
    if (!user) return [];

    const since = expiryDate();

    const stories = await prisma.story.findMany({
      where: {
        authorId,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        mediaUrl: true,
        mediaType: true,
        createdAt: true,
        author: {
          select: { id: true, username: true, image: true },
        },
        viewedBy: {
          where: { userId: user.id },
          select: { id: true },
        },
        _count: {
          select: {
            viewedBy: {
              where: { userId: { not: authorId } },
            },
          },
        },
      },
    });

    return stories.map((s) => ({
      id: s.id,
      mediaUrl: s.mediaUrl,
      mediaType: s.mediaType,
      createdAt: s.createdAt,
      author: s.author,
      viewed: s.viewedBy.length > 0,
      viewCount: s._count.viewedBy,
    }));
  } catch (error) {
    console.error("Error fetching stories by author:", error);
    return [];
  }
}

// ─── Create story ────────────────────────────────────────────────────────────

export async function createStory(mediaUrl: string, mediaType: "IMAGE" | "VIDEO") {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return { error: "Unauthorized" };

    const user = await getUser(clerkUser.id);
    if (!user) return { error: "User not found" };

    const story = await prisma.story.create({
      data: {
        mediaUrl,
        mediaType,
        authorId: user.id,
      },
    });

    revalidatePath("/feed");
    return { story };
  } catch (error) {
    console.error("Error creating story:", error);
    return { error: "Failed to create story" };
  }
}

// ─── Mark story as viewed ────────────────────────────────────────────────────

export async function markStoryViewed(storyId: string) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return;

    const user = await getUser(clerkUser.id);
    if (!user) return;

    await prisma.viewedStory.upsert({
      where: { userId_storyId: { userId: user.id, storyId } },
      create: { userId: user.id, storyId },
      update: { viewedAt: new Date() },
    });
    revalidatePath("/feed");
  } catch (error) {
    console.error("Error marking story viewed:", error);
  }
}

// ─── Delete story ────────────────────────────────────────────────────────────

export async function deleteStory(storyId: string) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return { error: "Unauthorized" };

    const user = await getUser(clerkUser.id);
    if (!user) return { error: "User not found" };

    const story = await prisma.story.findUnique({ where: { id: storyId } });
    if (!story || story.authorId !== user.id) return { error: "Not found" };

    await prisma.story.delete({ where: { id: storyId } });
    return { success: true };
  } catch (error) {
    console.error("Error deleting story:", error);
    return { error: "Failed to delete story" };
  }
}

// ─── Get viewers list (owner only) ───────────────────────────────────────────

export async function getStoryViewers(storyId: string) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return [];

    const user = await getUser(clerkUser.id);
    if (!user) return [];

    const story = await prisma.story.findUnique({ where: { id: storyId } });
    if (!story || story.authorId !== user.id) return [];

    const viewers = await prisma.viewedStory.findMany({
      where: {
        storyId,
        userId: { not: user.id },
      },
      orderBy: { viewedAt: "desc" },
      select: {
        viewedAt: true,
        user: {
          select: { id: true, username: true, name: true, image: true },
        },
      },
    });

    return viewers;
  } catch (error) {
    console.error("Error fetching story viewers:", error);
    return [];
  }
}