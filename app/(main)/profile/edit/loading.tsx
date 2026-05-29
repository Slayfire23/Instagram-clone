import { Skeleton } from "@/components/ui/skeleton";

export default function EditProfileLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Skeleton className="h-6 w-32 mb-8" />

      {/* Avatar + upload */}
      <div className="flex items-center gap-6 mb-8">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <Skeleton className="h-px w-full mb-8" />

      {/* Fields */}
      <div className="flex flex-col gap-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-full max-w-md" />
          </div>
        ))}

        {/* Toggle */}
        <div className="flex items-center justify-between max-w-md">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-5 w-9 rounded-full" />
        </div>

        <Skeleton className="h-px w-full" />

        {/* Buttons */}
        <div className="flex gap-3">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
}