"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Error({
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-white gap-8">
      <Image
        src="/assets/logo.svg"
        alt="Instagram"
        width={80}
        height={80}
        priority
      />
      <div className="flex flex-col items-center gap-3 text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Something went wrong
        </h2>
        <p className="text-sm text-gray-500 max-w-xs">
          Please try again or refresh the page.
        </p>
      </div>
      <Button
        onClick={reset}
        className="cursor-pointer w-48 h-10 rounded-xl bg-[#0095F6] hover:bg-[#1877F2] text-white font-semibold text-sm border-none"
      >
        Try again
      </Button>
    </div>
  );
}