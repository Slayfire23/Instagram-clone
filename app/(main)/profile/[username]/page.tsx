import { redirect, notFound } from "next/navigation";
import { Lock, LayoutGrid, Video, Camera, Film } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  getProfile,
  getProfileByUsername,
} from "@/server/actions/profile.actions";
import { getUserPostsByUsername } from "@/server/actions/post.actions";
import { getFollowStatus } from "@/server/actions/follow.actions";
import ProfileHeader from "@/app/(main)/components/ProfileHeader";
import ProfilePostCard from "@/app/(main)/components/ProfilePostCard";

export default async function OtherProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const [currentUserProfile, profileUser] = await Promise.all([
    getProfile(),
    getProfileByUsername(username),
  ]);

  // If viewing own profile, redirect to /profile
  if (currentUserProfile?.username === username) {
    redirect("/profile");
  }

  if (!profileUser) {
    notFound();
  }

  const [posts, followStatus] = await Promise.all([
    getUserPostsByUsername(username),
    getFollowStatus(profileUser.id),
  ]);

  const isFollowing = followStatus === "following";
  const isPrivateAndNotFollowing = profileUser.isPrivate && !isFollowing;

  const reelPosts = posts.filter((p) => p.type === "REEL");

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <ProfileHeader
        profileUser={{
          id: profileUser.id,
          username: profileUser.username,
          name: profileUser.name,
          image: profileUser.image,
          bio: profileUser.bio,
          website: profileUser.website,
          isPrivate: profileUser.isPrivate,
          _count: profileUser._count,
        }}
        isOwnProfile={false}
        followStatus={followStatus}
      />

      {/* Story highlights */}
      <div className="flex gap-6 mt-8 overflow-x-auto pb-2">
        {/* Highlights would render here */}
      </div>

      {isPrivateAndNotFollowing ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center border-t mt-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-foreground">
            <Lock size={32} />
          </div>
          <h3 className="text-xl font-semibold">This account is private</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Follow this account to see their photos and videos.
          </p>
        </div>
      ) : (
        <Tabs defaultValue="posts" className="mt-8">
          <TabsList
            variant="line"
            className="w-full justify-center border-t"
          >
            <TabsTrigger value="posts" className="gap-1.5 cursor-pointer">
              <LayoutGrid size={14} />
              <span className="hidden sm:inline text-xs uppercase tracking-wider">
                Posts
              </span>
            </TabsTrigger>
            <TabsTrigger value="reels" className="gap-1.5 cursor-pointer">
              <Video size={14} />
              <span className="hidden sm:inline text-xs uppercase tracking-wider">
                Reels
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Posts tab */}
          <TabsContent value="posts">
            {posts.length > 0 ? (
              <div className="grid grid-cols-3 gap-1">
                {posts.map((post) => (
                  <ProfilePostCard
                    key={post.id}
                    post={post}
                    isOwnPost={false}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Camera size={40} />}
                title="No posts yet"
                description="When they share photos, they will appear here."
              />
            )}
          </TabsContent>

          {/* Reels tab */}
          <TabsContent value="reels">
            {reelPosts.length > 0 ? (
              <div className="grid grid-cols-3 gap-1">
                {reelPosts.map((post) => (
                  <ProfilePostCard
                    key={post.id}
                    post={post}
                    isOwnPost={false}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Film size={40} />}
                title="No reels yet"
                description="When they share reels, they will appear here."
              />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-foreground text-foreground">
        {icon}
      </div>
      <h3 className="text-2xl font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
    </div>
  );
}
