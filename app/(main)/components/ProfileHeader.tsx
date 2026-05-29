import Image from "next/image";
import Link from "next/link";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { FollowStatus } from "@/server/actions/follow.actions";
import FollowButton from "@/app/(main)/components/FollowButton";

type ProfileUser = {
  id: string;
  username: string;
  name: string | null;
  image: string | null;
  bio: string | null;
  website: string | null;
  isPrivate: boolean;
  _count: {
    posts: number;
    followers: number;
    following: number;
  };
};

export type ProfileHeaderProps = {
  profileUser: ProfileUser;
  isOwnProfile: boolean;
  followStatus?: FollowStatus;
};

function formatCount(count: number) {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(count);
}

export default function ProfileHeader({
  profileUser,
  isOwnProfile,
  followStatus,
}: ProfileHeaderProps) {
  return (
    <header className="flex flex-col gap-6 px-4 md:px-0">
      {/* Top row: avatar + info */}
      <div className="flex gap-6 md:gap-20 items-start">
        {/* Profile image */}
        <div className="shrink-0">
          <Avatar className="h-20 w-20 md:h-36 md:w-36">
            <AvatarImage src={profileUser.image ?? undefined} />
            <AvatarFallback className="bg-muted">
              <Image
                src="/assets/logo-black.svg"
                alt={profileUser.username}
                width={40}
                height={40}
                className="md:w-16 md:h-16 opacity-50"
              />
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Right side: username, buttons, stats */}
        <div className="flex flex-col gap-4 flex-1 min-w-0">
          {/* Username row */}
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-normal truncate">
              {profileUser.username}
            </h1>

            {isOwnProfile && (
              <Button variant="ghost" size="icon-sm">
                <Settings size={20} />
              </Button>
            )}
          </div>

          {/* Stats — desktop only */}
          <div className="hidden md:flex gap-8">
            <Stat count={profileUser._count.posts} label="posts" />
            <Stat count={profileUser._count.followers} label="followers" />
            <Stat count={profileUser._count.following} label="following" />
          </div>

          {/* Bio — desktop only */}
          <div className="hidden md:block">
            <BioSection
              name={profileUser.name}
              bio={profileUser.bio}
              website={profileUser.website}
            />
          </div>

          {/* Action buttons — desktop only, below bio */}
          {isOwnProfile ? (
            <div className="hidden md:grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                asChild
                className="bg-gray-100 hover:bg-gray-200 text-sm font-medium"
              >
                <Link href="/profile/edit">Edit profile</Link>
              </Button>
              <Button
                variant="secondary"
                asChild
                className="bg-gray-100 hover:bg-gray-200 text-sm font-medium"
              >
                <Link href="/archive">View archive</Link>
              </Button>
            </div>
          ) : (
            <div className="hidden md:grid grid-cols-2 gap-2">
              <FollowButton targetUserId={profileUser.id} initialStatus={followStatus ?? "none"} />
              <Button className="bg-gray-100 hover:bg-gray-200 text-foreground text-sm font-medium cursor-pointer">
                Message
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Bio — mobile only */}
      <div className="md:hidden">
        <BioSection
          name={profileUser.name}
          bio={profileUser.bio}
          website={profileUser.website}
        />
      </div>

      {/* Action buttons — mobile only, below bio */}
      {isOwnProfile ? (
        <div className="grid md:hidden grid-cols-2 gap-2">
          <Button
            variant="secondary"
            asChild
            className="bg-gray-100 hover:bg-gray-200 text-sm font-medium"
          >
            <Link href="/profile/edit">Edit profile</Link>
          </Button>
          <Button
            variant="secondary"
            asChild
            className="bg-gray-100 hover:bg-gray-200 text-sm font-medium"
          >
            <Link href="/archive">View archive</Link>
          </Button>
        </div>
      ) : (
        <div className="grid md:hidden grid-cols-2 gap-2">
          <FollowButton targetUserId={profileUser.id} initialStatus={followStatus ?? "none"} />
          <Button className="bg-gray-100 hover:bg-gray-200 text-foreground text-sm font-medium cursor-pointer">
            Message
          </Button>
        </div>
      )}

      {/* Stats — mobile only */}
      <div className="flex md:hidden justify-around border-y py-3">
        <StatMobile count={profileUser._count.posts} label="posts" />
        <StatMobile count={profileUser._count.followers} label="followers" />
        <StatMobile count={profileUser._count.following} label="following" />
      </div>
    </header>
  );
}

function Stat({ count, label }: { count: number; label: string }) {
  return (
    <span className="text-sm">
      <span className="font-medium">{formatCount(count)}</span> {label}
    </span>
  );
}

function StatMobile({ count, label }: { count: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-medium text-sm">{formatCount(count)}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function BioSection({
  name,
  bio,
  website,
}: {
  name: string | null;
  bio: string | null;
  website: string | null;
}) {
  if (!name && !bio && !website) return null;

  return (
    <div className="flex flex-col gap-0.5">
      {name && <span className="text-sm font-medium">{name}</span>}
      {bio && <p className="text-sm whitespace-pre-line">{bio}</p>}
      {website && (
        <a
          href={website.startsWith("http") ? website : `https://${website}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-blue-500 hover:underline"
        >
          {website.replace(/^https?:\/\//, "")}
        </a>
      )}
    </div>
  );
}