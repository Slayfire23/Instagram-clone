"use client";

import Image from "next/image";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function VerifyPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Image src="/assets/logo.svg" alt="Instagram" width={96} height={96} priority />
      <p className="text-lg font-medium">Authenticating...</p>
      <p className="text-sm text-muted-foreground">
        Please wait while we securely sign you in.
      </p>
      <div id="clerk-captcha" />
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl="/feed"
        signUpFallbackRedirectUrl="/feed"
      />
    </div>
  );
}