import { resolveTenant } from "../middleware/tenantMiddleware.js";
// server/routes/authRoutes.js

import express from "express";

import {
  register,
  login,
  getMe,
  changePassword,
  requestPasswordReset,
  resetPasswordWithCode,
} from "../controllers/authController.js";
import { bootstrapTenant } from "../controllers/bootstrapController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

import {
  loginRateLimiter,
  passwordResetRateLimiter,
} from "../middleware/authRateLimiters.js";

const router = express.Router();

router.use(resolveTenant);

/* Public first-run onboarding. It becomes unavailable after the first user/tenant exists. */
router.post(
  "/bootstrap",
  loginRateLimiter,
  bootstrapTenant
);

router.post(
  "/register",
  register
);

router.post(
  "/login",
  loginRateLimiter,
  login
);

router.post(
  "/password-reset/request",
  passwordResetRateLimiter,
  requestPasswordReset
);

router.post(
  "/password-reset/confirm",
  passwordResetRateLimiter,
  resetPasswordWithCode
);

router.use(protect);

router.get(
  "/me",
  getMe
);

router.put(
  "/change-password",
  changePassword
);

export default router;
