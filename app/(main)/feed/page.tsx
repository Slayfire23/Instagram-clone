import { getFeedPosts, getSuggestedUsers } from "@/server/actions/post.actions";
import { getProfile } from "@/server/actions/profile.actions";
import { getFeedStoryGroups } from "@/server/actions/story.actions";
import { redirect } from "next/navigation";
import StoryCarousel from "./components/StoryCarousel";
import FeedContent from "./components/FeedContent";
import RightSidebar from "./components/RightSidebar";

export default async function FeedPage() {
  const profile = await getProfile();
  if (!profile) redirect("/sign-in");

  const [initialData, suggestedUsers, storyGroups] = await Promise.all([
    getFeedPosts(),
    getSuggestedUsers(),
    getFeedStoryGroups(),
  ]);

  return (
    <div className="flex justify-center max-w-[935px] mx-auto px-4">
      <div className="w-full max-w-[470px] pt-4">
        <StoryCarousel
          groups={storyGroups}
          currentUserId={profile.id}
          currentUserImage={profile.image}
          currentUsername={profile.username}
        />
        <FeedContent
          initialPosts={initialData.posts}
          initialHasMore={initialData.hasMore}
        />
      </div>
      <RightSidebar
        currentUser={{
          username: profile.username,
          name: profile.name,
          image: profile.image,
        }}
        suggestedUsers={suggestedUsers}
      />
    </div>
  );
}
