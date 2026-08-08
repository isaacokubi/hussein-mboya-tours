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

// TOUR AVAILABILITY
// GET /api/tours/:id/availability
router.get("/:id/availability", getTourAvailability);

// GET SINGLE TOUR
// GET /api/tours/:id
router.get("/:id", getTourById);

/*
|--------------------------------------------------------------------------
| PROTECTED TOUR MANAGER ROUTES
|--------------------------------------------------------------------------
*/

router.use(protect);
router.use(tourManagerOnly);

// GET MANAGER TOURS
// GET /api/tours/manager
router.get("/manager", getManagerTours);

// CREATE TOUR
// POST /api/tours
router.post("/", upload.array("images", 10), createTour);

// UPDATE TOUR
// PUT /api/tours/:id
router.put("/:id", upload.array("images", 10), updateTour);

// DELETE TOUR
// DELETE /api/tours/:id
router.delete("/:id", deleteTour);

/*
|--------------------------------------------------------------------------
| TOUR AVAILABILITY MANAGEMENT
|--------------------------------------------------------------------------
*/

// PATCH /api/tours/:id/availability
router.patch("/:id/availability", updateTourAvailability);

/*
|--------------------------------------------------------------------------
| VEHICLE ASSIGNMENT
|--------------------------------------------------------------------------
*/

// PUT /api/tours/:id/assign
// Frontend compatibility alias for assigning guide/driver/vehicle.
router.put(
  "/:id/assign",
  assignTourResources
);

// PATCH /api/tours/:id/assign-vehicle
router.patch("/:id/assign-vehicle", assignVehicle);

// PATCH /api/tours/:id/remove-vehicle
router.patch("/:id/remove-vehicle", removeVehicle);

export default router;