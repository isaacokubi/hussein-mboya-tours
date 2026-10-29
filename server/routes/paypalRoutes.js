import express from "express";
import rateLimit from "express-rate-limit";
import { protect } from "../middleware/authMiddleware.js";
import { resolveTenant } from "../middleware/tenantMiddleware.js";
import { capturePaypalOrder, createPaypalOrder, paypalWebhook } from "../controllers/paypalController.js";

const router = express.Router();
const initiationLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });
router.post("/webhooks/:tenantId/:environment", paypalWebhook);
router.use(resolveTenant, protect);
router.post("/orders", initiationLimit, createPaypalOrder);
router.post("/orders/capture", initiationLimit, capturePaypalOrder);
export default router;
