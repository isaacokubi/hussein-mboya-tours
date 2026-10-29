import { resolveTenant } from "../middleware/tenantMiddleware.js";
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import rateLimit from "express-rate-limit";
import { createStripeSession, verifyStripeSession, createBankTransferPayment } from "../controllers/stripeController.js";
const router = express.Router();
const paymentInitiationLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });

router.use(resolveTenant);
router.use(protect);
router.post("/checkout",paymentInitiationLimit,createStripeSession);
router.get("/verify/:sessionId",verifyStripeSession);
router.post("/bank-transfer",paymentInitiationLimit,createBankTransferPayment);
export default router;
