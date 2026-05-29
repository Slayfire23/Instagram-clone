import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SignInForm from "@/app/(auth)/components/SignInForm";

export default async function SignInPage() {
  const user = await currentUser();
  if (user) redirect("/feed");

  return (
    <div className="flex items-center justify-center min-h-screen bg-white px-4">
      <div className="w-full max-w-lg">
        <SignInForm />
      </div>
    </div>
  );
}
