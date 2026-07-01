import cloudinary from "../config/cloudinary.js";
import { env } from "../validators/env.validator.js";

export const generateUploadSignature = () => {
  const timestamp = Math.floor(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder: "thumbnails",
    },
    env.CLOUDINARY_API_SECRET,
  );
  return {
    timestamp,
    signature,
  };
};
