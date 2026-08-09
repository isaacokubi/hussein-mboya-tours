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
  guideDashboard
);

/*
|--------------------------------------------------------------------------
| ASSIGNED TOURS
|--------------------------------------------------------------------------
*/

router.get(
  "/assigned-tours",
  getAssignedTours
);

router.get(
  "/tours/:id",
  getTourDetails
);

router.get(
  "/tours/:id/guests",
  getTourGuests
);

router.put(
  "/tours/:id/status",
  updateTourStatus
);

router.post(
  "/tours/:id/report",
  submitTourReport
);

export default router;