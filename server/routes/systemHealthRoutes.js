/**
 * Purpose: system Health Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load express so this module can use its exported dependencies.
import express from "express";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";
// Load ../middleware/adminMiddleware.js so this module can use its exported dependencies.
import adminMiddleware from "../middleware/adminMiddleware.js";
// Load ../middleware/permissionMiddleware.js so this module can use its exported dependencies.
import { authorize } from "../middleware/permissionMiddleware.js";
// Load ../controllers/systemHealthController.js so this module can use its exported dependencies.
import { getSystemHealth } from "../controllers/systemHealthController.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);
// Perform the side effect or state update expressed on the following line.
router.use(protect);
// Perform the side effect or state update expressed on the following line.
router.use(adminMiddleware);
// Perform the side effect or state update expressed on the following line.
router.use(authorize("system.security"));

// Both endpoints use the same live health implementation so the dashboard
// cannot fall back to a database-only response that hides integrations.
// Perform the side effect or state update expressed on the following line.
router.get("/health", getSystemHealth);
// Perform the side effect or state update expressed on the following line.
router.get("/admin/system-health", getSystemHealth);

export default router;
