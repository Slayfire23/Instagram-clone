"use client";

import { useState, useTransition } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleFollow } from "@/server/actions/follow.actions";
import type { FollowStatus } from "@/server/actions/follow.actions";

type FollowButtonProps = {
  targetUserId: string;
  initialStatus: FollowStatus;
  variant?: "default" | "compact";
};

export default function FollowButton({
  targetUserId,
  initialStatus,
  variant = "default",
}: FollowButtonProps) {
  const [status, setStatus] = useState<FollowStatus>(initialStatus);
  const [isPending, startTransition] = useTransition();

  if (status === "self") return null;

  function handleClick() {
    startTransition(async () => {
      const newStatus = await toggleFollow(targetUserId);
      setStatus(newStatus);
    });
  }

  const isFollowingOrRequested = status === "following" || status === "requested";

  const isCompact = variant === "compact";

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      size={isCompact ? "sm" : "default"}
      className={
        isCompact
          ? isFollowingOrRequested
            ? "bg-transparent hover:bg-transparent text-gray-400 text-xs font-semibold p-0 h-auto cursor-pointer"
            : "bg-transparent hover:bg-transparent text-blue-500 text-xs font-semibold p-0 h-auto cursor-pointer"
          : isFollowingOrRequested
            ? "bg-gray-100 hover:bg-gray-200 text-foreground text-sm font-medium cursor-pointer"
            : "bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium cursor-pointer"
      }
    >
      {isPending ? (
        <Loader2 size={isCompact ? 12 : 16} className="animate-spin" />
      ) : status === "following" ? (
        isCompact ? (
          "Following"
        ) : (
          <span className="flex items-center gap-1">
            Following <ChevronDown size={14} />
          </span>
        )
      ) : status === "requested" ? (
        "Requested"
      ) : (
        "Follow"
      )}
    </Button>
  );
}