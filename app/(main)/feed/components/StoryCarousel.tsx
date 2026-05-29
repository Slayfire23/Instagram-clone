"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import StoryViewer from "./StoryViewer";
import CreateStoryModal from "./CreateStoryModal";
import type { FeedStoryGroup } from "@/server/actions/story.actions";

type StoryCarouselProps = {
  groups: FeedStoryGroup[];
  currentUserId: string;
  currentUserImage: string | null;
  currentUsername: string;
};

export default function StoryCarousel({
  groups,
  currentUserId,
  currentUserImage,
  currentUsername,
}: StoryCarouselProps) {
  const [viewingAuthorId, setViewingAuthorId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [storyGroups, setStoryGroups] = useState<FeedStoryGroup[]>(groups);

  const ownGroup = storyGroups.find((g) => g.isOwn);
  const othersGroups = storyGroups.filter((g) => !g.isOwn);

  function handleGroupViewed(authorId: string) {
    setStoryGroups((prev) =>
      prev.map((g) =>
        g.author.id === authorId ? { ...g, hasUnviewed: false } : g
      )
    );
  }

  return (
    <>
      <div className="relative px-8 py-3 border-b">
        <Carousel
          opts={{ dragFree: true, align: "start" }}
          className="w-full"
        >
          <CarouselContent className="-ml-2">
            {/* Add story button */}
            <CarouselItem className="pl-2 basis-auto">
              <button
                onClick={() => setShowCreate(true)}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div className="relative">
                  <Avatar className="h-14 w-14 border-2 border-muted">
                    <AvatarImage src={currentUserImage ?? undefined} />
                    <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                      {currentUsername[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
                    <Plus size={11} className="text-white" strokeWidth={3} />
                  </div>
                </div>
                <span className="text-[11px] text-muted-foreground w-16 text-center truncate">
                  Your story
                </span>
              </button>
            </CarouselItem>

            {/* Own story circle (if exists) */}
            {ownGroup && (
              <CarouselItem className="pl-2 basis-auto">
                <StoryCircle
                  group={ownGroup}
                  label="Your story"
                  onClick={() => setViewingAuthorId(ownGroup.author.id)}
                />
              </CarouselItem>
            )}

            {/* Others' story circles */}
            {othersGroups.map((group) => (
              <CarouselItem key={group.author.id} className="pl-2 basis-auto">
                <StoryCircle
                  group={group}
                  label={group.author.username}
                  onClick={() => setViewingAuthorId(group.author.id)}
                />
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="-left-4 h-7 w-7 shadow-md" />
          <CarouselNext className="-right-4 h-7 w-7 shadow-md" />
        </Carousel>
      </div>

      {/* Story viewer */}
      {viewingAuthorId && (
        <StoryViewer
          authorId={viewingAuthorId}
          currentUserId={currentUserId}
          open={!!viewingAuthorId}
          onClose={() => setViewingAuthorId(null)}
          onStoryGroupViewed={handleGroupViewed}
        />
      )}

      {/* Create story modal */}
      <CreateStoryModal
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreated={() => {
          // Add own group to list if not already present
          if (!ownGroup) {
            setStoryGroups((prev) => [
              {
                author: { id: currentUserId, username: currentUsername, image: currentUserImage },
                latestStoryId: "",
                hasUnviewed: false,
                isOwn: true,
              },
              ...prev,
            ]);
          }
        }}
      />
    </>
  );
}

// ─── Story Circle ────────────────────────────────────────────────────────────

function StoryCircle({
  group,
  label,
  onClick,
}: {
  group: FeedStoryGroup;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 group"
    >
      <div
        className={`rounded-full p-0.5 ${
          group.hasUnviewed
            ? "bg-linear-to-tr from-yellow-400 via-pink-500 to-purple-600"
            : "bg-muted"
        }`}
      >
        <Avatar className="h-14 w-14 border-2 border-white">
          <AvatarImage src={group.author.image ?? undefined} />
          <AvatarFallback className="bg-muted text-muted-foreground text-sm">
            {group.author.username[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
      <span className="text-[11px] text-muted-foreground w-16 text-center truncate">
        {label}
      </span>
    </button>
  );
}