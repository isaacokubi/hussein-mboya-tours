import { resolveTenant } from "../middleware/tenantMiddleware.js";

// server/routes/tourRoutes.js

import express from "express";

import {
  getTours,
  getFeaturedTours,
  searchTours,
  getTourById,
  getTourBySlug,
  getManagerTours,
} from "../controllers/tourController.js";
import { createTour, updateTour, deleteTour, setPublication } from "../controllers/tourCrudController.js";

import {
  getTourAvailability,
  updateTourAvailability,
} from "../controllers/tourAvailabilityController.js";

import { protect } from "../middleware/authMiddleware.js";
import tourManagerOnly from "../middleware/tourManagerMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import validateTourCommand from "../middleware/validateTourCommand.js";
import { assignTourResourcesSafe } from "../controllers/tourResourceAssignmentController.js";


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

// TOUR AVAILABILITY
// GET /api/tours/:id/availability
// Keep this read-only availability endpoint public, as it was before the
// protected tour-manager section below.
router.get("/:id/availability", getTourAvailability);

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
router.post("/", validateTourCommand(), upload.array("images", 10), createTour);

/*
|--------------------------------------------------------------------------
| TOUR AVAILABILITY MANAGEMENT
|--------------------------------------------------------------------------
*/

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
router.put("/:id", validateTourCommand(), upload.array("images", 10), updateTour);

// DELETE TOUR
// DELETE /api/tours/:id
router.delete("/:id", deleteTour);
router.patch("/:id/publication", setPublication);

/*
|--------------------------------------------------------------------------
| TOUR RESOURCE ASSIGNMENT
|--------------------------------------------------------------------------
*/

// PUT /api/tours/:id/assign
// Frontend compatibility alias for assigning guide/driver/vehicle.
router.put("/:id/assign", assignTourResourcesSafe);

// PATCH /api/tours/:id/assign-vehicle
router.patch("/:id/assign-vehicle", assignTourResourcesSafe);

// PATCH /api/tours/:id/remove-vehicle
router.patch("/:id/remove-vehicle", (req, res, next) => { req.body = { ...(req.body || {}), vehicleId: null }; return assignTourResourcesSafe(req, res, next); });

export default router;
