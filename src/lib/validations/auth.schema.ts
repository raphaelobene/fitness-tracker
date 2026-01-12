import { z } from "zod";

const emailSchema = z
  .email({ message: "Invalid email address", pattern: z.regexes.unicodeEmail })
  .trim();

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .refine((val) => /[!@#$%^&*(),.?":{}|<>]/.test(val), {
    message: "Password must contain at least one special character",
  });

export const signUpSchema = z.object({
  email: emailSchema,
  // username: z
  //   .string()
  //   .min(3, "Username must be at least 3 characters")
  //   .max(20, "Username must be less than 20 characters")
  //   .regex(
  //     /^[a-zA-Z0-9_]+$/,
  //     "Username can only contain letters, numbers, and underscores"
  //   ),
  name: z.string().min(1, "Name is required").max(50),
  password: passwordSchema,
});

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
