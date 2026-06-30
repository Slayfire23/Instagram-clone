import { z } from "zod";

export const signUpSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be at most 100 characters"),
  fullName: z.string().min(1, "Name is required").max(100),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(4, "Username must be at least 4 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-z0-9._]+$/, "Username can only contain lowercase letters, numbers, dots, and underscores"),
  month: z.string().min(1, "Required"),
  day: z.string().min(1, "Required"),
  year: z.string().min(1, "Required"),
});

export type SignUpType = z.infer<typeof signUpSchema>;
