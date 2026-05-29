"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { UploadDropzone } from "@/lib/uploadthing";
import { createPost } from "@/server/actions/post.actions";
import { createPostSchema, CAPTION_MAX } from "@/app/(main)/validations/CreatePost";

type CreatePostModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CreatePostModal({
  open,
  onOpenChange,
}: CreatePostModalProps) {
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"IMAGE" | "VIDEO">("IMAGE");
  const [postType, setPostType] = useState<"IMAGE" | "REEL">("IMAGE");
  const [caption, setCaption] = useState("");
  const [errors, setErrors] = useState<{ postType?: string; caption?: string }>({});
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setMediaUrl(null);
    setMediaType("IMAGE");
    setPostType("IMAGE");
    setCaption("");
    setErrors({});
  }

  function handleClose() {
    resetForm();
    onOpenChange(false);
  }

  function handleDiscard() {
    resetForm();
  }

  function handleSubmit() {
    if (!mediaUrl) return;

    const result = createPostSchema.safeParse({
      mediaUrl,
      mediaType,
      type: postType,
      caption: caption.trim() || undefined,
    });

    if (!result.success) {
      const fieldErrors: typeof errors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        if (field === "type") fieldErrors.postType = issue.message;
        else if (field === "caption") fieldErrors.caption = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    startTransition(async () => {
      await createPost({
        mediaUrl,
        mediaType,
        type: postType,
        caption: caption.trim() || undefined,
      });
      handleClose();
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-lg p-0 rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <DialogTitle className="text-base font-semibold">
            Create new post
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleClose}
            className="cursor-pointer"
          >
            <X size={20} />
          </Button>
        </div>

        <Separator />

        {/* Body */}
        <div className="px-4 py-4 max-h-[70vh] overflow-y-auto">
          {!mediaUrl ? (
            /* Upload step */
            <UploadDropzone
              endpoint="mediaUploader"
              onClientUploadComplete={(res) => {
                if (res?.[0]) {
                  setMediaUrl(res[0].ufsUrl);
                  const isVideo = res[0].name?.match(/\.(mp4|mov|webm|avi|mkv)$/i);
                  setMediaType(isVideo ? "VIDEO" : "IMAGE");
                  setPostType(isVideo ? "REEL" : "IMAGE");
                }
              }}
              onUploadError={(error) => {
                console.error("Upload error:", error);
              }}
              config={{ appendOnPaste: true }}
              content={{
                label: "Choose a file or drag and drop",
                allowedContent: "Image and videos",
              }}
              appearance={{
                container:
                  "border-2 border-dashed border-muted-foreground/30 rounded-xl py-12 cursor-pointer hover:border-muted-foreground/50 transition-colors",
                label: "text-muted-foreground text-base",
                allowedContent: "text-muted-foreground/60 text-sm",
                button:
                  "bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-2 rounded-lg ut-uploading:bg-blue-400",
              }}
            />
          ) : (
            /* Preview + form step */
            <div className="space-y-4">
              {/* File preview */}
              <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted">
                {mediaType === "IMAGE" ? (
                  <Image
                    src={mediaUrl}
                    alt="Upload preview"
                    fill
                    className="object-cover"
                    sizes="(max-width: 512px) 100vw, 512px"
                  />
                ) : (
                  <video
                    src={mediaUrl}
                    className="w-full h-full object-cover"
                    controls
                    muted
                  />
                )}
              </div>

              {/* Post type select */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Post Type</label>
                <Select
                  value={postType}
                  onValueChange={(v) => {
                    setPostType(v as "IMAGE" | "REEL");
                    setErrors((prev) => ({ ...prev, postType: undefined }));
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IMAGE">Image</SelectItem>
                    <SelectItem value="REEL">Reel</SelectItem>
                  </SelectContent>
                </Select>
                {errors.postType && (
                  <p className="text-xs text-destructive">{errors.postType}</p>
                )}
              </div>

              {/* Caption */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Caption</label>
                  <span className={`text-xs ${caption.length > CAPTION_MAX ? "text-destructive" : "text-muted-foreground"}`}>
                    {caption.length}/{CAPTION_MAX}
                  </span>
                </div>
                <Textarea
                  value={caption}
                  onChange={(e) => {
                    setCaption(e.target.value);
                    setErrors((prev) => ({ ...prev, caption: undefined }));
                  }}
                  placeholder="Write a caption..."
                  rows={3}
                  maxLength={CAPTION_MAX}
                  className="resize-none"
                />
                {errors.caption && (
                  <p className="text-xs text-destructive">{errors.caption}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={handleSubmit}
                  disabled={isPending}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                >
                  {isPending ? "Submitting..." : "Submit"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleDiscard}
                  disabled={isPending}
                  className="flex-1 cursor-pointer"
                >
                  Discard
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}