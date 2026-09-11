import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";
import { requirePublicIntegrationKey, requireIntegrationPermission } from "../middleware/integrationAuth.js";
import { createWebsiteLead, listWebsiteLeads, updateWebsiteLead } from "../controllers/websiteLeadController.js";

const router = express.Router();

router.post("/v1/leads", requirePublicIntegrationKey, requireIntegrationPermission("lead:create"), createWebsiteLead);
router.get("/leads", protect, authorize("settings.manage"), listWebsiteLeads);
router.patch("/leads/:id", protect, authorize("settings.manage"), updateWebsiteLead);

export default router;
