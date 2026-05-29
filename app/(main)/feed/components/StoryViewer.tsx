"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
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
import {
  markStoryViewed,
  deleteStory,
  getStoryViewers,
  getStoriesByAuthor,
} from "@/server/actions/story.actions";
import type { StoryWithMeta } from "@/server/actions/story.actions";

const IMAGE_DURATION = 30000; // 30s for images

type StoryViewerProps = {
  authorId: string;
  currentUserId: string;
  open: boolean;
  onClose: () => void;
  onStoryGroupViewed?: (authorId: string) => void;
};

type Viewer = {
  viewedAt: Date;
  user: { id: string; username: string; name: string | null; image: string | null };
};

export default function StoryViewer({
  authorId,
  currentUserId,
  open,
  onClose,
  onStoryGroupViewed,
}: StoryViewerProps) {
  const [stories, setStories] = useState<StoryWithMeta[]>([]);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showViewers, setShowViewers] = useState(false);
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const current = stories[index] ?? null;

  // ─── Load stories when opened ──────────────────────────────────────────────

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setIndex(0);
    setProgress(0);
    getStoriesByAuthor(authorId).then((data) => {
      setStories(data);
      setLoading(false);
    });
  }, [open, authorId]);

  // ─── Mark viewed when story changes ───────────────────────────────────────

  useEffect(() => {
    if (!current) return;
    markStoryViewed(current.id);
    // Only depend on the story ID to avoid infinite re-renders when viewed flag updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id]);

  // ─── Progress helpers ──────────────────────────────────────────────────────

  const clearProgress = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const advance = useCallback(() => {
    setIndex((i) => {
      if (i + 1 < stories.length) return i + 1;
      onStoryGroupViewed?.(authorId);
      onClose();
      return i;
    });
    setProgress(0);
  }, [stories.length, onClose, onStoryGroupViewed, authorId]);

  const startImageTimer = useCallback(() => {
    clearProgress();
    setProgress(0);
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / IMAGE_DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearProgress();
        advance();
      }
    }, 100);
  }, [clearProgress, advance]);

  const startVideoProgress = useCallback(() => {
    clearProgress();
    const video = videoRef.current;
    if (!video) return;
    intervalRef.current = setInterval(() => {
      if (!video.duration) return;
      const pct = (video.currentTime / video.duration) * 100;
      setProgress(pct);
      if (pct >= 99.9) {
        clearProgress();
        advance();
      }
    }, 100);
  }, [clearProgress, advance]);

  // Start timer when story changes
  useEffect(() => {
    if (!current || loading) return;
    clearProgress();
    setProgress(0);
    if (current.mediaType === "IMAGE") startImageTimer();
    return clearProgress;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, loading]);

  // ─── Navigation ───────────────────────────────────────────────────────────

  function goBack() {
    if (index === 0) return;
    clearProgress();
    setIndex(index - 1);
    setProgress(0);
  }

  function goForward() {
    if (index >= stories.length - 1) {
      onStoryGroupViewed?.(authorId);
      onClose();
      return;
    }
    clearProgress();
    setIndex(index + 1);
    setProgress(0);
  }

  // ─── Viewers panel ────────────────────────────────────────────────────────

  async function handleShowViewers() {
    if (!current) return;
    const data = await getStoryViewers(current.id);
    setViewers(data as Viewer[]);
    setShowViewers(true);
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  async function handleDelete() {
    if (!current) return;
    await deleteStory(current.id);
    const updated = stories.filter((s) => s.id !== current.id);
    if (updated.length === 0) {
      onClose();
      return;
    }
    const newIndex = index === 0 ? 0 : index - 1;
    setStories(updated);
    setIndex(newIndex);
    setProgress(0);
    setShowDeleteDialog(false);
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  if (!open) return null;

  return (
    <>
      {/* Full-screen overlay */}
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        {loading || !current ? (
          <div className="text-white/60 text-sm">Loading...</div>
        ) : (
          <div className="relative w-full max-w-sm h-full flex flex-col">

            {/* Progress bars */}
            <div className="absolute top-3 left-3 right-3 z-10 flex gap-1">
              {stories.map((s, i) => (
                <Progress
                  key={s.id}
                  value={i < index ? 100 : i === index ? progress : 0}
                  className="flex-1 h-0.5 bg-white/30 [&>div]:bg-white [&>div]:transition-none"
                />
              ))}
            </div>

            {/* Header */}
            <div className="absolute top-7 left-3 right-3 z-10 flex items-center gap-2">
              <Avatar className="h-8 w-8 border border-white/40">
                <AvatarImage src={current.author.image ?? undefined} />
                <AvatarFallback className="text-xs bg-muted">
                  {current.author.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-white text-sm font-semibold drop-shadow">
                {current.author.username}
              </span>
              <span className="text-white/60 text-xs">
                {formatDistanceToNow(new Date(current.createdAt), { addSuffix: true })}
              </span>

              <div className="ml-auto flex items-center gap-1">
                {current.mediaType === "VIDEO" && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => {
                      const next = !isMuted;
                      setIsMuted(next);
                      if (videoRef.current) videoRef.current.muted = next;
                    }}
                    className="text-white hover:bg-white/20 hover:text-white"
                  >
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </Button>
                )}

                {/* Owner only: view count */}
                {current.author.id === currentUserId && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={handleShowViewers}
                    className="text-white hover:bg-white/20 hover:text-white w-auto px-2 gap-1"
                  >
                    <Eye size={16} />
                    <span className="text-xs">{current.viewCount}</span>
                  </Button>
                )}

                {/* Owner only: delete */}
                {current.author.id === currentUserId && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-white hover:bg-white/20 hover:text-white"
                  >
                    <Trash2 size={16} />
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={onClose}
                  className="text-white hover:bg-white/20 hover:text-white"
                >
                  <X size={18} />
                </Button>
              </div>
            </div>

            {/* Media — tap left half to go back, right half to go forward */}
            <div className="flex-1 relative bg-black">
              {current.mediaType === "IMAGE" ? (
                <Image
                  src={current.mediaUrl}
                  alt="Story"
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              ) : (
                <video
                  ref={videoRef}
                  src={current.mediaUrl}
                  muted={isMuted}
                  playsInline
                  autoPlay
                  className="h-full w-full object-contain"
                  onPlay={startVideoProgress}
                  onEnded={advance}
                />
              )}

              {/* Tap zones */}
              <div className="absolute left-0 top-0 bottom-0 w-1/2 cursor-pointer" onClick={goBack} />
              <div className="absolute right-0 top-0 bottom-0 w-1/2 cursor-pointer" onClick={goForward} />
            </div>

            {/* Arrow buttons */}
            {index > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.stopPropagation(); goBack(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/40 text-white hover:bg-black/60 hover:text-white"
              >
                <ChevronLeft size={20} />
              </Button>
            )}
            {index < stories.length - 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.stopPropagation(); goForward(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/40 text-white hover:bg-black/60 hover:text-white"
              >
                <ChevronRight size={20} />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Viewers panel — right side, landscape rectangle */}
      <Sheet open={showViewers} onOpenChange={setShowViewers}>
        <SheetContent
          side="right"
          className=""
        >
          <SheetTitle className="text-base font-semibold mb-3 shrink-0">
            Viewers ({viewers.length})
          </SheetTitle>
          {viewers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No viewers yet</p>
          ) : (
            <div className="space-y-3 overflow-y-auto">
              {viewers.map((v) => (
                <div key={v.user.id} className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={v.user.image ?? undefined} />
                    <AvatarFallback className="text-xs bg-muted">
                      {v.user.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{v.user.username}</p>
                    {v.user.name && (
                      <p className="text-xs text-muted-foreground truncate">{v.user.name}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatDistanceToNow(new Date(v.viewedAt), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete story?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the story.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}