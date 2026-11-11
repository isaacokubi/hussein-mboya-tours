/**
 * Purpose: paypal Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import express from "express";
// Load express-rate-limit so this module can use its exported dependencies.
import rateLimit from "express-rate-limit";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";
// Load ../middleware/tenantMiddleware.js so this module can use its exported dependencies.
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load ../controllers/paypalController.js so this module can use its exported dependencies.
import { capturePaypalOrder, createPaypalOrder, paypalWebhook } from "../controllers/paypalController.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();
// Declare initiationLimit for use by the surrounding module or function.
const initiationLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });
// Perform the side effect or state update expressed on the following line.
router.post("/webhooks/:tenantId/:environment", paypalWebhook);
// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant, protect);
// Perform the side effect or state update expressed on the following line.
router.post("/orders", initiationLimit, createPaypalOrder);
// Perform the side effect or state update expressed on the following line.
router.post("/orders/capture", initiationLimit, capturePaypalOrder);
export default router;
