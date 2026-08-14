// server/routes/tourAssignmentRoutes.js

import express from "express";

import {
  assignTourResources,
} from "../controllers/tourAssignmentController.js";

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
|
| All tour assignment routes require authentication.
|
|--------------------------------------------------------------------------
*/

router.use(protect);

/*
|--------------------------------------------------------------------------
| TOUR ASSIGNMENTS
|--------------------------------------------------------------------------
*/

/**
 * PUT /api/tour-assignments/:id/assign
 *
 * Assign:
 * - Guide
 * - Driver
 * - Vehicle
 */
router.put(
  "/:id/assign",
  roleMiddleware("admin", "tour_manager", "tourmanager", "manager"),
  assignTourResources
);

export default router;

// RBAC middleware placeholder
