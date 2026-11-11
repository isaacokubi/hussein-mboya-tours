/**
 * Purpose: website Lead Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import express from "express";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";
// Load ../middleware/permissionMiddleware.js so this module can use its exported dependencies.
import { authorize } from "../middleware/permissionMiddleware.js";
// Load ../middleware/integrationAuth.js so this module can use its exported dependencies.
import { requirePublicIntegrationKey, requireIntegrationPermission } from "../middleware/integrationAuth.js";
// Load ../controllers/websiteLeadController.js so this module can use its exported dependencies.
import { createWebsiteLead, listWebsiteLeads, updateWebsiteLead } from "../controllers/websiteLeadController.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
router.post("/v1/leads", requirePublicIntegrationKey, requireIntegrationPermission("lead:create"), createWebsiteLead);
// Perform the side effect or state update expressed on the following line.
router.get("/leads", protect, authorize("settings.manage"), listWebsiteLeads);
// Perform the side effect or state update expressed on the following line.
router.patch("/leads/:id", protect, authorize("settings.manage"), updateWebsiteLead);

export default router;
