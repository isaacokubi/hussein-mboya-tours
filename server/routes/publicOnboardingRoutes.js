import express from "express";
import rateLimit from "express-rate-limit";
import { registerTenantPublic } from "../controllers/publicOnboardingController.js";

const router = express.Router();

const onboardingRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many company registration attempts. Please try again later." },
});

router.post("/register", onboardingRateLimiter, registerTenantPublic);

export default router;
