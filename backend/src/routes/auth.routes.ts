import { Router } from "express";
import {
  forgotPassword,
  getMe,
  googleAuth,
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
router.post("/google", googleAuth);


export default router;

// https://accounts.google.com/o/oauth2/v2/auth?client_id=132278909217-nvjpatiig2qd5dsa7kpgcbqmdo0r0nsm.apps.googleusercontent.com&redirect_uri=http://localhost:3000/auth/google/callback&response_type=code&scope=email%20profile%20openid&prompt=consent&access_type=offline
