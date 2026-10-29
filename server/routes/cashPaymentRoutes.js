import express from "express";
import rateLimit from "express-rate-limit";
import { protect } from "../middleware/authMiddleware.js";
import { resolveTenant } from "../middleware/tenantMiddleware.js";
import { createCashPayment } from "../controllers/cashPaymentController.js";

const router = express.Router();
router.use(resolveTenant, protect);
router.post("/", rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false }), createCashPayment);
export default router;
