/**
 * Purpose: mfa Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load express so this module can use its exported dependencies.
import express from "express";
// Load ../controllers/mfaController.js so this module can use its exported dependencies.
import {
  sendCustomerLoginPin,
  verifyCustomerLoginPin,
} from "../controllers/mfaController.js";
// Load ../middleware/authRateLimiters.js so this module can use its exported dependencies.
import {
  mfaSendRateLimiter,
  mfaVerifyRateLimiter,
} from "../middleware/authRateLimiters.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);

// MFA PIN endpoints are part of the unauthenticated login flow, so they
// cannot use `protect`; they use dedicated, stricter throttles instead.
// Perform the side effect or state update expressed on the following line.
router.post(
  "/customer/send-pin",
  mfaSendRateLimiter,
  sendCustomerLoginPin
);

// Perform the side effect or state update expressed on the following line.
router.post(
  "/customer/verify-pin",
  mfaVerifyRateLimiter,
  verifyCustomerLoginPin
);

export default router;
