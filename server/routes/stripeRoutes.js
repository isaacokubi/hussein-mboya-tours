/**
 * Purpose: stripe Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load express so this module can use its exported dependencies.
import express from "express";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";
// Load express-rate-limit so this module can use its exported dependencies.
import rateLimit from "express-rate-limit";
// Load ../controllers/stripeController.js so this module can use its exported dependencies.
import { createStripeSession, verifyStripeSession, createBankTransferPayment, stripeWebhook } from "../controllers/stripeController.js";
// Declare router for use by the surrounding module or function.
const router = express.Router();
// Declare paymentInitiationLimit for use by the surrounding module or function.
const paymentInitiationLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });

// Perform the side effect or state update expressed on the following line.
router.post("/webhook", stripeWebhook);
// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);
// Perform the side effect or state update expressed on the following line.
router.use(protect);
// Perform the side effect or state update expressed on the following line.
router.post("/checkout",paymentInitiationLimit,createStripeSession);
// Perform the side effect or state update expressed on the following line.
router.get("/verify/:sessionId",verifyStripeSession);
// Perform the side effect or state update expressed on the following line.
router.post("/bank-transfer",paymentInitiationLimit,createBankTransferPayment);
export default router;
