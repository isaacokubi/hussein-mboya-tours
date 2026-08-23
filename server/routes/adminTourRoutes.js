import { resolveTenant } from "../middleware/tenantMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";

// server/routes/adminTourRoutes.js

import express from "express";

import {
  createTour,
  getAllTours,
  getTour,
  updateTour,
  deleteTour,
  restoreTour,
  assignGuide,
  assignDriver,
  assignVehicle,
} from "../controllers/adminTourController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

import adminMiddleware from "../middleware/adminMiddleware.js";

import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(resolveTenant);

/*
|--------------------------------------------------------------------------
| ADMIN AUTHORIZATION
|--------------------------------------------------------------------------
|
| All routes require:
| - Valid JWT
| - Active account
| - Admin privileges
|
|--------------------------------------------------------------------------
*/

router.use(protect);
router.use(adminMiddleware);

router.use(authorize("tour.manage"));

/*
|--------------------------------------------------------------------------
| TOURS
|--------------------------------------------------------------------------
*/

/**
 * GET /api/admin/tours
 * Get all tours
 */
router.get(
  "/",
  getAllTours
);

/**
 * GET /api/admin/tours/:id
 * Get single tour
 */
router.get(
  "/:id",
  getTour
);

/**
 * POST /api/admin/tours
 * Create new tour
 *
 * Upload:
 * images[] (max 10)
 */
router.post(
  "/",
  upload.array("images", 10),
  createTour
);

/**
 * PUT /api/admin/tours/:id
 * Update tour
 *
 * Upload:
 * images[] (optional)
 */
router.put(
  "/:id",
  upload.array("images", 10),
  updateTour
);

/**
 * DELETE /api/admin/tours/:id
 * Soft delete tour
 */
router.delete(
  "/:id",
  deleteTour
);

/**
 * PATCH /api/admin/tours/:id/restore
 * Restore soft-deleted tour
 */
router.patch(
  "/:id/restore",
  restoreTour
);

/*
|--------------------------------------------------------------------------
| TOUR RESOURCE ASSIGNMENTS
|--------------------------------------------------------------------------
*/

/**
 * PATCH /api/admin/tours/:id/guide
 * Assign guide
 */
router.patch(
  "/:id/guide",
  assignGuide
);

/**
 * PATCH /api/admin/tours/:id/driver
 * Assign driver
 */
router.patch(
  "/:id/driver",
  assignDriver
);

/**
 * PATCH /api/admin/tours/:id/vehicle
 * Assign vehicle
 */
router.patch(
  "/:id/vehicle",
  assignVehicle
);

export default router;
