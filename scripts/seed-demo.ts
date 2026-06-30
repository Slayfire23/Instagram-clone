import { config } from "dotenv";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

const demoUsers = [
  {
    clerkId: "demo_clerk_maya_roots",
    email: "maya.roots@demo.local",
    username: "maya_roots",
    name: "Maya Roots",
    bio: "Coffee, campus walks, and tiny photo dumps.",
    image: null,
    posts: [
      {
        caption: "Morning light makes everything look like a fresh start.",
        mediaUrl: "/assets/demo-posts/morning-light.svg",
      },
      {
        caption: "Found a quiet corner that understands the assignment.",
        mediaUrl: "/assets/demo-posts/quiet-corner.svg",
      },
    ],
  },
  {
    clerkId: "demo_clerk_noah_frames",
    email: "noah.frames@demo.local",
    username: "noahframes",
    name: "Noah Frames",
    bio: "Trying to make ordinary places look cinematic.",
    image: null,
    posts: [
      {
        caption: "Late afternoon colors always win.",
        mediaUrl: "/assets/demo-posts/afternoon-colors.svg",
      },
      {
        caption: "A little blur, a little motion, a lot of mood.",
        mediaUrl: "/assets/demo-posts/motion-mood.svg",
      },
    ],
  },
  {
    clerkId: "demo_clerk_lina_bites",
    email: "lina.bites@demo.local",
    username: "linabites",
    name: "Lina Bites",
    bio: "Snacks, study breaks, and weekend plans.",
    image: null,
    posts: [
      {
        caption: "Best part of the day: something sweet after class.",
        mediaUrl: "/assets/demo-posts/sweet-break.svg",
      },
      {
        caption: "Weekend checklist: food, friends, no alarms.",
        mediaUrl: "/assets/demo-posts/weekend-plans.svg",
      },
    ],
  },
];

async function main() {
  const realUser = await prisma.user.findFirst({
    where: {
      clerkId: {
        not: {
          startsWith: "demo_clerk_",
        },
      },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, username: true },
  });

  const seededUsers = [];

  for (const demoUser of demoUsers) {
    const user = await prisma.user.upsert({
      where: { clerkId: demoUser.clerkId },
      update: {
        email: demoUser.email,
        username: demoUser.username,
        name: demoUser.name,
        bio: demoUser.bio,
        image: demoUser.image,
        isPrivate: false,
      },
      create: {
        clerkId: demoUser.clerkId,
        email: demoUser.email,
        username: demoUser.username,
        name: demoUser.name,
        bio: demoUser.bio,
        image: demoUser.image,
        isPrivate: false,
      },
      select: { id: true, username: true },
    });

    seededUsers.push(user);

    await prisma.post.deleteMany({
      where: { authorId: user.id },
    });

    for (const [index, post] of demoUser.posts.entries()) {
      await prisma.post.create({
        data: {
          authorId: user.id,
          type: "IMAGE",
          mediaType: "IMAGE",
          mediaUrl: post.mediaUrl,
          caption: post.caption,
          createdAt: new Date(Date.now() - (seededUsers.length * 2 + index) * 60 * 60 * 1000),
        },
      });
    }
  }

  if (realUser) {
    await prisma.user.update({
      where: { id: realUser.id },
      data: {
        following: {
          connect: seededUsers.map((user) => ({ id: user.id })),
        },
      },
    });
  }

  const postCount = await prisma.post.count({
    where: {
      author: {
        clerkId: {
          startsWith: "demo_clerk_",
        },
      },
    },
  });

  console.log(
    `Seeded ${seededUsers.length} demo users and ${postCount} demo posts` +
      (realUser ? `; @${realUser.username} now follows them.` : "."),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
