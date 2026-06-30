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
import { signUpSchema, SignUpType } from "@/app/(auth)/validations/SignUp";

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
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SignUpType>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      password: "", fullName: "", username: "",
      month: "", day: "", year: "",
    },
  });

  async function onSubmit(data: SignUpType) {
    if (!isLoaded) {
      setError("Clerk is still loading. Try again in a second.");
      return;
    }
    setError(null);

    const parsed = parse(`${data.month} ${data.day} ${data.year}`, "MMMM d yyyy", new Date());
    const birthday = format(parsed, "yyyy-MM-dd");

    try {
      const username = data.username.toLowerCase();
      const signUpAttempt = await signUp.create({
        username,
        password: data.password,
        unsafeMetadata: { birthday, fullName: data.fullName, username },
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.push("/feed");
      } else {
        setError("Clerk still needs another sign-up requirement. Check that username and password are enabled in your Clerk development settings.");
      }
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        const unhandledMessages: string[] = [];
        err.errors.forEach((e) => {
          const param = e.meta?.paramName;
          const message =
            param === "username" && e.message === "is unknown"
              ? "Username sign-up is not enabled for this Clerk development app."
              : e.longMessage || e.message;

          if (param === "password") form.setError("password", { message });
          else if (param === "username") form.setError("username", { message });
          else {
            unhandledMessages.push(message);
          }
        });
        if (unhandledMessages.length > 0) {
          setError(unhandledMessages.join(" | "));
        }
      } else {
        const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
        setError(message);
      }
    }
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

      <form
        onSubmit={form.handleSubmit(onSubmit, () => {
          setError("Please fix the highlighted fields before submitting.");
        })}
        className="flex flex-col gap-4"
      >
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
                  onChange={(event) => field.onChange(event.target.value.toLowerCase())}
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
          disabled={form.formState.isSubmitting}
          className="w-full h-14 rounded-2xl bg-[#0095F6] hover:bg-[#1877F2] text-white font-bold text-lg cursor-pointer"
        >
          {form.formState.isSubmitting ? "Creating account..." : "Submit"}
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
