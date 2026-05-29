"use client";

import { useState } from "react";
import { Loader2, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { createStory } from "@/server/actions/story.actions";

type CreateStoryModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
};

export default function CreateStoryModal({
  open,
  onOpenChange,
  onCreated,
}: CreateStoryModalProps) {
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"IMAGE" | "VIDEO">("IMAGE");
  const [submitting, setSubmitting] = useState(false);

  function handleClose() {
    setMediaUrl(null);
    setMediaType("IMAGE");
    onOpenChange(false);
  }

  async function handleSubmit() {
    if (!mediaUrl) return;
    setSubmitting(true);
    const result = await createStory(mediaUrl, mediaType);
    setSubmitting(false);
    if (!("error" in result)) {
      handleClose();
      onCreated();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm p-0 overflow-hidden">
        <DialogTitle className="px-4 pt-4 pb-2 text-base font-semibold border-b">
          Create Story
        </DialogTitle>

        {!mediaUrl ? (
          // Step 1: Upload
          <div className="p-4">
            <UploadDropzone<OurFileRouter, "mediaUploader">
              endpoint="mediaUploader"
              onClientUploadComplete={(res) => {
                if (!res?.[0]) return;
                const url = res[0].ufsUrl;
                const name = res[0].name.toLowerCase();
                const isVideo = name.endsWith(".mp4") || name.endsWith(".mov") || name.endsWith(".webm");
                setMediaType(isVideo ? "VIDEO" : "IMAGE");
                setMediaUrl(url);
              }}
              onUploadError={(err) => console.error("Upload error:", err)}
              className="border-2 border-dashed border-muted-foreground/30 rounded-lg ut-label:text-sm ut-allowed-content:text-xs"
            />
          </div>
        ) : (
          // Step 2: Preview + submit
          <div className="flex flex-col gap-3 p-4">
            {/* 9:16 preview */}
            <div className="relative mx-auto w-48 rounded-lg overflow-hidden bg-black" style={{ aspectRatio: "9/16" }}>
              {mediaType === "IMAGE" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mediaUrl}
                  alt="Story preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <video
                  src={mediaUrl}
                  controls
                  muted
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setMediaUrl(null)}
                disabled={submitting}
              >
                <Upload size={14} className="mr-1" />
                Change
              </Button>
              <Button
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  "Share Story"
                )}
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-muted-foreground"
            >
              <X size={14} className="mr-1" />
              Cancel
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}