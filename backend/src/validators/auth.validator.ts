import { z } from "zod";

export const registerUserSchema = z
  .object({
    fullName: z
      .string()
      .min(3, { message: "Full Name is Required" })
      .max(150, { message: "Full name Cannot be more than 150 characters" }),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      // 1 Uppercase Letter
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      })
      // 1 Lowercase Letter
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter",
      })
      // 1 Number
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      // 1 Special Character
      .regex(/[^A-Za-z0-9]/, {
        message: "Password must contain at least one special character",
      }),

    confirmPassword: z.string().min(8, {
      message: "Confirm password must be at least 8 characters long",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginUserSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    // 1 Uppercase Letter
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    // 1 Lowercase Letter
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    // 1 Number
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    // 1 Special Character
    .regex(/[^A-Za-z0-9]/, {
      message: "Password must contain at least one special character",
    }),
});

export const verifyEmailSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  code: z
    .string()
    .length(6, "OTP must be exactly 6 characters")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

export const forgotPassSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
});

export const resetPassSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  code: z
    .string()
    .length(6, "OTP must be exactly 6 characters")
    .regex(/^\d+$/, "OTP must contain only numbers"),
  newPassword: z
    .string()
    .min(8, { message: "New password must be at least 8 characters long" })
    // 1 Uppercase Letter
    .regex(/[A-Z]/, {
      message: "New password must contain at least one uppercase letter",
    })
    // 1 Lowercase Letter
    .regex(/[a-z]/, {
      message: "New password must contain at least one lowercase letter",
    })
    // 1 Number
    .regex(/[0-9]/, {
      message: "New password must contain at least one number",
    })
    // 1 Special Character
    .regex(/[^A-Za-z0-9]/, {
      message: "New password must contain at least one special character",
    }),
});

export type registerInput = z.infer<typeof registerUserSchema>;
export type loginInput = z.infer<typeof loginUserSchema>;
