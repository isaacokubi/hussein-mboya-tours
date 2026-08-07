// server/routes/tourManagerRoutes.js

import express from "express";

import {
  getTourManagerDashboard,
} from "../controllers/tourManagerController.js";

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
| TOUR MANAGER DASHBOARD
|--------------------------------------------------------------------------
*/

router.get(
  "/dashboard",
  roleMiddleware(["admin", "tour_manager", "tourmanager", "manager"]),
  getTourManagerDashboard
);

export default router;