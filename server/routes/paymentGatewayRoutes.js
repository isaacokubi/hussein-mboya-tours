/**
 * Purpose: payment Gateway Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import express from "express";
// Load express-rate-limit so this module can use its exported dependencies.
import rateLimit from "express-rate-limit";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";
// Load ../middleware/permissionMiddleware.js so this module can use its exported dependencies.
import { authorize } from "../middleware/permissionMiddleware.js";
// Load ../middleware/tenantMiddleware.js so this module can use its exported dependencies.
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load ../controllers/paymentGatewayController.js so this module can use its exported dependencies.
import { listGatewayConfigs, getGatewayConfig, upsertGatewayConfig, disableGatewayConfig, validateMpesaGateway, validateStripeGateway, validatePaypalGateway } from "../controllers/paymentGatewayController.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();
// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant, protect, authorize("settings.manage"));
// Perform the side effect or state update expressed on the following line.
router.get("/", listGatewayConfigs);
// Perform the side effect or state update expressed on the following line.
router.get("/:provider", getGatewayConfig);
// Perform the side effect or state update expressed on the following line.
router.put("/:provider", upsertGatewayConfig);
// Perform the side effect or state update expressed on the following line.
router.post("/MPESA/validate", rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false }), validateMpesaGateway);
// Perform the side effect or state update expressed on the following line.
router.post("/STRIPE/validate", rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false }), validateStripeGateway);
// Perform the side effect or state update expressed on the following line.
router.post("/PAYPAL/validate", rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false }), validatePaypalGateway);
// Perform the side effect or state update expressed on the following line.
router.delete("/:provider", disableGatewayConfig);
export default router;
