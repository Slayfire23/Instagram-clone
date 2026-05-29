import { redirect } from "next/navigation";
import {
  LayoutGrid,
  Video,
  Bookmark,
  CircleUser,
  Camera,
  Film,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getProfile } from "@/server/actions/profile.actions";
import { getUserOwnPosts } from "@/server/actions/post.actions";
import ProfileHeader from "@/app/(main)/components/ProfileHeader";
import ProfilePostCard from "@/app/(main)/components/ProfilePostCard";

export default async function ProfilePage() {
  const profile = await getProfile();
  if (!profile) redirect("/");

  const posts = await getUserOwnPosts();

  const reelPosts = posts.filter((p) => p.type === "REEL");

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <ProfileHeader
        profileUser={{
          id: profile.id,
          username: profile.username,
          name: profile.name,
          image: profile.image,
          bio: profile.bio,
          website: profile.website,
          isPrivate: profile.isPrivate,
          _count: profile._count,
        }}
        isOwnProfile
      />

      {/* Story highlights */}
      <div className="flex gap-6 mt-8 overflow-x-auto pb-2">
        <button className="flex flex-col items-center gap-1 shrink-0">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/40">
            <Plus size={28} className="text-muted-foreground/60" />
          </div>
          <span className="text-xs">New</span>
        </button>
      </div>

      {/* Tabs */}
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
          <TabsTrigger value="saved" className="gap-1.5 cursor-pointer">
            <Bookmark size={14} />
            <span className="hidden sm:inline text-xs uppercase tracking-wider">
              Saved
            </span>
          </TabsTrigger>
          <TabsTrigger value="tagged" className="gap-1.5 cursor-pointer">
            <CircleUser size={14} />
            <span className="hidden sm:inline text-xs uppercase tracking-wider">
              Tagged
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
                  isOwnPost
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Camera size={40} />}
              title="Share photos"
              description="When you share photos, they will appear on your profile."
              ctaLabel="Share your first photo"
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
                  isOwnPost
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Film size={40} />}
              title="Share reels"
              description="When you share reels, they will appear on your profile."
              ctaLabel="Share your first reel"
            />
          )}
        </TabsContent>

        {/* Saved tab */}
        <TabsContent value="saved">
          <EmptyState
            icon={<Bookmark size={40} />}
            title="Save"
            description="Save photos and videos that you want to see again."
          />
        </TabsContent>

        {/* Tagged tab */}
        <TabsContent value="tagged">
          <EmptyState
            icon={<CircleUser size={40} />}
            title="Photos of you"
            description="When people tag you in photos, they'll appear here."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  ctaLabel,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  ctaLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-foreground text-foreground">
        {icon}
      </div>
      <h3 className="text-2xl font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
      {ctaLabel && (
        <Button
          variant="ghost"
          className="text-blue-500 font-semibold hover:text-blue-600"
        >
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}
