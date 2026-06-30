import { currentUser } from "@clerk/nextjs/server";
import { ensureCurrentUserProfile } from "@/server/actions/user.actions";
import { redirect } from "next/navigation";

export async function checkAuth() {
  const clerkUser = await currentUser();
  if (!clerkUser) return;

  const user = await ensureCurrentUserProfile();
  if (user) redirect("/feed");
}
