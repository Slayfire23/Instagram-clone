import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import SignInForm from "@/app/(auth)/components/SignInForm";

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Main content row */}
      <div className="flex">
        {/* Left Section */}
        <div className="flex flex-col items-start justify-center px-20 py-16 w-1/2">
          <Image
            src="/assets/logo.svg"
            alt="Instagram"
            width={80}
            height={80}
            className="mb-6 -ml-12"
          />
          <h1 className="text-4xl font-normal leading-snug mb-10">
            <span className="block">See everyday moments from</span>
            <span className="block text-center mt-5">
              your <span className="text-[#E1306C]">close friends.</span>
            </span>
          </h1>
          <Image
            src="/assets/branding-image.png"
            alt="Instagram app preview"
            width={420}
            height={420}
            className="object-contain"
          />
        </div>

        {/* Vertical Separator — exactly in the middle */}
        <Separator orientation="vertical" className="self-stretch" />

        {/* Right Section */}
        <div className="flex flex-col items-center justify-center px-20 py-16 w-1/2">
          <SignInForm />
        </div>
      </div>

      {/* Horizontal Separator — full width, intersects vertical */}
      <Separator />
    </div>
  );
}