import { z } from "zod";

export const CAPTION_MAX = 80;

export const createPostSchema = z.object({
  mediaUrl: z.url("Invalid media URL"),
  mediaType: z.enum(["IMAGE", "VIDEO"], { message: "Media type must be IMAGE or VIDEO" }),
  type: z.enum(["IMAGE", "REEL"], { message: "Post type must be Image or Reel" }),
  caption: z
    .string()
    .max(CAPTION_MAX, `Caption must be at most ${CAPTION_MAX} characters`)
    .optional(),
});

export type CreatePostType = z.infer<typeof createPostSchema>;