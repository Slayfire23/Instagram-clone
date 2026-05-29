import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header skeleton */}
      <div className="flex gap-6 md:gap-20 items-start">
        {/* Avatar */}
        <Skeleton className="h-20 w-20 md:h-36 md:w-36 rounded-full shrink-0" />

        <div className="flex flex-col gap-4 flex-1">
          {/* Username + buttons */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-7 w-24 rounded-md" />
            <Skeleton className="h-7 w-24 rounded-md" />
          </div>

          {/* Stats — desktop */}
          <div className="hidden md:flex gap-8">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Bio — desktop */}
          <div className="hidden md:flex flex-col gap-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
      </div>

      {/* Bio — mobile */}
      <div className="md:hidden mt-4 flex flex-col gap-1.5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Stats — mobile */}
      <div className="flex md:hidden justify-around border-y py-3 mt-4">
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-3 w-10" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-3 w-14" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>

      {/* Story highlights skeleton */}
      <div className="flex gap-4 mt-8 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-20 rounded-full shrink-0" />
        ))}
      </div>

      {/* Tabs skeleton */}
      <div className="flex justify-center gap-12 border-t mt-8 pt-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>

      {/* Post grid skeleton */}
      <div className="grid grid-cols-3 gap-1 mt-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full" />
        ))}
      </div>

      {/* Instagram logo watermark */}
      <div className="flex justify-center mt-12 opacity-30">
        <Image
          src="/assets/logo.svg"
          alt="Instagram"
          width={40}
          height={40}
        />
      </div>
    </div>
  );
}