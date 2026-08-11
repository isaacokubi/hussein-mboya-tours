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

import {
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| PUBLIC AUTH ROUTES
|--------------------------------------------------------------------------
*/

/**
 * POST /api/auth/register
 * Register a new user
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
  login
);

router.post(
  "/password-reset/request",
  requestPasswordReset
);

router.post(
  "/password-reset/confirm",
  resetPasswordWithCode
);

/*
|--------------------------------------------------------------------------
| PROTECTED AUTH ROUTES
|--------------------------------------------------------------------------
*/

router.use(protect);

/**
 * GET /api/auth/me
 * Get authenticated user
 */
router.get(
  "/me",
  getMe
);

/**
 * PUT /api/auth/change-password
 * Change password
 */
router.put(
  "/change-password",
  changePassword
);

export default router;