import { resolveTenant } from "../middleware/tenantMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";
// server/routes/analyticsRoutes.js

import express from "express";

import {
  getAnalytics,
  dashboardAnalytics,
  revenueAnalytics,
} from "../controllers/analyticsController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(resolveTenant);

/*
|--------------------------------------------------------------------------
| AUTHORIZATION
|--------------------------------------------------------------------------
*/

router.use(protect);
router.use(adminMiddleware);

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
router.get(
  "/",
  getAnalytics
);

/**
 * GET /api/analytics/dashboard
 * Dashboard analytics
 */
router.get(
  "/dashboard",
  dashboardAnalytics
);

router.get(
  "/revenue",
  revenueAnalytics
);

export default router;
