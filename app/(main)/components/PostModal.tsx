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
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ─── Types ──────────────────────────────────────────────────────────────────

type CommentUser = {
  username: string;
  image: string | null;
};

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: CommentUser;
  _count: { replies: number };
};

type PostAuthor = {
  username: string;
  image: string | null;
};

type Post = {
  id: string;
  mediaUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  caption: string | null;
  createdAt: string;
  author: PostAuthor;
};

type PostModalProps = {
  post: Post;
  isOwnPost: boolean;
  initialLiked: boolean;
  initialLikeCount: number;
  initialComments: Comment[];
  initialHasMoreComments: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLike: (postId: string) => Promise<void>;
  onUnlike: (postId: string) => Promise<void>;
  onComment: (postId: string, content: string, parentId?: string) => Promise<Comment>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onDeletePost: (postId: string) => Promise<void>;
  onLoadMoreComments: (postId: string, cursor: string) => Promise<{
    comments: Comment[];
    hasMore: boolean;
  }>;
  onLoadReplies: (commentId: string) => Promise<Comment[]>;
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCount(count: number) {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(count);
}

function timeAgo(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function PostModal({
  post,
  isOwnPost,
  initialLiked,
  initialLikeCount,
  initialComments,
  initialHasMoreComments,
  open,
  onOpenChange,
  onLike,
  onUnlike,
  onComment,
  onDeleteComment,
  onDeletePost,
  onLoadMoreComments,
  onLoadReplies,
}: PostModalProps) {
  // Video
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.5);

  // Like (optimistic)
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [optimisticLiked, setOptimisticLiked] = useOptimistic(liked);
  const [optimisticLikeCount, setOptimisticLikeCount] = useOptimistic(likeCount);
  const [, startLikeTransition] = useTransition();

  // Comments
  const [comments, setComments] = useState(initialComments);
  const [hasMoreComments, setHasMoreComments] = useState(initialHasMoreComments);
  const [loadingMore, setLoadingMore] = useState(false);

  // Reply state
  const [replyingTo, setReplyingTo] = useState<{ commentId: string; username: string } | null>(null);
  const [commentText, setCommentText] = useState("");
  const commentInputRef = useRef<HTMLInputElement>(null);

  // Expanded replies
  const [expandedReplies, setExpandedReplies] = useState<Record<string, Comment[]>>({});
  const [loadingReplies, setLoadingReplies] = useState<Record<string, boolean>>({});

  // Delete dialogs
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const [showDeletePost, setShowDeletePost] = useState(false);

  // ─── Handlers ───────────────────────────────────────────────────────────

  function handleToggleLike() {
    startLikeTransition(async () => {
      if (optimisticLiked) {
        setOptimisticLiked(false);
        setOptimisticLikeCount(likeCount - 1);
        await onUnlike(post.id);
        setLiked(false);
        setLikeCount((c) => c - 1);
      } else {
        setOptimisticLiked(true);
        setOptimisticLikeCount(likeCount + 1);
        await onLike(post.id);
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
      if (!next) videoRef.current.volume = volume;
    }
  }

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;

    const newComment = await onComment(post.id, text, replyingTo?.commentId);

    if (replyingTo) {
      setExpandedReplies((prev) => ({
        ...prev,
        [replyingTo.commentId]: [...(prev[replyingTo.commentId] ?? []), newComment],
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

  async function handleLoadMoreComments() {
    if (loadingMore || !hasMoreComments || comments.length === 0) return;
    setLoadingMore(true);
    const lastId = comments[comments.length - 1].id;
    const result = await onLoadMoreComments(post.id, lastId);
    setComments((prev) => [...prev, ...result.comments]);
    setHasMoreComments(result.hasMore);
    setLoadingMore(false);
  }

  async function handleLoadReplies(commentId: string) {
    setLoadingReplies((prev) => ({ ...prev, [commentId]: true }));
    const replies = await onLoadReplies(commentId);
    setExpandedReplies((prev) => ({ ...prev, [commentId]: replies }));
    setLoadingReplies((prev) => ({ ...prev, [commentId]: false }));
  }

  async function handleConfirmDeleteComment() {
    if (!deleteCommentId) return;
    await onDeleteComment(deleteCommentId);
    setComments((prev) => prev.filter((c) => c.id !== deleteCommentId));
    // Also remove from expanded replies
    setExpandedReplies((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        next[key] = next[key].filter((r) => r.id !== deleteCommentId);
      }
      return next;
    });
    setDeleteCommentId(null);
  }

  async function handleConfirmDeletePost() {
    await onDeletePost(post.id);
    setShowDeletePost(false);
    onOpenChange(false);
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton
          className="!max-w-4xl w-[95vw] h-[75vh] max-h-[75vh] p-0 overflow-hidden flex flex-col md:flex-row gap-0"
        >
          <DialogTitle className="sr-only">Post by {post.author.username}</DialogTitle>

          {/* Left: Media */}
          <div className="relative flex items-center justify-center bg-black md:w-[55%] shrink-0 min-h-[250px] md:min-h-0 md:h-full">
            {post.mediaType === "IMAGE" ? (
              <Image
                src={post.mediaUrl}
                alt="Post"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 95vw, 55vw"
              />
            ) : (
              <video
                ref={videoRef}
                src={post.mediaUrl}
                muted
                loop
                autoPlay
                playsInline
                className="h-full w-full object-contain"
              />
            )}

            {/* Video controls */}
            {post.mediaType === "VIDEO" && (
              <div className="absolute bottom-3 right-3 flex flex-col items-center gap-2">
                {/* Vertical volume slider */}
                <div className="flex flex-col items-center rounded-full bg-black/60 p-1.5">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="h-20 w-1 accent-white appearance-none cursor-pointer [writing-mode:vertical-lr] [direction:rtl]"
                    aria-label="Volume"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={toggleMute}
                  className="rounded-full bg-black/60 text-white hover:bg-black/80 hover:text-white"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </Button>
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="flex flex-col flex-1 min-w-0 md:w-[45%]">
            {/* Author header */}
            <div className="flex items-center gap-3 pl-4 pr-10 py-3">
              <Link href={`/profile/${post.author.username}`}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={post.author.image ?? undefined} />
                  <AvatarFallback className="text-xs">
                    {post.author.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Link
                href={`/profile/${post.author.username}`}
                className="text-sm font-semibold hover:opacity-70"
              >
                {post.author.username}
              </Link>
              {isOwnPost && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setShowDeletePost(true)}
                  className="ml-auto"
                >
                  <MoreHorizontal size={18} />
                </Button>
              )}
            </div>

            <Separator />

            {/* Comments section */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
              {/* Caption */}
              {post.caption && (
                <div className="flex gap-3">
                  <Link href={`/profile/${post.author.username}`} className="shrink-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={post.author.image ?? undefined} />
                      <AvatarFallback className="text-xs">
                        {post.author.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div>
                    <p className="text-sm">
                      <Link
                        href={`/profile/${post.author.username}`}
                        className="font-semibold hover:opacity-70"
                      >
                        {post.author.username}
                      </Link>{" "}
                      {post.caption}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(post.createdAt)}
                    </span>
                  </div>
                </div>
              )}

              {/* Comment list */}
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  isOwnPost={isOwnPost}
                  expandedReplies={expandedReplies[comment.id]}
                  loadingReplies={loadingReplies[comment.id] ?? false}
                  onReply={handleReply}
                  onDelete={setDeleteCommentId}
                  onLoadReplies={handleLoadReplies}
                />
              ))}

              {/* Load more comments */}
              {hasMoreComments && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLoadMoreComments}
                  disabled={loadingMore}
                  className="text-muted-foreground"
                >
                  {loadingMore ? "Loading..." : "Load more comments"}
                </Button>
              )}
            </div>

            <Separator />

            {/* Action buttons */}
            <div className="px-4 py-2 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleToggleLike}
                    aria-label={optimisticLiked ? "Unlike" : "Like"}
                  >
                    <Heart
                      size={22}
                      className={optimisticLiked ? "fill-red-500 text-red-500" : ""}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => commentInputRef.current?.focus()}
                    aria-label="Comment"
                  >
                    <MessageCircle size={22} />
                  </Button>
                  <Button variant="ghost" size="icon-sm" aria-label="Share">
                    <Send size={22} />
                  </Button>
                </div>
                <Button variant="ghost" size="icon-sm" aria-label="Save">
                  <Bookmark size={22} />
                </Button>
              </div>

              <p className="text-sm font-semibold">
                {formatCount(optimisticLikeCount)} {optimisticLikeCount === 1 ? "like" : "likes"}
              </p>

              <p className="text-xs text-muted-foreground">
                {timeAgo(post.createdAt)}
              </p>
            </div>

            <Separator />

            {/* Comment input */}
            <form onSubmit={handleSubmitComment} className="flex items-center gap-2 px-4 py-3">
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
                  aria-label="Cancel reply"
                >
                  &times;
                </Button>
              )}
              <Input
                ref={commentInputRef}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={replyingTo ? `Reply to @${replyingTo.username}...` : "Add a comment..."}
                className="flex-1 border-none bg-transparent focus-visible:ring-0 focus-visible:border-transparent"
              />
              <Button
                variant="ghost"
                size="sm"
                type="submit"
                disabled={!commentText.trim()}
                className="text-blue-500 font-semibold hover:text-blue-600 disabled:opacity-40"
              >
                Post
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete comment confirmation */}
      <AlertDialog open={!!deleteCommentId} onOpenChange={() => setDeleteCommentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteComment}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete post confirmation */}
      <AlertDialog open={showDeletePost} onOpenChange={setShowDeletePost}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your post and all its comments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeletePost}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── CommentItem ────────────────────────────────────────────────────────────

function CommentItem({
  comment,
  isOwnPost,
  expandedReplies,
  loadingReplies,
  onReply,
  onDelete,
  onLoadReplies,
}: {
  comment: Comment;
  isOwnPost: boolean;
  expandedReplies?: Comment[];
  loadingReplies: boolean;
  onReply: (commentId: string, username: string) => void;
  onDelete: (commentId: string) => void;
  onLoadReplies: (commentId: string) => void;
}) {
  const hasReplies = comment._count.replies > 0;
  const repliesLoaded = !!expandedReplies;

  return (
    <div className="flex gap-3">
      <Link href={`/profile/${comment.user.username}`} className="shrink-0">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.user.image ?? undefined} />
          <AvatarFallback className="text-xs">
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

        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-muted-foreground">
            {timeAgo(comment.createdAt)}
          </span>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onReply(comment.id, comment.user.username)}
            className="text-xs text-muted-foreground h-auto p-0 hover:bg-transparent"
          >
            Reply
          </Button>
          {isOwnPost && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onDelete(comment.id)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 size={12} />
            </Button>
          )}
        </div>

        {/* Replies */}
        {hasReplies && !repliesLoaded && (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onLoadReplies(comment.id)}
            disabled={loadingReplies}
            className="text-xs text-muted-foreground mt-2 h-auto p-0 hover:bg-transparent"
          >
            {loadingReplies
              ? "Loading..."
              : `── View ${comment._count.replies} ${comment._count.replies === 1 ? "reply" : "replies"}`}
          </Button>
        )}

        {expandedReplies && expandedReplies.length > 0 && (
          <div className="mt-3 space-y-3 pl-2 border-l border-border">
            {expandedReplies.map((reply) => (
              <div key={reply.id} className="flex gap-3">
                <Link href={`/profile/${reply.user.username}`} className="shrink-0">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={reply.user.image ?? undefined} />
                    <AvatarFallback className="text-[10px]">
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
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(reply.createdAt)}
                    </span>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => onReply(comment.id, reply.user.username)}
                      className="text-xs text-muted-foreground h-auto p-0 hover:bg-transparent"
                    >
                      Reply
                    </Button>
                    {isOwnPost && (
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onDelete(reply.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 size={12} />
                      </Button>
                    )}
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