import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import { updateAvatarSchema } from "../validators/user.validator.js";
import { AppError } from "../errors/AppError.js";
import { db } from "../db/index.js";
import { users } from "../db/schema/users.js";
import { eq } from "drizzle-orm";
import { ApiRes } from "./auth.controller.js";

export const updateAvatar = catchAsync(
  async (req: Request, res: Response<ApiRes>, next: NextFunction) => {
    const result = updateAvatarSchema.safeParse(req.body);

    if (!result.success) {
      const errorMsg = JSON.stringify(result.error.flatten().fieldErrors);
      throw new AppError(errorMsg, 400);
    }

    const { userId, avatarUrl } = result.data;

    const [updatedUser] = await db
      .update(users)
      .set({
        avatarUrl: avatarUrl,
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      throw new AppError("User not found", 404);
    }

    return res.status(200).json({
      status: "success",
      message: "Avatar updated successfully",
      data: updatedUser,
    });
  },
);
