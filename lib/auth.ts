import { currentUser } from "@clerk/nextjs/server";
import { getUser } from "@/server/actions/user.actions";
import { redirect } from "next/navigation";

export async function checkAuth() {
  const clerkUser = await currentUser();
  if (!clerkUser) return;

  const user = await getUser(clerkUser.id);
  if (user) redirect("/feed");
}