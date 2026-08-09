// server/routes/guideRoutes.js

import express from "express";

import {
  guideDashboard,
  getAssignedTours,
  getTourDetails,
  getTourGuests,
  updateTourStatus,
  submitTourReport,
} from "../controllers/guideController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

import {
  guideMiddleware,
} from "../middleware/guideMiddleware.js";

import {
  authorize,
} from "../middleware/permissionMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| AUTHORIZATION
|--------------------------------------------------------------------------
|
| All guide routes require:
| • Valid JWT
| • Guide role
|
|--------------------------------------------------------------------------
*/

router.use(protect);
router.use(guideMiddleware);

/*
|--------------------------------------------------------------------------
| DASHBOARD
|--------------------------------------------------------------------------
*/

router.get(
  "/dashboard",
  authorize("view_assigned_tours"),
  guideDashboard
);

/*
|--------------------------------------------------------------------------
| ASSIGNED TOURS
|--------------------------------------------------------------------------
*/

router.get(
  "/assigned-tours",
  authorize("view_assigned_tours"),
  getAssignedTours
);

router.get(
  "/tours/:id",
  authorize("view_assigned_tours"),
  getTourDetails
);

router.get(
  "/tours/:id/guests",
  authorize("view_tour_guests"),
  getTourGuests
);

router.put(
  "/tours/:id/status",
  authorize("update_tour_status"),
  updateTourStatus
);

router.post(
  "/tours/:id/report",
  authorize("submit_tour_report"),
  submitTourReport
);

export default router;