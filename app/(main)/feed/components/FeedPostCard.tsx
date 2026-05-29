"use client";

import { useState, useRef, useOptimistic, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  likePost,
  unlikePost,
  addComment,
  getComments,
  getCommentReplies,
} from "@/server/actions/interaction.actions";

// ─── Types ──────────────────────────────────────────────────────────────────

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

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: { username: string; image: string | null };
  _count: { replies: number };
};

type FeedPostCardProps = {
  post: FeedPost;
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCount(count: number) {
  if (count >= 1_000_000)
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (count >= 1_000)
    return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(count);
}

function timeAgo(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function FeedPostCard({ post }: FeedPostCardProps) {
  // Video
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  // Like (optimistic)
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [optimisticLiked, setOptimisticLiked] = useOptimistic(liked);
  const [optimisticLikeCount, setOptimisticLikeCount] =
    useOptimistic(likeCount);
  const [, startLikeTransition] = useTransition();

  // Comments
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<{
    commentId: string;
    username: string;
  } | null>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);

  // Expanded replies
  const [expandedReplies, setExpandedReplies] = useState<
    Record<string, Comment[]>
  >({});
  const [loadingReplies, setLoadingReplies] = useState<
    Record<string, boolean>
  >({});

  // ─── Handlers ─────────────────────────────────────────────────────────

  function handleToggleLike() {
    startLikeTransition(async () => {
      if (optimisticLiked) {
        setOptimisticLiked(false);
        setOptimisticLikeCount(likeCount - 1);
        await unlikePost(post.id);
        setLiked(false);
        setLikeCount((c) => c - 1);
      } else {
        setOptimisticLiked(true);
        setOptimisticLikeCount(likeCount + 1);
        await likePost(post.id);
        setLiked(true);
        setLikeCount((c) => c + 1);
      }
    });
  }

  function toggleMute() {
    const next = !isMuted;
    setIsMuted(next);
    if (videoRef.current) {
      videoRef.current.muted = next;
    }
  }

  async function handleShowComments() {
    if (showComments) {
      setShowComments(false);
      return;
    }
    setLoadingComments(true);
    setShowComments(true);
    const result = await getComments(post.id);
    setComments(result.comments);
    setHasMoreComments(result.hasMore);
    setLoadingComments(false);
  }

  async function handleLoadMoreComments() {
    if (loadingComments || !hasMoreComments || comments.length === 0) return;
    setLoadingComments(true);
    const lastId = comments[comments.length - 1].id;
    const result = await getComments(post.id, lastId);
    setComments((prev) => [...prev, ...result.comments]);
    setHasMoreComments(result.hasMore);
    setLoadingComments(false);
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;

    const newComment = await addComment(
      post.id,
      text,
      replyingTo?.commentId
    );

    if (replyingTo) {
      setExpandedReplies((prev) => ({
        ...prev,
        [replyingTo.commentId]: [
          ...(prev[replyingTo.commentId] ?? []),
          newComment,
        ],
      }));
      setComments((prev) =>
        prev.map((c) =>
          c.id === replyingTo.commentId
            ? { ...c, _count: { replies: c._count.replies + 1 } }
            : c
        )
      );
    } else {
      setComments((prev) => [newComment, ...prev]);
    }

    setCommentText("");
    setReplyingTo(null);
  }

  function handleReply(commentId: string, username: string) {
    setReplyingTo({ commentId, username });
    setCommentText(`@${username} `);
    commentInputRef.current?.focus();
  }

  async function handleLoadReplies(commentId: string) {
    setLoadingReplies((prev) => ({ ...prev, [commentId]: true }));
    const replies = await getCommentReplies(commentId);
    setExpandedReplies((prev) => ({ ...prev, [commentId]: replies }));
    setLoadingReplies((prev) => ({ ...prev, [commentId]: false }));
  }

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <Card className="rounded-lg border shadow-none mb-4">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-1 py-3">
          <Link href={`/profile/${post.author.username}`}>
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.author.image ?? undefined} />
              <AvatarFallback className="text-xs bg-muted">
                {post.author.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <Link
              href={`/profile/${post.author.username}`}
              className="text-sm font-semibold hover:opacity-70 truncate"
            >
              {post.author.username}
            </Link>
            <span className="text-xs text-muted-foreground">
              · {timeAgo(post.createdAt)}
            </span>
          </div>
          <Button variant="ghost" size="icon-xs">
            <MoreHorizontal size={18} />
          </Button>
        </div>

        {/* Media */}
        <div className="relative aspect-square bg-black rounded-sm overflow-hidden">
          {post.mediaType === "IMAGE" ? (
            <Image
              src={post.mediaUrl}
              alt="Post"
              fill
              className="object-cover"
              sizes="(max-width: 470px) 100vw, 470px"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                src={post.mediaUrl}
                muted
                loop
                autoPlay
                playsInline
                className="h-full w-full object-cover"
              />
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={toggleMute}
                className="absolute bottom-3 right-3 rounded-full bg-black/60 text-white hover:bg-black/80 hover:text-white"
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </Button>
            </>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between px-1 pt-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleToggleLike}
              className="hover:opacity-60"
            >
              <Heart
                size={24}
                className={
                  optimisticLiked ? "fill-red-500 text-red-500" : ""
                }
              />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleShowComments}
              className="hover:opacity-60"
            >
              <MessageCircle size={24} />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="hover:opacity-60"
            >
              <Send size={24} />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            className="hover:opacity-60"
          >
            <Bookmark size={24} />
          </Button>
        </div>

        {/* Like count */}
        <div className="px-1 mt-1">
          <p className="text-sm font-semibold">
            {formatCount(optimisticLikeCount)}{" "}
            {optimisticLikeCount === 1 ? "like" : "likes"}
          </p>
        </div>

        {/* Caption */}
        {post.caption && (
          <div className="px-1 mt-1">
            <p className="text-sm">
              <Link
                href={`/profile/${post.author.username}`}
                className="font-semibold hover:opacity-70"
              >
                {post.author.username}
              </Link>{" "}
              {post.caption}
            </p>
          </div>
        )}

        {/* View comments toggle */}
        {post.commentCount > 0 && !showComments && (
          <Button
            variant="ghost"
            onClick={handleShowComments}
            className="px-1 mt-1 text-sm text-muted-foreground hover:text-muted-foreground/80 h-auto p-0 hover:bg-transparent"
          >
            View all {post.commentCount} comments
          </Button>
        )}

        {/* Comments section */}
        {showComments && (
          <div className="px-1 mt-2 space-y-3">
            {loadingComments && comments.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Loading comments...
              </p>
            ) : (
              <>
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    onReply={handleReply}
                    onLoadReplies={handleLoadReplies}
                    expandedReplies={expandedReplies[comment.id]}
                    loadingReplies={loadingReplies[comment.id] ?? false}
                  />
                ))}
                {hasMoreComments && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLoadMoreComments}
                    disabled={loadingComments}
                    className="text-xs text-muted-foreground h-auto p-0 hover:bg-transparent"
                  >
                    {loadingComments ? "Loading..." : "Load more comments"}
                  </Button>
                )}
              </>
            )}
          </div>
        )}

        {/* Add comment input */}
        <form
          onSubmit={handleSubmitComment}
          className="flex items-center gap-2 px-1 mt-2 pb-3"
        >
          {replyingTo && (
            <Button
              variant="ghost"
              size="icon-xs"
              type="button"
              onClick={() => {
                setReplyingTo(null);
                setCommentText("");
              }}
              className="shrink-0 text-muted-foreground"
            >
              &times;
            </Button>
          )}
          <Input
            ref={commentInputRef}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={
              replyingTo
                ? `Reply to @${replyingTo.username}...`
                : "Add a comment..."
            }
            className="flex-1 border-none bg-transparent focus-visible:ring-0 text-sm h-8 px-0"
          />
          {commentText.trim() && (
            <Button
              variant="ghost"
              size="sm"
              type="submit"
              className="text-blue-500 font-semibold hover:text-blue-600 text-sm h-auto p-0"
            >
              Post
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

// ─── CommentItem ────────────────────────────────────────────────────────────

function CommentItem({
  comment,
  onReply,
  onLoadReplies,
  expandedReplies,
  loadingReplies,
}: {
  comment: Comment;
  onReply: (commentId: string, username: string) => void;
  onLoadReplies: (commentId: string) => void;
  expandedReplies?: Comment[];
  loadingReplies: boolean;
}) {
  const hasReplies = comment._count.replies > 0;
  const repliesLoaded = !!expandedReplies;

  return (
    <div className="flex gap-2.5">
      <Link
        href={`/profile/${comment.user.username}`}
        className="shrink-0 pt-0.5"
      >
        <Avatar className="h-7 w-7">
          <AvatarImage src={comment.user.image ?? undefined} />
          <AvatarFallback className="text-[10px] bg-muted">
            {comment.user.username[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <Link
            href={`/profile/${comment.user.username}`}
            className="font-semibold hover:opacity-70"
          >
            {comment.user.username}
          </Link>{" "}
          {comment.content}
        </p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-muted-foreground">
            {timeAgo(comment.createdAt)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReply(comment.id, comment.user.username)}
            className="text-xs font-medium text-muted-foreground hover:text-foreground h-auto p-0 hover:bg-transparent"
          >
            Reply
          </Button>
        </div>

        {/* Show replies toggle */}
        {hasReplies && !repliesLoaded && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLoadReplies(comment.id)}
            disabled={loadingReplies}
            className="text-xs font-medium text-muted-foreground mt-2 h-auto p-0 hover:bg-transparent hover:text-foreground"
          >
            {loadingReplies
              ? "Loading..."
              : `── View ${comment._count.replies} ${comment._count.replies === 1 ? "reply" : "replies"}`}
          </Button>
        )}

        {/* Replies */}
        {expandedReplies && expandedReplies.length > 0 && (
          <div className="mt-2 space-y-2.5 pl-2 border-l border-border">
            {expandedReplies.map((reply) => (
              <div key={reply.id} className="flex gap-2.5">
                <Link
                  href={`/profile/${reply.user.username}`}
                  className="shrink-0 pt-0.5"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={reply.user.image ?? undefined} />
                    <AvatarFallback className="text-[10px] bg-muted">
                      {reply.user.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <Link
                      href={`/profile/${reply.user.username}`}
                      className="font-semibold hover:opacity-70"
                    >
                      {reply.user.username}
                    </Link>{" "}
                    {reply.content}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(reply.createdAt)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        onReply(comment.id, reply.user.username)
                      }
                      className="text-xs font-medium text-muted-foreground hover:text-foreground h-auto p-0 hover:bg-transparent"
                    >
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}