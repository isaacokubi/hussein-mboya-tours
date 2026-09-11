import { resolveTenant } from "../middleware/tenantMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";
import express from "express";
import { getDashboardMetrics } from "../controllers/adminDashboardMetricsController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(resolveTenant);

// One canonical tenant dashboard data source. /metrics remains the explicit
// compatibility endpoint; both URLs return the same normalized payload.
router.get("/metrics", protect, adminOnly, authorize("admin.dashboard"), getDashboardMetrics);
router.get("/", protect, adminOnly, authorize("admin.dashboard"), getDashboardMetrics);

export default router;
