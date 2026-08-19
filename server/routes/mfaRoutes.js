import express from "express";
import {
  sendCustomerLoginPin,
  verifyCustomerLoginPin,
} from "../controllers/mfaController.js";
import { loginRateLimiter } from "../middleware/authRateLimiters.js";

const router = express.Router();

// MFA PIN endpoints are part of the unauthenticated login flow, so they
// cannot use `protect`; they must still be aggressively rate-limited.
router.post(
  "/customer/send-pin",
  loginRateLimiter,
  sendCustomerLoginPin
);

router.post(
  "/customer/verify-pin",
  loginRateLimiter,
  verifyCustomerLoginPin
);

export default router;
