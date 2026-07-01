import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import { generateUploadSignature } from "../utils/cloudinary.js";
import { env } from "../validators/env.validator.js";

export const getUploadSignature = catchAsync(
  async (req: Request, res: Response) => {
    const { timestamp, signature } = generateUploadSignature();

    res.json({
      timestamp,
      signature,
      apiKey: env.CLOUDINARY_API_KEY,
      cloudName: env.CLOUDINARY_CLOUD_NAME,
    });
  },
);
