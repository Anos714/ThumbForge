import { Router } from "express";
import {
  forgotPassword,
  getMe,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  rotateTokens,
  verifyEmail,
} from "../controllers/auth.controller.js";
import { requiredAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", requiredAuth, getMe);
router.post("/refresh", rotateTokens);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
