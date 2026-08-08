// server/routes/analyticsRoutes.js

import express from "express";

import {
  getAnalytics,
  dashboardAnalytics,
} from "../controllers/analyticsController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| AUTHORIZATION
|--------------------------------------------------------------------------
*/

router.use(protect);
router.use(adminMiddleware);

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

export default router;