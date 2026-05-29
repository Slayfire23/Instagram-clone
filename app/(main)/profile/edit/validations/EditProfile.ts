import { z } from "zod";

export const editProfileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9._]+$/,
      "Username can only contain letters, numbers, dots, and underscores"
    ),
  website: z
    .url("Please enter a valid URL")
    .max(200, "Website must be at most 200 characters")
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .max(500, "Bio must be at most 500 characters")
    .optional()
    .or(z.literal("")),
  gender: z.string().optional().or(z.literal("")),
  isPrivate: z.boolean(),
});

export type EditProfileType = z.infer<typeof editProfileSchema>;