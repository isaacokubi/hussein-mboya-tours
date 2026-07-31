// server/routes/adminDestinationRoutes.js

import express from "express";

import {
  createDestination,
  getAdminDestinations,
  getDestinationById,
  updateDestination,
  deleteDestination,
} from "../controllers/adminDestinationController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

import {
  adminMiddleware,
} from "../middleware/adminMiddleware.js";

import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| ADMIN AUTHORIZATION
|--------------------------------------------------------------------------
|
| All destination management routes require:
| - Valid JWT
| - Active account
| - Admin privileges
|
|--------------------------------------------------------------------------
*/

router.use(protect);
router.use(adminMiddleware);

/*
|--------------------------------------------------------------------------
| DESTINATIONS
|--------------------------------------------------------------------------
*/

/**
 * GET /api/admin/destinations
 * Get all destinations
 */
router.get(
  "/",
  getAdminDestinations
);

/**
 * GET /api/admin/destinations/:id
 * Get destination details
 */
router.get(
  "/:id",
  getDestinationById
);

/**
 * POST /api/admin/destinations
 * Create destination
 *
 * Upload:
 * images[] (max 10)
 */
router.post(
  "/",
  upload.array("images", 10),
  createDestination
);

/**
 * PUT /api/admin/destinations/:id
 * Update destination
 *
 * Upload:
 * images[] (optional)
 */
router.put(
  "/:id",
  upload.array("images", 10),
  updateDestination
);

/**
 * DELETE /api/admin/destinations/:id
 * Delete destination
 */
router.delete(
  "/:id",
  deleteDestination
);

export default router;