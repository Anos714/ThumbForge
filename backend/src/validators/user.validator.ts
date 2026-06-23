import { z } from "zod";

export const updateAvatarSchema = z.object({
  userId: z.string().min(1, "UserId is required"),
  avatarUrl: z.string().url("Invalid avatar URL"),
});
