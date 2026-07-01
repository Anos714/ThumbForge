import { Router } from "express";
import { getUploadSignature } from "../controllers/upload.controller.js";
import { requiredAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/signature", requiredAuth, getUploadSignature);

export default router;
