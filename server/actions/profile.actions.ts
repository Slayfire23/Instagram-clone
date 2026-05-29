"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { editProfileSchema } from "@/app/(main)/profile/edit/validations/EditProfile";
import { ensureCurrentUserProfile } from "@/server/actions/user.actions";

export async function getProfile() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    let user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      include: {
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      const ensured = await ensureCurrentUserProfile();
      if (!ensured) return null;

      user = await prisma.user.findUnique({
        where: { clerkId: clerkUser.id },
        include: {
          _count: {
            select: {
              posts: true,
              followers: true,
              following: true,
            },
          },
        },
      });
    }

    return user;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

export async function getProfileByUsername(username: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    return user;
  } catch (error) {
    console.error("Error fetching profile by username:", error);
    return null;
  }
}

export async function updateUserProfile(data: {
  username: string;
  website: string | null;
  bio: string | null;
  gender: string | null;
  isPrivate: boolean;
  image: string | null;
}) {
  const parsed = editProfileSchema.safeParse({
    username: data.username,
    website: data.website ?? "",
    bio: data.bio ?? "",
    gender: data.gender ?? "",
    isPrivate: data.isPrivate,
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }

  try {
    const clerkUser = await currentUser();
    if (!clerkUser) throw new Error("Not authenticated");

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: { id: true, username: true },
    });
    if (!user) throw new Error("User not found");

    // Check username uniqueness if changed
    if (data.username !== user.username) {
      const existing = await prisma.user.findUnique({
        where: { username: data.username },
        select: { id: true },
      });
      if (existing) throw new Error("Username is already taken");
    }

    await prisma.user.update({
      where: { clerkId: clerkUser.id },
      data: {
        username: data.username,
        website: data.website || null,
        bio: data.bio || null,
        gender: data.gender || null,
        isPrivate: data.isPrivate,
        image: data.image,
      },
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}
