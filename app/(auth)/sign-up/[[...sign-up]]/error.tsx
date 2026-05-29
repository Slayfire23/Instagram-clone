"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function SignUpError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8">
      <Image src="/assets/logo.svg" alt="Instagram" width={80} height={80} priority />
      <div className="flex flex-col items-center gap-3 text-center">
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          We couldn&apos;t complete your sign up. Please try again.
        </p>
      </div>
      <div className="flex gap-3">
        <Button
          onClick={reset}
          className="cursor-pointer w-32 rounded-xl bg-[#0095F6] hover:bg-[#1877F2] text-white font-semibold text-sm"
        >
          Try again
        </Button>
        <Button asChild variant="outline" className="w-40 rounded-xl font-semibold text-sm">
          <Link href="/sign-in">Back to Sign In</Link>
        </Button>
      </div>
    </div>
  );
}