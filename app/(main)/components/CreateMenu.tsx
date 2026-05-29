"use client";

import { LayoutGrid, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

type CreateMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPost: () => void;
};

export default function CreateMenu({
  open,
  onOpenChange,
  onSelectPost,
}: CreateMenuProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-xs p-0 rounded-2xl overflow-hidden"
      >
        <DialogTitle className="sr-only">Create</DialogTitle>

        {/* Post option */}
        <Button
          variant="ghost"
          onClick={() => {
            onOpenChange(false);
            onSelectPost();
          }}
          className="flex items-center justify-between w-full px-4 py-7 rounded-none cursor-pointer"
        >
          <span className="text-base font-normal">Post</span>
          <LayoutGrid size={24} />
        </Button>

        <Separator />

        {/* AI option (placeholder) */}
        <Button
          variant="ghost"
          disabled
          className="flex items-center justify-between w-full px-4 py-7 rounded-none opacity-50"
        >
          <span className="text-base font-normal">AI</span>
          <Sparkles size={24} />
        </Button>
      </DialogContent>
    </Dialog>
  );
}