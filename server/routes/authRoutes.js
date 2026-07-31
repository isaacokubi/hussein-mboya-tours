// server/routes/authRoutes.js

import express from "express";

import {
  register,
  login,
  logout,
  getMe,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
} from "../controllers/authController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| AUTHENTICATION
|--------------------------------------------------------------------------
|
| Public Routes
|
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

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post(
  "/refresh",
  refreshToken
);

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post(
  "/forgot-password",
  forgotPassword
);

/**
 * POST /api/auth/reset-password
 * Reset password using token
 */
router.post(
  "/reset-password",
  resetPassword
);

/*
|--------------------------------------------------------------------------
| PROTECTED ROUTES
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
 * POST /api/auth/logout
 * Logout current user
 */
router.post(
  "/logout",
  logout
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