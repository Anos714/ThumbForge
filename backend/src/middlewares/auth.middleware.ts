import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../errors/AppError.js";
import { verifyAccessToken } from "../utils/generateTokens.js";
import { db } from "../db/index.js";
import { users } from "../db/schema/users.js";
import { eq } from "drizzle-orm";

export const requiredAuth = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new AppError("Authorization header is required", 401);
    }

    if (!authHeader.startsWith("Bearer ")) {
      throw new AppError("Invalid Token Format. Use Bearer <token>", 401);
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new AppError("Token is required", 401);
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      throw new AppError("Token is invalid or expired", 401);
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId));
    if (!user) {
      throw new AppError("User not found or unauthorized", 401);
    }

    req.user = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    };

    next();
  },
);
