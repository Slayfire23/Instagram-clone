"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Heart, MessageCircle, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PostModal from "@/app/(main)/components/PostModal";
import { deletePost } from "@/server/actions/post.actions";
import {
  likePost,
  unlikePost,
  hasUserLikedPost,
  getComments,
  getCommentReplies,
  addComment,
  deleteComment,
  getLikeCount,
} from "@/server/actions/interaction.actions";

type PostData = {
  id: string;
  mediaUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  caption?: string | null;
  createdAt: Date | string;
  author: {
    username: string;
    image: string | null;
  };
  _count: {
    likes: number;
    comments: number;
  };
};

type ProfilePostCardProps = {
  post: PostData;
  isOwnPost: boolean;
};

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: { username: string; image: string | null };
  _count: { replies: number };
};

function formatCount(count: number) {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(count);
}

export default function ProfilePostCard({
  post,
  isOwnPost,
}: ProfilePostCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<{
    liked: boolean;
    likeCount: number;
    comments: Comment[];
    hasMore: boolean;
  } | null>(null);

  function handleMouseEnter() {
    setIsHovered(true);
    if (post.mediaType === "VIDEO" && videoRef.current) {
      videoRef.current.play();
    }
  }

  function handleMouseLeave() {
    setIsHovered(false);
    if (post.mediaType === "VIDEO" && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }

  function toggleMute(e: React.MouseEvent) {
    e.stopPropagation();
    setIsMuted((prev) => !prev);
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  }

  async function handleOpenPost() {
    // Fetch initial data for the modal
    const [liked, likeCount, { comments, hasMore }] = await Promise.all([
      hasUserLikedPost(post.id),
      getLikeCount(post.id),
      getComments(post.id),
    ]);

    setModalData({ liked, likeCount, comments, hasMore });
    setShowModal(true);
  }

  async function handleLike(postId: string) {
    await likePost(postId);
  }

  async function handleUnlike(postId: string) {
    await unlikePost(postId);
  }

  async function handleComment(postId: string, content: string, parentId?: string) {
    return addComment(postId, content, parentId);
  }

  async function handleDeleteComment(commentId: string) {
    await deleteComment(commentId);
  }

  async function handleDeletePost(postId: string) {
    await deletePost(postId);
  }

  async function handleLoadMoreComments(postId: string, cursor: string) {
    return getComments(postId, cursor);
  }

  async function handleLoadReplies(commentId: string) {
    return getCommentReplies(commentId);
  }

  return (
    <>
      <Card
        className="relative aspect-square cursor-pointer overflow-hidden bg-muted rounded-none border-0 shadow-none p-0"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleOpenPost}
      >
        <CardContent className="p-0 h-full">
          {/* Media */}
          {post.mediaType === "IMAGE" ? (
            <Image
              src={post.mediaUrl}
              alt="Post"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 33vw, 300px"
            />
          ) : (
            <video
              ref={videoRef}
              src={post.mediaUrl}
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            />
          )}

          {/* Video mute/unmute toggle */}
          {post.mediaType === "VIDEO" && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={toggleMute}
              className="absolute bottom-2 right-2 z-10 rounded-full bg-black/60 text-white hover:bg-black/80 hover:text-white"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </Button>
          )}

          {/* Hover overlay with likes + comments */}
          {isHovered && (
            <div className="absolute inset-0 flex items-center justify-center gap-6 bg-black/40">
              <div className="flex items-center gap-1.5 text-white font-semibold text-sm">
                <Heart size={18} fill="white" />
                <span>{formatCount(post._count.likes)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-white font-semibold text-sm">
                <MessageCircle size={18} fill="white" />
                <span>{formatCount(post._count.comments)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Post Modal */}
      {modalData && (
        <PostModal
          post={{
            id: post.id,
            mediaUrl: post.mediaUrl,
            mediaType: post.mediaType,
            caption: post.caption ?? null,
            createdAt: typeof post.createdAt === "string"
              ? post.createdAt
              : post.createdAt.toISOString(),
            author: post.author,
          }}
          isOwnPost={isOwnPost}
          initialLiked={modalData.liked}
          initialLikeCount={modalData.likeCount}
          initialComments={modalData.comments}
          initialHasMoreComments={modalData.hasMore}
          open={showModal}
          onOpenChange={(open) => {
            setShowModal(open);
            if (!open) setModalData(null);
          }}
          onLike={handleLike}
          onUnlike={handleUnlike}
          onComment={handleComment}
          onDeleteComment={handleDeleteComment}
          onDeletePost={handleDeletePost}
          onLoadMoreComments={handleLoadMoreComments}
          onLoadReplies={handleLoadReplies}
        />
      )}
    </>
  );
}