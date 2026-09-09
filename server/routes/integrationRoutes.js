import express from "express";
import rateLimit from "express-rate-limit";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";
import { requireIntegrationKey, requirePublicIntegrationKey, requireIntegrationPermission } from "../middleware/integrationAuth.js";
import {
  createIntegrationKey,
  listIntegrationKeys,
  revokeIntegrationKey,
  getIntegrationConfig,
  listIntegrationTours,
  getIntegrationWidget,
  createExternalBooking,
} from "../controllers/integrationController.js";

const router = express.Router();
const integrationLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 120, standardHeaders: true, legacyHeaders: false, keyGenerator: (req) => `${req.ip}:${String(req.get("X-Public-Integration-Key") || req.get("X-API-Key") || "anonymous").slice(0, 24)}` });

// Tenant admin management. protect establishes the tenant from the user's JWT.
router.post("/keys", protect, authorize("settings.manage"), createIntegrationKey);
router.get("/keys", protect, authorize("settings.manage"), listIntegrationKeys);
router.delete("/keys/:id", protect, authorize("settings.manage"), revokeIntegrationKey);

// Browser connector: only the publishable site key is exposed to the browser.
router.use("/v1", integrationLimiter);
router.get("/v1/config", requirePublicIntegrationKey, requireIntegrationPermission("tour:read"), getIntegrationConfig);
router.get("/v1/tours", requirePublicIntegrationKey, requireIntegrationPermission("tour:read"), listIntegrationTours);
router.get("/v1/widget.js", requirePublicIntegrationKey, requireIntegrationPermission("booking:create"), getIntegrationWidget);
router.post("/v1/bookings", requirePublicIntegrationKey, requireIntegrationPermission("booking:create"), createExternalBooking);

// Server-to-server partner integration may use the secret API key.
router.post("/v1/server/bookings", requireIntegrationKey, requireIntegrationPermission("booking:create"), createExternalBooking);

export default router;