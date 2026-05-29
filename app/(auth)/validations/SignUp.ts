import { z } from "zod";

export const signUpSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be at most 100 characters"),
  fullName: z.string().min(1, "Name is required").max(100),
  username: z
    .string()
    .min(4, "Username must be at least 4 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9._]+$/, "Username can only contain letters, numbers, dots, and underscores"),
  month: z.string().min(1, "Required"),
  day: z.string().min(1, "Required"),
  year: z.string().min(1, "Required"),
});

export type SignUpType = z.infer<typeof signUpSchema>;

export const signUpVerificationSchema = z.object({
  code: z
    .string()
    .min(1, "Verification code is required")
    .regex(/^\d+$/, "Code must contain digits only"),
});

export type SignUpVerificationType = z.infer<typeof signUpVerificationSchema>;
