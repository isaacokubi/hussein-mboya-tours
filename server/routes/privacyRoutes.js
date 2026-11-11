/**
 * Purpose: privacy Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import express from "express";
// Load express-rate-limit so this module can use its exported dependencies.
import rateLimit from "express-rate-limit";
// Load ../controllers/privacyController.js so this module can use its exported dependencies.
import { createPrivacyRequest, listPrivacyRequests, updatePrivacyRequest } from "../controllers/privacyController.js";
// Load ../controllers/privacyComplianceController.js so this module can use its exported dependencies.
import { getPrivacyComplianceSummary } from "../controllers/privacyComplianceController.js";
// Load ../middleware/tenantMiddleware.js so this module can use its exported dependencies.
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";
// Load ../middleware/permissionMiddleware.js so this module can use its exported dependencies.
import { authorize } from "../middleware/permissionMiddleware.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();
// Declare publicLimiter for use by the surrounding module or function.
const publicLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });
// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);
// Perform the side effect or state update expressed on the following line.
router.post("/requests", publicLimiter, createPrivacyRequest);
// Perform the side effect or state update expressed on the following line.
router.get("/admin/requests", protect, authorize("finance.view"), listPrivacyRequests);
// Perform the side effect or state update expressed on the following line.
router.get("/admin/summary", protect, authorize("finance.view"), getPrivacyComplianceSummary);
// Perform the side effect or state update expressed on the following line.
router.patch("/admin/requests/:id", protect, authorize("finance.manage"), updatePrivacyRequest);
export default router;
