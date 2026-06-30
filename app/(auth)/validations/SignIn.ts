import { z } from "zod";

export const signInSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Username is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be at most 100 characters"),
});

export type SignInType = z.infer<typeof signInSchema>;

export const verificationCodeSchema = z.object({
  code: z
    .string()
    .min(1, "Verification code is required")
    .regex(/^\d+$/, "Code must contain digits only"),
});

export type VerificationCodeType = z.infer<typeof verificationCodeSchema>;
