import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createStripeSession, verifyStripeSession, createBankTransferPayment } from "../controllers/stripeController.js";
const router=express.Router();
router.use(protect);
router.post("/checkout",createStripeSession);
router.get("/verify/:sessionId",verifyStripeSession);
router.post("/bank-transfer",createBankTransferPayment);
export default router;
