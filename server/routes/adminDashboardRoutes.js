/**
 * Purpose: admin Dashboard Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load ../middleware/permissionMiddleware.js so this module can use its exported dependencies.
import { authorize } from "../middleware/permissionMiddleware.js";
// Load express so this module can use its exported dependencies.
import express from "express";
// Load ../controllers/adminDashboardMetricsController.js so this module can use its exported dependencies.
import { getDashboardMetrics } from "../controllers/adminDashboardMetricsController.js";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect, adminOnly } from "../middleware/authMiddleware.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);

// One canonical tenant dashboard data source. /metrics remains the explicit
// compatibility endpoint; both URLs return the same normalized payload.
// Perform the side effect or state update expressed on the following line.
router.get("/metrics", protect, adminOnly, authorize("admin.dashboard"), getDashboardMetrics);
// Perform the side effect or state update expressed on the following line.
router.get("/", protect, adminOnly, authorize("admin.dashboard"), getDashboardMetrics);

export default router;
