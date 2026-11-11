/**
 * Purpose: auth Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// server/routes/authRoutes.js

// Load express so this module can use its exported dependencies.
import express from "express";

// Load ../controllers/authController.js so this module can use its exported dependencies.
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

// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";
// Load ../middleware/customerProfileSync.js so this module can use its exported dependencies.
import { syncCustomerProfile } from "../middleware/customerProfileSync.js";

// Load ../middleware/authRateLimiters.js so this module can use its exported dependencies.
import {
  loginRateLimiter,
  passwordResetRateLimiter,
} from "../middleware/authRateLimiters.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
router.post("/register", resolveTenant, register);
// Perform the side effect or state update expressed on the following line.
router.post("/login", resolveTenant, loginRateLimiter, login);
// Perform the side effect or state update expressed on the following line.
router.post("/password-reset/request", resolveTenant, passwordResetRateLimiter, requestPasswordReset);
// Perform the side effect or state update expressed on the following line.
router.post("/password-reset/confirm", resolveTenant, passwordResetRateLimiter, resetPasswordWithCode);

// Authenticated account-email changes do not use resolveTenant because
// platform SuperAdmins intentionally have no tenant.
// Perform the side effect or state update expressed on the following line.
router.post("/email-change/request", protect, passwordResetRateLimiter, requestEmailChange);
// Perform the side effect or state update expressed on the following line.
router.post("/email-change/confirm", protect, passwordResetRateLimiter, confirmEmailChange);

// Authentication must establish the canonical tenant context before the
// customer profile synchronizer runs. This also backfills CRM profiles for
// existing customer accounts the next time they authenticate/use /me.
// Perform the side effect or state update expressed on the following line.
router.post("/logout", logout);
// Perform the side effect or state update expressed on the following line.
router.get("/me", protect, syncCustomerProfile, getMe);
// Perform the side effect or state update expressed on the following line.
router.put("/change-password", protect, syncCustomerProfile, changePassword);

export default router;
