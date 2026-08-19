import express from "express";
import {
  sendCustomerLoginPin,
  verifyCustomerLoginPin,
} from "../controllers/mfaController.js";
import {
  mfaSendRateLimiter,
  mfaVerifyRateLimiter,
} from "../middleware/authRateLimiters.js";

const router = express.Router();

// MFA PIN endpoints are part of the unauthenticated login flow, so they
// cannot use `protect`; they use dedicated, stricter throttles instead.
router.post(
  "/customer/send-pin",
  mfaSendRateLimiter,
  sendCustomerLoginPin
);

router.post(
  "/customer/verify-pin",
  mfaVerifyRateLimiter,
  verifyCustomerLoginPin
);

export default router;
