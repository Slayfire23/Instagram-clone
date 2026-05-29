"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs/legacy";
import { useForm, Controller } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInSchema, SignInType, verificationCodeSchema, VerificationCodeType } from "@/app/(auth)/validations/SignIn";

export default function SignInForm() {
  const router = useRouter();
  const { signIn, isLoaded, setActive } = useSignIn();
  const [step, setStep] = useState<"credentials" | "verify">("credentials");
  const [error, setError] = useState<string | null>(null);
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  const credForm = useForm<SignInType>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const codeForm = useForm<VerificationCodeType>({
    resolver: zodResolver(verificationCodeSchema),
    defaultValues: { code: "" },
  });

  // ── OAuth ──────────────────────────────────────────────────────────────────
  async function handleOAuth(strategy: "oauth_google" | "oauth_facebook") {
    if (!isLoaded) return;
    setError(null);
    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: `${appUrl}/sign-in/verify`,
        redirectUrlComplete: "/feed",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "OAuth sign-in failed.";
      setError(msg);
    }
  }

  // ── Email + password ───────────────────────────────────────────────────────
  async function onCredentialsSubmit(data: SignInType) {
    if (!isLoaded) return;
    setError(null);
    try {
      const result = await signIn.create({
        identifier: data.email,
        password: data.password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/feed");
      } else if (result.status === "needs_second_factor") {
        await signIn.prepareSecondFactor({ strategy: "email_code" });
        setPendingSessionId(result.createdSessionId);
        setStep("verify");
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string }[] };
      setError(clerkErr.errors?.[0]?.message ?? "Sign-in failed. Please check your credentials.");
    }
  }

  // ── Second-factor verification ─────────────────────────────────────────────
  async function onCodeSubmit(data: VerificationCodeType) {
    if (!isLoaded) return;
    setError(null);
    try {
      const result = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code: data.code,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId ?? pendingSessionId });
        router.push("/feed");
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string }[] };
      setError(clerkErr.errors?.[0]?.message ?? "Invalid code. Please try again.");
    }
  }

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col w-full gap-5">
      {/* Title */}
      <h2 className="text-xl font-semibold">Log into Instagram</h2>

      {step === "credentials" ? (
        <>
          {/* Email + password form */}
          <form onSubmit={credForm.handleSubmit(onCredentialsSubmit)} className="flex flex-col gap-4">
            <Controller
              name="email"
              control={credForm.control}
              render={({ field, fieldState }) => (
                <div className="flex flex-col gap-1">
                  <Input
                    {...field}
                    placeholder="Email"
                    aria-invalid={fieldState.invalid}
                    autoComplete="email"
                    className="h-14 text-base rounded-2xl bg-white border-gray-300 w-full"
                  />
                  {fieldState.error && (
                    <p className="text-xs text-red-500">{fieldState.error.message}</p>
                  )}
                </div>
              )}
            />

            <Controller
              name="password"
              control={credForm.control}
              render={({ field, fieldState }) => (
                <div className="flex flex-col gap-1">
                  <Input
                    {...field}
                    type="password"
                    placeholder="Password"
                    aria-invalid={fieldState.invalid}
                    autoComplete="current-password"
                    className="h-14 text-base rounded-2xl bg-white border-gray-300 w-full"
                  />
                  {fieldState.error && (
                    <p className="text-xs text-red-500">{fieldState.error.message}</p>
                  )}
                </div>
              )}
            />

            {error && <p className="text-xs text-red-500 text-center">{error}</p>}

            <Button
              type="submit"
              disabled={credForm.formState.isSubmitting}
              className="w-full h-12 rounded-2xl bg-[#0095F6] hover:bg-[#1877F2] text-white font-semibold text-base"
            >
              {credForm.formState.isSubmitting ? "Logging in..." : "Log in"}
            </Button>
          </form>

          {/* Forgot password */}
          <div className="text-center">
            <Button 
            variant={"ghost"}
            className="w-full hover:text-gray-700 text-base text-black font-medium cursor-pointer rounded-2xl">
              Forgot password?
            </Button>
          </div>

          {/* OAuth */}
          <Button
            type="button"
            onClick={() => handleOAuth("oauth_facebook")}
            className="w-full h-12 rounded-2xl bg-white text-black border border-gray-300 hover:bg-gray-100 hover:border-gray-500 hover:text-gray-700 font-semibold text-base flex items-center justify-center gap-2 shadow-none cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.313 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.883v2.258h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
            </svg>
            Log in with Facebook
          </Button>

          <Button
            type="button"
            onClick={() => handleOAuth("oauth_google")}
            className="w-full h-12 rounded-2xl bg-white text-black border border-gray-300 hover:bg-gray-100 hover:border-gray-500 hover:text-gray-700 font-semibold text-base flex items-center justify-center gap-2 shadow-none cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/>
              <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.615 24 12.255 24z"/>
              <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 0 0 0 10.76l3.98-3.09z"/>
              <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.64 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/>
            </svg>
            Log in with Google
          </Button>

          {/* Create account */}
          <Link
            href="/sign-up"
            className="w-full h-12 rounded-2xl border border-blue-400 hover:bg-gray-100 hover:border-gray-500 text-[#0095F6] hover:text-gray-700 font-semibold text-base flex items-center justify-center transition-colors cursor-pointer"
          >
            Create new account
          </Link>
        </>
      ) : (
        <>
          {/* Verification code form */}
          <p className="text-sm text-muted-foreground text-center">
            Enter the verification code sent to your email.
          </p>
          <form onSubmit={codeForm.handleSubmit(onCodeSubmit)} className="flex flex-col gap-4">
            <Controller
              name="code"
              control={codeForm.control}
              render={({ field, fieldState }) => (
                <div className="flex flex-col gap-1">
                  <Input
                    {...field}
                    placeholder="Verification code"
                    aria-invalid={fieldState.invalid}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    className="h-14 text-base rounded-2xl bg-white border-gray-300 w-full"
                  />
                  {fieldState.error && (
                    <p className="text-xs text-red-500">{fieldState.error.message}</p>
                  )}
                </div>
              )}
            />

            {error && <p className="text-xs text-red-500 text-center">{error}</p>}

            <Button
              type="submit"
              disabled={codeForm.formState.isSubmitting}
              className="w-full h-12 rounded-2xl bg-[#0095F6] hover:bg-[#1877F2] text-white font-semibold text-base"
            >
              {codeForm.formState.isSubmitting ? "Verifying..." : "Confirm"}
            </Button>
          </form>
        </>
      )}

      {/* Meta footer */}
      <div className="flex items-center justify-center gap-2 mt-2">
        <Image src="/assets/meta-logo-3.png" alt="Meta" width={22} height={22} />
        <span className="text-base font-medium text-black">Meta</span>
      </div>
    </div>
  );
}