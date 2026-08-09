// server/routes/tourReportRoutes.js

import express from "express";

import {
  getTourReports,
} from "../controllers/tourReportController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

import {
  roleMiddleware,
} from "../middleware/roleMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| AUTHORIZATION
|--------------------------------------------------------------------------
*/

router.use(protect);

/*
|--------------------------------------------------------------------------
| TOUR REPORTS
|--------------------------------------------------------------------------
*/

/**
 * GET /api/tour-reports
 * Get submitted tour reports.
 */
router.get(
  "/",
  roleMiddleware("admin", "tour_manager"),
  getTourReports
);

export default router;