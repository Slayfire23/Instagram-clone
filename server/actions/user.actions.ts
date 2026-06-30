'use server'

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";


export type ClerkWebhookUserData = {
  id: string;
  email_addresses: { email_address: string }[];
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  image_url: string;
  unsafe_metadata?: {
    username?: string;
  };
};

export type ClerkWebhookDeleteData = {
  id: string;
};

export async function getUser(clerkId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

function buildUniqueUsernameBase(rawUsername: string | null | undefined, email: string | undefined) {
  const fallback = rawUsername ?? email?.split("@")[0] ?? `user_${Date.now()}`;
  const normalized = fallback
    .toLowerCase()
    .replace(/[^a-z0-9._]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || `user_${Date.now()}`;
}

async function ensureUniqueUsername(base: string, clerkId: string) {
  let username = base;
  let suffix = 1;

  while (true) {
    const existing = await prisma.user.findUnique({
      where: { username },
      select: { clerkId: true },
    });

    if (!existing || existing.clerkId === clerkId) {
      return username;
    }

    username = `${base}_${suffix}`;
    suffix += 1;
  }
}

export async function ensureCurrentUserProfile() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (existingUser) return existingUser;

    const email =
      clerkUser.emailAddresses[0]?.emailAddress ?? `${clerkUser.id}@no-email.local`;

    const requestedUsername =
      typeof clerkUser.unsafeMetadata?.username === "string"
        ? clerkUser.unsafeMetadata.username
        : null;
    const baseUsername = buildUniqueUsernameBase(
      clerkUser.username ?? requestedUsername,
      email
    );
    const username = await ensureUniqueUsername(baseUsername, clerkUser.id);
    const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;

    return await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email,
        username,
        name,
        image: clerkUser.imageUrl,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error ensuring current user profile:", message);
    return null;
  }
}

export async function createOrUpdateUser(data: ClerkWebhookUserData) {
  try {
    const email = data.email_addresses[0]?.email_address ?? `${data.id}@no-email.local`;

    const username = await ensureUniqueUsername(
      buildUniqueUsernameBase(data.username ?? data.unsafe_metadata?.username, email),
      data.id
    );
    const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || null;

    const user = await prisma.user.upsert({
      where: { clerkId: data.id },
      create: {
        clerkId: data.id,
        email,
        username,
        name,
        image: data.image_url,
      },
      update: {
        email,
        username,
        name,
        image: data.image_url,
      },
    });

    return user;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error creating or updating user:", message);
    throw new Error(`Failed to create or update user: ${message}`);
  }
}

export async function deleteUser(data: ClerkWebhookDeleteData) {
  try {
    await prisma.user.delete({
      where: { clerkId: data.id },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error deleting user:", message);
    throw new Error(`Failed to delete user: ${message}`);
  }
}
