// server/routes/vehicleRoutes.js

import express from "express";

import {
  createVehicle,
  getVehicles,
  getVehicle,
  updateVehicle,
  deleteVehicle,
  restoreVehicle,
  assignVehicleDriver,
  removeVehicleDriver,
} from "../controllers/vehicleController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

import {
  roleMiddleware,
} from "../middleware/roleMiddleware.js";

import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| AUTHENTICATION
|--------------------------------------------------------------------------
|
| All vehicle routes require authentication.
|
|--------------------------------------------------------------------------
*/

router.use(protect);

/*
|--------------------------------------------------------------------------
| VEHICLE MANAGEMENT
|--------------------------------------------------------------------------
*/

/**
 * POST /api/vehicles
 * Create a new vehicle.
 */
router.post(
  "/",
  roleMiddleware("admin", "tour_manager"),
  upload.single("image"),
  createVehicle
);

/**
 * GET /api/vehicles
 * Get all vehicles.
 */
router.get(
  "/",
  roleMiddleware("admin", "tour_manager", "tour_guide"),
  getVehicles
);

/**
 * GET /api/vehicles/:id
 * Get a single vehicle.
 */
router.get(
  "/:id",
  roleMiddleware("admin", "tour_manager", "tour_guide"),
  getVehicle
);

/**
 * PUT /api/vehicles/:id
 * Update vehicle details and optionally replace its image.
 */
router.put(
  "/:id",
  roleMiddleware("admin", "tour_manager"),
  upload.single("image"),
  updateVehicle
);

/*
|--------------------------------------------------------------------------
| DRIVER ASSIGNMENT
|--------------------------------------------------------------------------
*/

/**
 * Assign a driver to a vehicle.
 */
router.put(
  "/:id/assign-driver",
  roleMiddleware("admin", "tour_manager"),
  assignVehicleDriver
);

/**
 * Remove a driver from a vehicle.
 */
router.put(
  "/:id/remove-driver",
  roleMiddleware("admin", "tour_manager"),
  removeVehicleDriver
);

/*
|--------------------------------------------------------------------------
| SOFT DELETE / RESTORE
|--------------------------------------------------------------------------
*/

/**
 * Soft delete a vehicle.
 */
router.delete(
  "/:id",
  roleMiddleware("admin"),
  deleteVehicle
);

/**
 * Restore a soft-deleted vehicle.
 */
router.patch(
  "/:id/restore",
  roleMiddleware("admin"),
  restoreVehicle
);

export default router;