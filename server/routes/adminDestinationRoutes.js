/**
 * Purpose: admin Destination Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load ../middleware/permissionMiddleware.js so this module can use its exported dependencies.
import { authorize } from "../middleware/permissionMiddleware.js";

// server/routes/adminDestinationRoutes.js

// Load express so this module can use its exported dependencies.
import express from "express";

// Load ../controllers/adminDestinationController.js so this module can use its exported dependencies.
import {
  createDestination,
  getAdminDestinations,
  getDestinationById,
  updateDestination,
  deleteDestination,
} from "../controllers/adminDestinationController.js";

// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import {
  protect,
} from "../middleware/authMiddleware.js";

// Load ../middleware/adminMiddleware.js so this module can use its exported dependencies.
import adminMiddleware from "../middleware/adminMiddleware.js";

// Load ../middleware/uploadMiddleware.js so this module can use its exported dependencies.
import upload from "../middleware/uploadMiddleware.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);

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

// Perform the side effect or state update expressed on the following line.
router.use(protect);
// Perform the side effect or state update expressed on the following line.
router.use(adminMiddleware);

// Perform the side effect or state update expressed on the following line.
router.use(authorize("manage_destinations"));

/*
|--------------------------------------------------------------------------
| DESTINATIONS
|--------------------------------------------------------------------------
*/

/**
 * GET /api/admin/destinations
 * Get all destinations
 */
// Perform the side effect or state update expressed on the following line.
router.get(
  "/",
  getAdminDestinations
);

/**
 * GET /api/admin/destinations/:id
 * Get destination details
 */
// Perform the side effect or state update expressed on the following line.
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
// Perform the side effect or state update expressed on the following line.
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
// Perform the side effect or state update expressed on the following line.
router.put(
  "/:id",
  upload.array("images", 10),
  updateDestination
);

/**
 * DELETE /api/admin/destinations/:id
 * Delete destination
 */
// Perform the side effect or state update expressed on the following line.
router.delete(
  "/:id",
  deleteDestination
);

export default router;
