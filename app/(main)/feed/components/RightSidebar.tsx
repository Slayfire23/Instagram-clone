"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import FollowButton from "@/app/(main)/components/FollowButton";

type SuggestedUser = {
  id: string;
  username: string;
  name: string | null;
  image: string | null;
};

type CurrentUser = {
  username: string;
  name: string | null;
  image: string | null;
};

type RightSidebarProps = {
  currentUser: CurrentUser;
  suggestedUsers: SuggestedUser[];
};

export default function RightSidebar({
  currentUser,
  suggestedUsers,
}: RightSidebarProps) {
  return (
    <aside className="hidden lg:block w-80 pl-8 pt-8 shrink-0">
      {/* Current user info */}
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/profile/${currentUser.username}`}>
          <Avatar className="h-11 w-11">
            <AvatarImage src={currentUser.image ?? undefined} />
            <AvatarFallback className="bg-muted text-sm">
              {currentUser.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            href={`/profile/${currentUser.username}`}
            className="text-sm font-semibold hover:opacity-70 block truncate"
          >
            {currentUser.username}
          </Link>
          <p className="text-sm text-muted-foreground truncate">
            {currentUser.name}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-blue-500 font-semibold hover:text-blue-600 hover:bg-transparent p-0 h-auto"
        >
          Switch
        </Button>
      </div>

      {/* Suggested users */}
      {suggestedUsers.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-muted-foreground">
              Suggested for you
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-semibold hover:bg-transparent hover:text-muted-foreground p-0 h-auto"
            >
              See All
            </Button>
          </div>

          <div className="space-y-3">
            {suggestedUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3">
                <Link href={`/profile/${user.username}`}>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image ?? undefined} />
                    <AvatarFallback className="text-xs bg-muted">
                      {user.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/profile/${user.username}`}
                    className="text-sm font-semibold hover:opacity-70 block truncate"
                  >
                    {user.username}
                  </Link>
                  <p className="text-xs text-muted-foreground truncate">
                    New to Instagram
                  </p>
                </div>
                <FollowButton
                  targetUserId={user.id}
                  initialStatus="none"
                  variant="compact"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 space-y-4">
        <nav className="flex flex-wrap gap-x-1 gap-y-0.5">
          {[
            "About",
            "Help",
            "Press",
            "API",
            "Jobs",
            "Privacy",
            "Terms",
            "Locations",
          ].map((link, i) => (
            <span key={link} className="text-xs text-muted-foreground/60">
              {link}
              {i < 7 && " · "}
            </span>
          ))}
        </nav>
        <p className="text-xs text-muted-foreground/50 uppercase">
          &copy; 2026 Instagram from Meta
        </p>
      </div>
    </aside>
  );
}