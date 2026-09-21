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
  requestEmailChange,
  confirmEmailChange,
  logout,
} from "../controllers/authController.js";
import { bootstrapTenant } from "../controllers/bootstrapController.js";

import { protect } from "../middleware/authMiddleware.js";
import { syncCustomerProfile } from "../middleware/customerProfileSync.js";

import {
  loginRateLimiter,
  passwordResetRateLimiter,
} from "../middleware/authRateLimiters.js";

const router = express.Router();

router.post("/bootstrap", resolveTenant, loginRateLimiter, bootstrapTenant);
router.post("/register", resolveTenant, register);
router.post("/login", resolveTenant, loginRateLimiter, login);
router.post("/password-reset/request", resolveTenant, passwordResetRateLimiter, requestPasswordReset);
router.post("/password-reset/confirm", resolveTenant, passwordResetRateLimiter, resetPasswordWithCode);

// Authenticated account-email changes do not use resolveTenant because
// platform SuperAdmins intentionally have no tenant.
router.post("/email-change/request", protect, passwordResetRateLimiter, requestEmailChange);
router.post("/email-change/confirm", protect, passwordResetRateLimiter, confirmEmailChange);

// Authentication must establish the canonical tenant context before the
// customer profile synchronizer runs. This also backfills CRM profiles for
// existing customer accounts the next time they authenticate/use /me.
router.post("/logout", logout);
router.get("/me", protect, syncCustomerProfile, getMe);
router.put("/change-password", protect, syncCustomerProfile, changePassword);

export default router;
