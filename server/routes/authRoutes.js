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

/*
 * Tenant resolution is required for public authentication flows, because a
 * tenant has to be selected before looking up a tenant-scoped account.
 *
 * Protected authentication flows are deliberately different: /me and
 * /change-password must authenticate the JWT FIRST. The authenticated user's
 * tenantId in the database/token is the authoritative tenant boundary.
 * Running public tenant discovery before protect can select the wrong local
 * tenant (or leave the request unscoped) and make a valid JWT appear invalid.
 */

router.post(
  "/bootstrap",
  resolveTenant,
  loginRateLimiter,
  bootstrapTenant
);

router.post(
  "/register",
  resolveTenant,
  register
);

router.post(
  "/login",
  resolveTenant,
  loginRateLimiter,
  login
);

router.post(
  "/password-reset/request",
  resolveTenant,
  passwordResetRateLimiter,
  requestPasswordReset
);

router.post(
  "/password-reset/confirm",
  resolveTenant,
  passwordResetRateLimiter,
  resetPasswordWithCode
);

/*
 * Authenticate first. protect() loads the user in a controlled platform
 * context, verifies the JWT, verifies the token tenant against the database
 * tenant, and then establishes the canonical tenant context for the handler.
 */
router.get(
  "/me",
  protect,
  getMe
);

router.put(
  "/change-password",
  protect,
  changePassword
);

export default router;
