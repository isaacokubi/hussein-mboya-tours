import { resolveTenant } from "../middleware/tenantMiddleware.js";

// server/routes/tourRoutes.js

import express from "express";

import {
  createTour,
  getTours,
  getFeaturedTours,
  searchTours,
  getTourById,
  getTourBySlug,
  getManagerTours,
  updateTour,
  deleteTour,
  assignVehicle,
  removeVehicle,
} from "../controllers/tourController.js";

import {
  getTourAvailability,
  updateTourAvailability,
} from "../controllers/tourAvailabilityController.js";

import { protect } from "../middleware/authMiddleware.js";
import tourManagerOnly from "../middleware/tourManagerMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import { assignTourResources } from "../controllers/tourAssignmentController.js";

const router = express.Router();

router.use(resolveTenant);

/*
|--------------------------------------------------------------------------
| PUBLIC TOUR ROUTES
|--------------------------------------------------------------------------
*/

// GET ALL TOURS
// GET /api/tours
router.get("/", getTours);

// FEATURED TOURS
// GET /api/tours/featured
router.get("/featured", getFeaturedTours);

// SEARCH TOURS
// GET /api/tours/search
router.get("/search", searchTours);

// GET TOUR BY SLUG
// GET /api/tours/slug/:slug
router.get("/slug/:slug", getTourBySlug);

/*
|--------------------------------------------------------------------------
| PROTECTED TOUR MANAGER ROUTES
|--------------------------------------------------------------------------
|
| IMPORTANT: named routes must be registered before /:id. Express matches
| routes in declaration order, so /manager must not be captured as a tour id.
|--------------------------------------------------------------------------
*/

router.use(protect);
router.use(tourManagerOnly);

// GET MANAGER TOURS
// GET /api/tours/manager
// Must remain above /:id to avoid treating "manager" as a tour id.
router.get("/manager", getManagerTours);

// CREATE TOUR
// POST /api/tours
router.post("/", upload.array("images", 10), createTour);

/*
|--------------------------------------------------------------------------
| TOUR AVAILABILITY MANAGEMENT
|--------------------------------------------------------------------------
*/

// GET TOUR AVAILABILITY
// GET /api/tours/:id/availability
router.get("/:id/availability", getTourAvailability);

// PATCH /api/tours/:id/availability
router.patch("/:id/availability", updateTourAvailability);

/*
|--------------------------------------------------------------------------
| SINGLE TOUR / CRUD
|--------------------------------------------------------------------------
*/

// GET SINGLE TOUR
// GET /api/tours/:id
router.get("/:id", getTourById);

// UPDATE TOUR
// PUT /api/tours/:id
router.put("/:id", upload.array("images", 10), updateTour);

// DELETE TOUR
// DELETE /api/tours/:id
router.delete("/:id", deleteTour);

/*
|--------------------------------------------------------------------------
| TOUR RESOURCE ASSIGNMENT
|--------------------------------------------------------------------------
*/

// PUT /api/tours/:id/assign
// Frontend compatibility alias for assigning guide/driver/vehicle.
router.put("/:id/assign", assignTourResources);

// PATCH /api/tours/:id/assign-vehicle
router.patch("/:id/assign-vehicle", assignVehicle);

// PATCH /api/tours/:id/remove-vehicle
router.patch("/:id/remove-vehicle", removeVehicle);

export default router;
