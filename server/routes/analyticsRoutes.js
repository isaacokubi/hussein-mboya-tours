/**
 * Purpose: analytics Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load ../middleware/permissionMiddleware.js so this module can use its exported dependencies.
import { authorize } from "../middleware/permissionMiddleware.js";
// server/routes/analyticsRoutes.js

// Load express so this module can use its exported dependencies.
import express from "express";

// Load ../controllers/analyticsController.js so this module can use its exported dependencies.
import {
  getAnalytics,
  dashboardAnalytics,
  revenueAnalytics,
} from "../controllers/analyticsController.js";

// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import {
  protect,
} from "../middleware/authMiddleware.js";

// Load ../middleware/adminMiddleware.js so this module can use its exported dependencies.
import adminMiddleware from "../middleware/adminMiddleware.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);

/*
|--------------------------------------------------------------------------
| AUTHORIZATION
|--------------------------------------------------------------------------
*/

// Perform the side effect or state update expressed on the following line.
router.use(protect);
// Perform the side effect or state update expressed on the following line.
router.use(adminMiddleware);

// Perform the side effect or state update expressed on the following line.
router.use(authorize("analytics.view"));

/*
|--------------------------------------------------------------------------
| ANALYTICS
|--------------------------------------------------------------------------
*/

/**
 * GET /api/analytics
 * Full analytics report
 */
// Perform the side effect or state update expressed on the following line.
router.get(
  "/",
  getAnalytics
);

/**
 * GET /api/analytics/dashboard
 * Dashboard analytics
 */
// Perform the side effect or state update expressed on the following line.
router.get(
  "/dashboard",
  dashboardAnalytics
);

// Perform the side effect or state update expressed on the following line.
router.get(
  "/revenue",
  revenueAnalytics
);

export default router;
