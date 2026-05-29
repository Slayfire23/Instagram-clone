"use server";

import prisma from "@/lib/prisma";

export async function searchUsers(query: string) {
  try {
    if (!query || query.trim().length === 0) return [];

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        username: true,
        name: true,
        image: true,
        _count: {
          select: {
            followers: true,
          },
        },
      },
      orderBy: [
        { followers: { _count: "desc" } },
        { username: "asc" },
      ],
      take: 10,
    });

    return users;
  } catch (error) {
    console.error("Error searching users:", error);
    return [];
  }
}