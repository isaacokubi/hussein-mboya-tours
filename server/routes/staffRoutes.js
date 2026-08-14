// server/routes/staffRoutes.js

import express from "express";

import {
  createStaff,
  getStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  getDrivers,
  getGuides,
} from "../controllers/staffController.js";

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
| DRIVER MANAGEMENT
|--------------------------------------------------------------------------
|
| Must come BEFORE "/:id"
|
*/

router.get(
  "/guides",
  roleMiddleware("admin", "tour_manager", "tourmanager", "manager"),
  getGuides
);

router.get(
  "/drivers",
  roleMiddleware("admin", "tour_manager", "tourmanager", "manager"),
  getDrivers
);

/*
|--------------------------------------------------------------------------
| STAFF
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  roleMiddleware("admin"),
  createStaff
);

router.get(
  "/",
  roleMiddleware("admin", "tour_manager", "tourmanager", "manager"),
  getStaff
);

router.get(
  "/:id",
  roleMiddleware("admin", "tour_manager", "tourmanager", "manager"),
  getStaffById
);

router.put(
  "/:id/status",
  roleMiddleware("admin"),
  updateStaff
);

router.put(
  "/:id",
  roleMiddleware("admin"),
  updateStaff
);

router.delete(
  "/:id",
  roleMiddleware("admin"),
  deleteStaff
);

export default router;

// RBAC middleware placeholder
