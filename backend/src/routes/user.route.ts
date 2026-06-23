import { Router } from "express";
import { updateAvatar } from "../controllers/user.controller.js";

const router = Router();

router.post("/update-avatar", updateAvatar);

export default router;
