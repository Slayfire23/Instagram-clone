"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  getNotifications,
  markAllNotificationsAsRead,
} from "@/server/actions/notification.actions";
import {
  acceptFollowRequest,
  rejectFollowRequest,
} from "@/server/actions/follow.actions";
import { getPostById, deletePost } from "@/server/actions/post.actions";
import {
  likePost,
  unlikePost,
  hasUserLikedPost,
  getLikeCount,
  getComments,
  getCommentReplies,
  addComment,
  deleteComment,
} from "@/server/actions/interaction.actions";
import PostModal from "@/app/(main)/components/PostModal";

type Notification = Awaited<ReturnType<typeof getNotifications>>[number];

type NotificationsPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w`;
}

function getNotificationMessage(type: Notification["type"]) {
  switch (type) {
    case "FOLLOW":
      return "started following you.";
    case "FOLLOW_REQUEST":
      return "requested to follow you.";
    case "FOLLOW_REQUEST_ACCEPTED":
      return "accepted your follow request.";
    case "FOLLOW_REQUEST_REJECTED":
      return "rejected your follow request.";
    case "LIKE":
      return "liked your post.";
    case "COMMENT":
      return "commented on your post.";
    case "REPLY":
      return "replied to your comment.";
    default:
      return "interacted with you.";
  }
}

export default function NotificationsPanel({
  open,
  onOpenChange,
}: NotificationsPanelProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isPending, startTransition] = useTransition();

  // Post modal state
  type Comment = {
    id: string;
    content: string;
    createdAt: string;
    user: { username: string; image: string | null };
    _count: { replies: number };
  };

  const [showPostModal, setShowPostModal] = useState(false);
  const [modalPost, setModalPost] = useState<{
    id: string;
    mediaUrl: string;
    mediaType: "IMAGE" | "VIDEO";
    caption: string | null;
    createdAt: string;
    author: { username: string; image: string | null };
  } | null>(null);
  const [modalData, setModalData] = useState<{
    liked: boolean;
    likeCount: number;
    comments: Comment[];
    hasMore: boolean;
  } | null>(null);

  useEffect(() => {
    if (!open) return;

    startTransition(() => {
      void (async () => {
        const data = await getNotifications();
        setNotifications(data);
        await markAllNotificationsAsRead();
      })();
    });
  }, [open, startTransition]);

  function handleAccept(notificationId: string) {
    startTransition(async () => {
      await acceptFollowRequest(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, type: "FOLLOW" as const, isRead: true } : n
        )
      );
    });
  }

  function handleReject(notificationId: string) {
    startTransition(async () => {
      await rejectFollowRequest(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    });
  }

  function handleUserClick(username: string) {
    onOpenChange(false);
    router.push(`/profile/${username}`);
  }

  async function handleOpenPost(postId: string) {
    const post = await getPostById(postId);
    if (!post) return;

    const [liked, likeCount, commentsData] = await Promise.all([
      hasUserLikedPost(post.id),
      getLikeCount(post.id),
      getComments(post.id),
    ]);

    setModalPost({
      id: post.id,
      mediaUrl: post.mediaUrl,
      mediaType: post.mediaType,
      caption: post.caption,
      createdAt:
        post.createdAt instanceof Date
          ? post.createdAt.toISOString()
          : String(post.createdAt),
      author: post.author,
    });
    setModalData({
      liked,
      likeCount,
      comments: commentsData.comments,
      hasMore: commentsData.hasMore,
    });
    onOpenChange(false);
    setShowPostModal(true);
  }

  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-96 p-0 border-r shadow-2xl flex flex-col"
        showCloseButton={false}
        onMouseLeave={() => onOpenChange(false)}
      >
        <SheetTitle className="px-4 pt-4 pb-2 text-xl font-semibold">
          Notifications
        </SheetTitle>
        <Separator />

        <div className="flex-1 overflow-y-auto">
          {isPending ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="flex flex-col py-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors ${
                    !notification.isRead ? "bg-blue-50/50" : ""
                  }`}
                >
                  {/* Avatar */}
                  <Avatar
                    className="h-10 w-10 shrink-0 cursor-pointer"
                    onClick={() => handleUserClick(notification.sender.username)}
                  >
                    <AvatarImage src={notification.sender.image ?? undefined} />
                    <AvatarFallback className="text-xs bg-muted">
                      {notification.sender.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug">
                      <span
                        className="font-medium cursor-pointer hover:underline"
                        onClick={() => handleUserClick(notification.sender.username)}
                      >
                        {notification.sender.username}
                      </span>{" "}
                      <span className="text-muted-foreground">
                        {getNotificationMessage(notification.type)}
                      </span>{" "}
                      <span className="text-xs text-muted-foreground">
                        {timeAgo(notification.createdAt)}
                      </span>
                    </p>

                    {/* Accept/Reject buttons for follow requests */}
                    {notification.type === "FOLLOW_REQUEST" && !notification.isRead && (
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          onClick={() => handleAccept(notification.id)}
                          disabled={isPending}
                          className="bg-blue-500 hover:bg-blue-600 text-white text-xs h-7 px-4 cursor-pointer"
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleReject(notification.id)}
                          disabled={isPending}
                          className="bg-gray-100 hover:bg-gray-200 text-xs h-7 px-4 cursor-pointer"
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Post thumbnail if applicable */}
                  {notification.post && (
                    <button
                      onClick={() => handleOpenPost(notification.post!.id)}
                      className="shrink-0 cursor-pointer"
                    >
                      {notification.post.mediaType === "VIDEO" ? (
                        <video
                          src={notification.post.mediaUrl}
                          muted
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <Image
                          src={notification.post.mediaUrl}
                          alt=""
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded object-cover"
                        />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>

    {/* Post Modal */}
    {modalPost && modalData && (
      <PostModal
        post={modalPost}
        isOwnPost={false}
        initialLiked={modalData.liked}
        initialLikeCount={modalData.likeCount}
        initialComments={modalData.comments}
        initialHasMoreComments={modalData.hasMore}
        open={showPostModal}
        onOpenChange={(open) => {
          setShowPostModal(open);
          if (!open) {
            setModalPost(null);
            setModalData(null);
          }
        }}
        onLike={(postId) => likePost(postId)}
        onUnlike={(postId) => unlikePost(postId)}
        onComment={(postId, content, parentId) => addComment(postId, content, parentId)}
        onDeleteComment={(commentId) => deleteComment(commentId)}
        onDeletePost={(postId) => deletePost(postId)}
        onLoadMoreComments={(postId, cursor) => getComments(postId, cursor)}
        onLoadReplies={(commentId) => getCommentReplies(commentId)}
      />
    )}
    </>
  );
}
