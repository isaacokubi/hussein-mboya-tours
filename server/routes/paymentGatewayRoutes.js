import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";
import { resolveTenant } from "../middleware/tenantMiddleware.js";
import { listGatewayConfigs, getGatewayConfig, upsertGatewayConfig, disableGatewayConfig } from "../controllers/paymentGatewayController.js";

const router = express.Router();
router.use(resolveTenant, protect, authorize("settings.manage"));
router.get("/", listGatewayConfigs);
router.get("/:provider", getGatewayConfig);
router.put("/:provider", upsertGatewayConfig);
router.delete("/:provider", disableGatewayConfig);
export default router;
