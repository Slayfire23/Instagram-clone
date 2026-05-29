import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SignUpForm from "@/app/(auth)/components/SignUpForm";

export default async function SignUpPage() {
  const user = await currentUser();
  if (user) redirect("/feed");

  return (
    <div className="flex items-center justify-center min-h-screen bg-white px-4">
      <div className="w-full max-w-lg">
        <SignUpForm />
      </div>
    </div>
  );
}
