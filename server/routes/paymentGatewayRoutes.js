import express from "express";
import rateLimit from "express-rate-limit";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";
import { resolveTenant } from "../middleware/tenantMiddleware.js";
import { listGatewayConfigs, getGatewayConfig, upsertGatewayConfig, disableGatewayConfig, validateMpesaGateway } from "../controllers/paymentGatewayController.js";

const router = express.Router();
router.use(resolveTenant, protect, authorize("settings.manage"));
router.get("/", listGatewayConfigs);
router.get("/:provider", getGatewayConfig);
router.put("/:provider", upsertGatewayConfig);
router.post("/MPESA/validate", rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false }), validateMpesaGateway);
router.delete("/:provider", disableGatewayConfig);
export default router;
