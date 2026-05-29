"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs/legacy";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { format, parse } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUpSchema, SignUpType, signUpVerificationSchema, SignUpVerificationType } from "@/app/(auth)/validations/SignUp";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => String(currentYear - i));

export default function SignUpForm() {
  const router = useRouter();
  const { signUp, isLoaded, setActive } = useSignUp();
  const [showVerification, setShowVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SignUpType>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "", password: "", fullName: "", username: "",
      month: "", day: "", year: "",
    },
  });

  const codeForm = useForm<SignUpVerificationType>({
    resolver: zodResolver(signUpVerificationSchema),
    defaultValues: { code: "" },
  });

  async function onSubmit(data: SignUpType) {
    if (!isLoaded) return;
    setIsLoading(true);
    setError(null);

    const parsed = parse(`${data.month} ${data.day} ${data.year}`, "MMMM d yyyy", new Date());
    const birthday = format(parsed, "yyyy-MM-dd");

    try {
      const signUpAttempt = await signUp.create({
        emailAddress: data.email,
        password: data.password,
        firstName: data.fullName.split(" ")[0],
        lastName: data.fullName.split(" ").slice(1).join(" ") || undefined,
        unsafeMetadata: { birthday, username: data.username },
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.push("/feed");
      } else {
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        setShowVerification(true);
      }
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        console.error(
          "Clerk sign-up error:",
          JSON.stringify(
            err.errors.map((e) => ({
              code: e.code,
              message: e.message,
              longMessage: e.longMessage,
              paramName: e.meta?.paramName,
            })),
            null,
            2
          )
        );
        const unhandledMessages: string[] = [];
        err.errors.forEach((e) => {
          const param = e.meta?.paramName;
          if (param === "email_address") form.setError("email", { message: e.message });
          else if (param === "password") form.setError("password", { message: e.message });
          else if (param === "username") form.setError("username", { message: e.message });
          unhandledMessages.push(
            [e.code, e.longMessage || e.message].filter(Boolean).join(": ")
          );
        });
        if (unhandledMessages.length > 0) {
          setError(unhandledMessages.join(" | "));
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function onVerify(data: SignUpVerificationType) {
    if (!isLoaded) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: data.code });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/feed");
      }
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        setError(err.errors[0]?.message ?? "Invalid code. Please try again.");
      } else {
        setError("Verification failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (showVerification) {
    return (
      <div className="flex flex-col items-center gap-6 w-full">
        {/* Logo */}
        <Image src="/assets/logo.svg" alt="Instagram" width={64} height={64} priority />

        {/* Heading */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-2xl font-bold">Verify your email</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            Enter the 6-digit code sent to{" "}
            <span className="font-medium text-black">{form.getValues("email")}</span>
          </p>
        </div>

        <form onSubmit={codeForm.handleSubmit(onVerify)} className="flex flex-col gap-4 w-full">
          <Controller
            name="code"
            control={codeForm.control}
            render={({ field, fieldState }) => (
              <div className="flex flex-col gap-1">
                <Input
                  {...field}
                  placeholder="Verification code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  className="h-14 text-lg rounded-2xl bg-white border-gray-300 w-full text-center tracking-widest"
                />
                {fieldState.error && (
                  <p className="text-xs text-red-500 text-center">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />

          {error && <p className="text-xs text-red-500 text-center">{error}</p>}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 rounded-2xl bg-[#0095F6] hover:bg-[#1877F2] text-white font-semibold text-lg cursor-pointer"
          >
            {isLoading ? "Verifying..." : "Verify"}
          </Button>
        </form>

        <button
          onClick={() => setShowVerification(false)}
          className="text-sm text-[#0095F6] cursor-pointer hover:text-blue-700 transition-colors"
        >
          &larr; Back to sign up
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Header */}
      <button
        onClick={() => router.back()}
        className="text-gray-500 hover:text-gray-700 cursor-pointer text-sm self-start"
      >
        &lt;
      </button>

      <div className="flex items-center gap-1">
        <Image src="/assets/meta-logo-3.png" alt="Meta" width={18} height={18} />
        <span className="text-sm font-medium">Meta</span>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-bold">Get started on Instagram</h1>
        <p className="text-base text-muted-foreground">
          Sign up to see photos and videos from your friends.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Email */}
        <div className="flex flex-col gap-1">
          <label className="text-base font-semibold">Email</label>
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="flex flex-col gap-1">
                <Input
                  {...field}
                  placeholder="Email"
                  autoComplete="email"
                  className="h-14 text-lg rounded-2xl bg-white border-gray-300 w-full"
                />
                {fieldState.error ? (
                  <p className="text-xs text-red-500">{fieldState.error.message}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    You may receive notifications from us.{" "}
                    <span className="text-[#0095F6] font-medium cursor-pointer">
                      Learn why we ask for your contact information
                    </span>
                  </p>
                )}
              </div>
            )}
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1">
          <label className="text-base font-semibold">Password</label>
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="flex flex-col gap-1">
                <Input
                  {...field}
                  type="password"
                  placeholder="Password"
                  autoComplete="new-password"
                  className="h-14 text-lg rounded-2xl bg-white border-gray-300 w-full"
                />
                {fieldState.error && (
                  <p className="text-xs text-red-500">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />
        </div>

        {/* Birthday */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold flex items-center gap-1">
            Birthday{" "}
            <span className="text-muted-foreground text-xs border border-gray-300 rounded-full w-4 h-4 flex items-center justify-center cursor-default">?</span>
          </label>
          <div className="flex gap-2">
            <Controller
              name="month"
              control={form.control}
              render={({ field }) => (
                <select
                  {...field}
                  className="flex-1 h-14 rounded-2xl border border-gray-300 bg-white px-3 text-base text-gray-500 appearance-none cursor-pointer"
                >
                  <option value="">Month</option>
                  {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              )}
            />
            <Controller
              name="day"
              control={form.control}
              render={({ field }) => (
                <select
                  {...field}
                  className="flex-1 h-14 rounded-2xl border border-gray-300 bg-white px-3 text-base text-gray-500 appearance-none cursor-pointer"
                >
                  <option value="">Day</option>
                  {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              )}
            />
            <Controller
              name="year"
              control={form.control}
              render={({ field }) => (
                <select
                  {...field}
                  className="flex-1 h-14 rounded-2xl border border-gray-300 bg-white px-3 text-base text-gray-500 appearance-none cursor-pointer"
                >
                  <option value="">Year</option>
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              )}
            />
          </div>
          {(form.formState.errors.month || form.formState.errors.day || form.formState.errors.year) && (
            <p className="text-xs text-red-500">Please select your full birthday</p>
          )}
        </div>

        {/* Full Name */}
        <div className="flex flex-col gap-1">
          <label className="text-base font-semibold">Name</label>
          <Controller
            name="fullName"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="flex flex-col gap-1">
                <Input
                  {...field}
                  placeholder="Full name"
                  autoComplete="name"
                  className="h-14 text-lg rounded-2xl bg-white border-gray-300 w-full"
                />
                {fieldState.error && (
                  <p className="text-xs text-red-500">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />
        </div>

        {/* Username */}
        <div className="flex flex-col gap-1">
          <label className="text-base font-semibold">Username</label>
          <Controller
            name="username"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="flex flex-col gap-1">
                <Input
                  {...field}
                  placeholder="Username"
                  autoComplete="username"
                  className="h-14 text-lg rounded-2xl bg-white border-gray-300 w-full"
                />
                {fieldState.error && (
                  <p className="text-xs text-red-500">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />
        </div>

        {/* Legal text */}
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <p>
            People who use our service may have uploaded your contact information to Instagram.{" "}
            <span className="text-[#0095F6] font-medium cursor-pointer">Learn more.</span>
          </p>
          <p>
            By tapping Submit, you agree to create an account and to Instagram&apos;s{" "}
            <span className="text-[#0095F6] font-medium cursor-pointer">Terms</span>,{" "}
            <span className="text-[#0095F6] font-medium cursor-pointer">Privacy Policy</span>{" "}
            and{" "}
            <span className="text-[#0095F6] font-medium cursor-pointer">Cookies Policy</span>.
          </p>
          <p>
            The{" "}
            <span className="text-[#0095F6] font-medium cursor-pointer">Privacy Policy</span>{" "}
            describes the ways we can use the information we collect when you create an account.
            We use this information to provide, personalize and improve our products, including ads.
          </p>
        </div>

        {error && <p className="text-xs text-red-500 text-center">{error}</p>}

        {/* Captcha */}
        <div id="clerk-captcha" />

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-14 rounded-2xl bg-[#0095F6] hover:bg-[#1877F2] text-white font-bold text-lg cursor-pointer"
        >
          {isLoading ? "Creating account..." : "Submit"}
        </Button>
      </form>

      <Link
        href="/sign-in"
        className="w-full h-14 rounded-2xl border border-gray-300 hover:bg-gray-100 hover:border-gray-500 text-black font-semibold text-lg flex items-center justify-center transition-colors cursor-pointer"
      >
        I already have an account
      </Link>
    </div>
  );
}
