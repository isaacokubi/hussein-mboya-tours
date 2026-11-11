/**
 * Purpose: integration Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import express from "express";
// Load express-rate-limit so this module can use its exported dependencies.
import rateLimit from "express-rate-limit";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";
// Load ../middleware/permissionMiddleware.js so this module can use its exported dependencies.
import { authorize } from "../middleware/permissionMiddleware.js";
// Load ../middleware/integrationAuth.js so this module can use its exported dependencies.
import { requireIntegrationKey, requirePublicIntegrationKey, requireIntegrationPermission } from "../middleware/integrationAuth.js";
// Load ../controllers/integrationController.js so this module can use its exported dependencies.
import {
  createIntegrationKey,
  listIntegrationKeys,
  revokeIntegrationKey,
  getIntegrationConfig,
  listIntegrationTours,
  getIntegrationWidget,
  createExternalBooking,
} from "../controllers/integrationController.js";
// Load ../controllers/websiteLeadController.js so this module can use its exported dependencies.
import { createWebsiteLead, listWebsiteLeads, updateWebsiteLead } from "../controllers/websiteLeadController.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();
// Declare integrationLimiter for use by the surrounding module or function.
const integrationLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 120, standardHeaders: true, legacyHeaders: false, keyGenerator: (req) => `${req.ip}:${String(req.get("X-Public-Integration-Key") || req.get("X-API-Key") || "anonymous").slice(0, 24)}` });

// Perform the side effect or state update expressed on the following line.
router.post("/keys", protect, authorize("settings.manage"), createIntegrationKey);
// Perform the side effect or state update expressed on the following line.
router.get("/keys", protect, authorize("settings.manage"), listIntegrationKeys);
// Perform the side effect or state update expressed on the following line.
router.delete("/keys/:id", protect, authorize("settings.manage"), revokeIntegrationKey);

// Perform the side effect or state update expressed on the following line.
router.use("/v1", integrationLimiter);
// Perform the side effect or state update expressed on the following line.
router.get("/v1/config", requirePublicIntegrationKey, requireIntegrationPermission("tour:read"), getIntegrationConfig);
// Perform the side effect or state update expressed on the following line.
router.get("/v1/tours", requirePublicIntegrationKey, requireIntegrationPermission("tour:read"), listIntegrationTours);
// Perform the side effect or state update expressed on the following line.
router.get("/v1/widget.js", requirePublicIntegrationKey, requireIntegrationPermission("booking:create"), getIntegrationWidget);
// Perform the side effect or state update expressed on the following line.
router.post("/v1/bookings", requirePublicIntegrationKey, requireIntegrationPermission("booking:create"), createExternalBooking);
// Perform the side effect or state update expressed on the following line.
router.post("/v1/leads", requirePublicIntegrationKey, requireIntegrationPermission("lead:create"), createWebsiteLead);
// Perform the side effect or state update expressed on the following line.
router.post("/v1/server/bookings", requireIntegrationKey, requireIntegrationPermission("booking:create"), createExternalBooking);

// Perform the side effect or state update expressed on the following line.
router.get("/leads", protect, authorize("settings.manage"), listWebsiteLeads);
// Perform the side effect or state update expressed on the following line.
router.patch("/leads/:id", protect, authorize("settings.manage"), updateWebsiteLead);

export default router;
