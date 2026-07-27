import express from "express";

import { protect, authorize } from "../middleware/authMiddleware.js";

import { getTourManagerDashboard } from "../controllers/tourManagerController.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| TOUR MANAGER DASHBOARD
|--------------------------------------------------------------------------
|
| Protected route
| Access:
| - admin (if added later)
| - tour_manager only currently
|
|--------------------------------------------------------------------------
*/

router.get(
  "/dashboard",

  protect,

  authorize("tourmanager"),

  getTourManagerDashboard,
);

export default router;
