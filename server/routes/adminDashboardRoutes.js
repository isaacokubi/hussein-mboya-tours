// server/routes/adminDashboardRoutes.js

import express from "express";

import {
  dashboardStats,
} from "../controllers/adminDashboardController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| ADMIN DASHBOARD ROUTES
|--------------------------------------------------------------------------
|
| All routes require:
| - Authenticated user
| - Active account
| - Admin privileges
|
|--------------------------------------------------------------------------
*/

router.use(protect);
router.use(adminMiddleware);

/*
|--------------------------------------------------------------------------
| DASHBOARD STATISTICS
|--------------------------------------------------------------------------
|
| GET /api/admin/dashboard/stats
|
|--------------------------------------------------------------------------
*/

router.get(
  "/stats",
  dashboardStats
);

export default router;