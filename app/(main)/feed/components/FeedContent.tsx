"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { getFeedPosts } from "@/server/actions/post.actions";
import FeedPostCard from "./FeedPostCard";

type FeedPost = {
  id: string;
  mediaUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  caption: string | null;
  createdAt: Date | string;
  author: {
    id: string;
    username: string;
    image: string | null;
    name: string | null;
  };
  likeCount: number;
  liked: boolean;
  commentCount: number;
};

type FeedContentProps = {
  initialPosts: FeedPost[];
  initialHasMore: boolean;
};

export default function FeedContent({
  initialPosts,
  initialHasMore,
}: FeedContentProps) {
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || posts.length === 0) return;
    setLoading(true);

    const lastId = posts[posts.length - 1].id;
    const result = await getFeedPosts(lastId);

    setPosts((prev) => [...prev, ...result.posts]);
    setHasMore(result.hasMore);
    setLoading(false);
  }, [loading, hasMore, posts]);

  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-muted-foreground">
          No posts yet. Follow some people to see their posts here!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {posts.map((post) => (
        <FeedPostCard key={post.id} post={post} />
      ))}

      {/* Infinite scroll sentinel */}
      <div ref={observerRef} className="h-1" />

      {loading && (
        <div className="flex justify-center py-6">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <p className="text-center text-xs text-muted-foreground py-8">
          You&apos;re all caught up!
        </p>
      )}
    </div>
  );
}