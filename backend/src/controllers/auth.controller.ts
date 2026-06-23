import {
  forgotPassSchema,
  googlePayloadSchema,
  loginUserSchema,
  registerUserSchema,
  resetPassSchema,
  verifyEmailSchema,
} from "./../validators/auth.validator.js";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../errors/AppError.js";
import { db } from "../db/index.js";
import { users } from "../db/schema/users.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateJti,
  generateOtp,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/generateTokens.js";
import { env } from "../validators/env.validator.js";
import { client } from "../config/redis.js";
import { sendMail } from "../utils/sendEmail.js";
import { googleClient } from "../config/google.js";

// response body types
export interface ApiRes {
  status: "success" | "fail" | "error";
  message: string;
  data?: unknown;
}

// cookie optiosn
const cookieConfig = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export const registerUser = catchAsync(
  async (req: Request, res: Response<ApiRes>, next: NextFunction) => {
    const result = registerUserSchema.safeParse(req.body);
    if (!result.success) {
      const errorMsg = JSON.stringify(result.error.flatten().fieldErrors);
      throw new AppError(errorMsg, 400);
    }

    const { email, password, fullName } = result.data;

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser) {
      if (existingUser.authProvider === "google") {
        throw new AppError("Please login using google", 400);
      } else {
        throw new AppError("User already exists", 409);
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        fullName,
        email,
        passwordHash: hashedPassword,
      })
      .returning();

    if (!newUser) {
      throw new AppError("Failed to create user", 500);
    }

    const jti = generateJti();
    const accessToken = generateAccessToken(newUser.id);
    const refreshToken = generateRefreshToken(newUser.id, jti);

    const redisKey = `refreshToken:${jti}`;
    const redisValue = "true";

    await client.set(redisKey, redisValue, { EX: 7 * 24 * 60 * 60 });

    res.cookie("refreshToken", refreshToken, {
      ...cookieConfig,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const otp = generateOtp();
    const otpRedisKey = `email_verification:${newUser.email}`;
    await client.set(otpRedisKey, otp, { EX: 10 * 60 });

    // sending the verification email
    let emailSent = true;
    try {
      await sendMail(
        newUser.email,
        "Email Verification for ThumbForge",
        `
        <h1>Hello ${newUser.fullName}</h1>
        <p>Thank you for registering with ThumbForge. Please verify your email by entering the OTP below:</p>
        <p>OTP: <strong>${otp}</strong></p>
        <p>OTP only valid for 10 min.<p>
        <p>If you did not register for an account, please ignore this email.</p>
       
        `,
      );
    } catch (error) {
      console.error("Email sending failed:", error);
      emailSent = false;
    }

    res.status(201).json({
      status: "success",
      message: emailSent
        ? "User registered successfully. Please check your email for OTP!"
        : "Registered successfully, but we faced an issue sending the email. Please click resend OTP.",
      data: {
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        accessToken,
      },
    });
  },
);

export const loginUser = catchAsync(
  async (req: Request, res: Response<ApiRes>, next: NextFunction) => {
    const result = loginUserSchema.safeParse(req.body);
    if (!result.success) {
      const errorMsg = JSON.stringify(result.error.flatten().fieldErrors);
      throw new AppError(errorMsg, 400);
    }

    const { email, password } = result.data;

    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    if (user.authProvider === "google") {
      throw new AppError("Please login with google", 400);
    }

    if (!user.passwordHash) {
      throw new AppError("Invalid Credentials", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    if (!user.isVerified) {
      const otp = generateOtp();
      const otpRedisKey = `email_verification:${user.email}`;
      await client.set(otpRedisKey, otp, { EX: 10 * 60 });

      // sending the verification email
      let emailSent = true;
      try {
        await sendMail(
          user.email,
          "Email Verification for ThumbForge",
          `
          <h1>Hello ${user.fullName}</h1>
          <p>You tried to log in, but your email is not verified yet. Please use the OTP below to verify your account:</p>
          <p>OTP: <strong>${otp}</strong></p>
          <p>This OTP is valid for 10 minutes.</p>
          `,
        );
      } catch (error) {
        console.error("Email sending failed:", error);
        emailSent = false;
      }
      throw new AppError(
        "Your email is not verified. We have sent a new OTP to your email. Please verify first.",
        403,
      );
    }

    const jti = generateJti();
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id, jti);

    const redisKey = `refreshToken:${jti}`;
    const redisValue = "true";

    await client.set(redisKey, redisValue, { EX: 7 * 24 * 60 * 60 });

    res.cookie("refreshToken", refreshToken, {
      ...cookieConfig,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: "success",
      message: "User logged in successfully",
      data: {
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        accessToken,
      },
    });
  },
);

export const logoutUser = catchAsync(
  async (req: Request, res: Response<ApiRes>, next: NextFunction) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw new AppError("Token is missing or invalid", 401);
    }

    const decodeToken = verifyRefreshToken(refreshToken);

    if (!decodeToken) {
      throw new AppError("Token is invalid or expired", 401);
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, decodeToken.userId));
    if (!user) {
      throw new AppError("User not found or unauthorized", 401);
    }

    const jti = decodeToken.jti;
    const redisKey = `refreshToken:${jti}`;

    await client.del(redisKey);

    res.clearCookie("refreshToken", { ...cookieConfig });

    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  },
);

export const getMe = catchAsync(
  async (req: Request, res: Response<ApiRes>, next: NextFunction) => {
    const currentUser = req.user;

    res.status(200).json({
      status: "success",
      message: "Current user fetched successfully",
      data: {
        user: currentUser,
      },
    });
  },
);

export const rotateTokens = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw new AppError("Token is missing or invalid", 401);
    }

    const decodeToken = verifyRefreshToken(refreshToken);

    if (!decodeToken) {
      throw new AppError("Token is invalid or expired", 401);
    }

    const jti = decodeToken.jti;
    const redisKey = `refreshToken:${jti}`;
    const isValid = await client.get(redisKey);

    if (!isValid) {
      throw new AppError("Token is invalid or expired", 401);
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, decodeToken.userId));
    if (!user) {
      throw new AppError("User not found or unauthorized", 401);
    }

    await client.del(redisKey);

    const newJti = generateJti();
    const newAccessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id, newJti);

    await client.set(`refreshToken:${newJti}`, "true", {
      EX: 7 * 24 * 60 * 60,
    });

    res.cookie("refreshToken", newRefreshToken, {
      ...cookieConfig,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: "success",
      message: "Tokens rotated successfully",
      data: {
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        accessToken: newAccessToken,
      },
    });
  },
);

export const verifyEmail = catchAsync(
  async (req: Request, res: Response<ApiRes>, next: NextFunction) => {
    const result = verifyEmailSchema.safeParse(req.body);

    if (!result.success) {
      const errorMsg = JSON.stringify(result.error.flatten().fieldErrors);
      throw new AppError(errorMsg, 400);
    }

    const { email, code } = result.data;

    const otpRedisKey = `email_verification:${email}`;
    const storedOtp = await client.get(otpRedisKey);

    if (!storedOtp) {
      throw new AppError(
        "OTP has expired or is invalid. Please request a new one.",
        400,
      );
    }

    if (storedOtp !== code) {
      throw new AppError(
        "Invalid OTP. Please check the code and try again.",
        400,
      );
    }

    const [updatedUser] = await db
      .update(users)
      .set({ isVerified: true, emailVerifiedAt: new Date() })
      .where(eq(users.email, email))
      .returning();

    if (!updatedUser) {
      throw new AppError("User not found or verification failed", 404);
    }

    await client.del(otpRedisKey);

    res.status(200).json({
      status: "success",
      message: "Email verified successfully! Your account is now active.",
      data: {
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        isVerified: updatedUser.isVerified,
      },
    });
  },
);

export const forgotPassword = catchAsync(
  async (req: Request, res: Response<ApiRes>, next: NextFunction) => {
    const result = forgotPassSchema.safeParse(req.body);
    if (!result.success) {
      const errorMsg = JSON.stringify(result.error.flatten().fieldErrors);
      throw new AppError(errorMsg, 400);
    }

    const { email } = result.data;

    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.authProvider === "google") {
      throw new AppError("Please login with google", 400);
    }

    const otp = generateOtp();
    const otpRedisKey = `password_reset:${email}`;
    await client.set(otpRedisKey, otp, { EX: 5 * 60 });

    let emailSent = true;
    try {
      await sendMail(
        email,
        "Password Reset Code for ThumbForge",
        `
        <h1>Hello ${user.fullName}</h1>
        <p>We received a request to reset your password. Please use the OTP below to proceed:</p>
        <p>OTP: <strong>${otp}</strong></p>
        <p>This OTP is valid for 5 minutes.</p>
        `,
      );
    } catch (error) {
      console.error("Email sending failed:", error);
      emailSent = false;
    }

    res.status(200).json({
      status: "success",
      message: emailSent
        ? "Password reset OTP sent to your email"
        : "Failed to send email, please click resend OTP",
    });
  },
);

export const resetPassword = catchAsync(
  async (req: Request, res: Response<ApiRes>, next: NextFunction) => {
    const result = resetPassSchema.safeParse(req.body);
    if (!result.success) {
      const errorMsg = JSON.stringify(result.error.flatten().fieldErrors);
      throw new AppError(errorMsg, 400);
    }

    const { email, code, newPassword } = result.data;

    const otpRedisKey = `password_reset:${email}`;
    const storedOtp = await client.get(otpRedisKey);

    if (!storedOtp) {
      throw new AppError("OTP has expired or is invalid", 400);
    }

    if (storedOtp !== code) {
      throw new AppError("Invalid OTP", 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const [updatedUser] = await db
      .update(users)
      .set({ passwordHash: hashedPassword })
      .where(eq(users.email, email))
      .returning();

    if (!updatedUser) {
      throw new AppError("User not found or password update failed", 404);
    }

    await client.del(otpRedisKey);

    res.status(200).json({
      status: "success",
      message: "Password reset successfully",
    });
  },
);

export const googleAuth = catchAsync(
  async (req: Request, res: Response<ApiRes>, next: NextFunction) => {
    const { code } = req.body;

    if (!code) {
      throw new AppError("Authorization code is required", 400);
    }

    const { tokens } = await googleClient.getToken(code);

    if (!tokens || !tokens.id_token) {
      throw new AppError("Failed to retrieve ID token from Google", 400);
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const rawPayload = ticket.getPayload();
    if (!rawPayload) {
      throw new AppError("Google authentication failed", 400);
    }

    const result = googlePayloadSchema.safeParse(rawPayload);
    if (!result.success) {
      throw new AppError("Invalid data received from Google", 400);
    }

    const { sub, name, email, picture } = result.data;

    let [user] = await db.select().from(users).where(eq(users.email, email));

    if (user && user.authProvider === "local") {
      throw new AppError(
        "This email is registered with password. Please login using your email and password.",
        400,
      );
    }

    if (!user) {
      [user] = await db
        .insert(users)
        .values({
          googleId: sub,
          fullName: name,
          email,
          avatarUrl: picture || null,
          authProvider: "google",
          isVerified: true,
          emailVerifiedAt: new Date(),
        })
        .returning();
    } else if (user && user.authProvider === "google") {
      const hasChanges =
        user.googleId !== sub ||
        user.fullName !== name ||
        user.avatarUrl !== (picture || null);

      if (hasChanges) {
        [user] = await db
          .update(users)
          .set({
            googleId: sub,
            fullName: name,
            avatarUrl: picture || null,
          })
          .where(eq(users.id, user.id))
          .returning();
      }
    }

    const jti = generateJti();
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id, jti);

    await client.set(`refreshToken:${jti}`, "true", { EX: 7 * 24 * 60 * 60 });
    res.cookie("refreshToken", refreshToken, {
      ...cookieConfig,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: "success",
      message: "Successfully authenticated with Google",
      data: {
        fullName: user.fullName,
        email: user.email,
        avatarUrl: user.avatarUrl,
        accessToken,
      },
    });
  },
);
