import { checkAuth } from "@/lib/auth";
import SignInForm from "@/app/(auth)/components/SignInForm";

export default async function SignInPage() {
  await checkAuth();

  return (
    <div className="flex items-center justify-center min-h-screen bg-white px-4">
      <div className="w-full max-w-lg">
        <SignInForm />
      </div>
    </div>
  );
}
