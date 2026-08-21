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

/*
|--------------------------------------------------------------------------
| PUBLIC AUTH ROUTES
|--------------------------------------------------------------------------
*/

/**
 * POST /api/auth/bootstrap
 * Create the first tenant and its Super Admin account.
 *
 * This endpoint is intentionally one-time: it refuses to run once any
 * organization or user exists in the database.
 */
router.post(
  "/bootstrap",
  bootstrapTenant
);

/**
 * POST /api/auth/register
 * Register a new customer user
 */
router.post(
  "/register",
  register
);

/**
 * POST /api/auth/login
 * Login user
 */
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

/*
|--------------------------------------------------------------------------
| PROTECTED AUTH ROUTES
|--------------------------------------------------------------------------
*/

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
