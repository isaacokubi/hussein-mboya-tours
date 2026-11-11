/**
 * Purpose: tour Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// server/routes/tourRoutes.js

// Load express so this module can use its exported dependencies.
import express from "express";

// Load ../controllers/tourController.js so this module can use its exported dependencies.
import {
  getTours,
  getFeaturedTours,
  searchTours,
  getTourById,
  getTourBySlug,
  getManagerTours,
} from "../controllers/tourController.js";
// Load ../controllers/tourCrudController.js so this module can use its exported dependencies.
import { createTour, updateTour, deleteTour, setPublication } from "../controllers/tourCrudController.js";

// Load ../controllers/tourAvailabilityController.js so this module can use its exported dependencies.
import {
  getTourAvailability,
  updateTourAvailability,
} from "../controllers/tourAvailabilityController.js";

// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";
// Load ../middleware/tourManagerMiddleware.js so this module can use its exported dependencies.
import tourManagerOnly from "../middleware/tourManagerMiddleware.js";
// Load ../middleware/uploadMiddleware.js so this module can use its exported dependencies.
import upload from "../middleware/uploadMiddleware.js";
// Load ../middleware/validateTourCommand.js so this module can use its exported dependencies.
import validateTourCommand from "../middleware/validateTourCommand.js";
// Load ../controllers/tourResourceAssignmentController.js so this module can use its exported dependencies.
import { assignTourResourcesSafe } from "../controllers/tourResourceAssignmentController.js";


// Declare router for use by the surrounding module or function.
const router = express.Router();

/*
|--------------------------------------------------------------------------
| PUBLIC TOUR ROUTES
|--------------------------------------------------------------------------
*/

// GET ALL TOURS
// GET /api/tours
// Perform the side effect or state update expressed on the following line.
router.get("/", getTours);

// FEATURED TOURS
// GET /api/tours/featured
// Perform the side effect or state update expressed on the following line.
router.get("/featured", getFeaturedTours);

// SEARCH TOURS
// GET /api/tours/search
// Perform the side effect or state update expressed on the following line.
router.get("/search", searchTours);

// GET TOUR BY SLUG
// GET /api/tours/slug/:slug
// Perform the side effect or state update expressed on the following line.
router.get("/slug/:slug", getTourBySlug);

// TOUR AVAILABILITY
// GET /api/tours/:id/availability
// Keep this read-only availability endpoint public, as it was before the
// protected tour-manager section below.
// Perform the side effect or state update expressed on the following line.
router.get("/:id/availability", getTourAvailability);

// GET SINGLE PUBLIC TOUR BY ID
// Customer checkout requests the selected tour by MongoDB id. This read-only
// endpoint must remain public; mutation endpoints stay protected below.
// Perform the side effect or state update expressed on the following line.
router.get("/:id", getTourById);

/*
|--------------------------------------------------------------------------
| PROTECTED TOUR MANAGER ROUTES
|--------------------------------------------------------------------------
|
| IMPORTANT: named routes must be registered before /:id. Express matches
| routes in declaration order, so /manager must not be captured as a tour id.
|--------------------------------------------------------------------------
*/

// Perform the side effect or state update expressed on the following line.
router.use(protect);
// Perform the side effect or state update expressed on the following line.
router.use(tourManagerOnly);

// GET MANAGER TOURS
// GET /api/tours/manager
// Must remain above /:id to avoid treating "manager" as a tour id.
// Perform the side effect or state update expressed on the following line.
router.get("/manager", getManagerTours);

// CREATE TOUR
// POST /api/tours
// Perform the side effect or state update expressed on the following line.
router.post("/", validateTourCommand(), upload.array("images", 10), createTour);

/*
|--------------------------------------------------------------------------
| TOUR AVAILABILITY MANAGEMENT
|--------------------------------------------------------------------------
*/

// PATCH /api/tours/:id/availability
// Perform the side effect or state update expressed on the following line.
router.patch("/:id/availability", updateTourAvailability);

/*
|--------------------------------------------------------------------------
| SINGLE TOUR / CRUD
|--------------------------------------------------------------------------
*/

// UPDATE TOUR
// PUT /api/tours/:id
// Perform the side effect or state update expressed on the following line.
router.put("/:id", validateTourCommand({ allowPast: true }), upload.array("images", 10), updateTour);

// DELETE TOUR
// DELETE /api/tours/:id
// Perform the side effect or state update expressed on the following line.
router.delete("/:id", deleteTour);
// Perform the side effect or state update expressed on the following line.
router.patch("/:id/publication", setPublication);

/*
|--------------------------------------------------------------------------
| TOUR RESOURCE ASSIGNMENT
|--------------------------------------------------------------------------
*/

// PUT /api/tours/:id/assign
// Frontend compatibility alias for assigning guide/driver/vehicle.
// Perform the side effect or state update expressed on the following line.
router.put("/:id/assign", assignTourResourcesSafe);

// PATCH /api/tours/:id/assign-vehicle
// Perform the side effect or state update expressed on the following line.
router.patch("/:id/assign-vehicle", assignTourResourcesSafe);

// PATCH /api/tours/:id/remove-vehicle
// Perform the side effect or state update expressed on the following line.
router.patch("/:id/remove-vehicle", (req, res, next) => { req.body = { ...(req.body || {}), vehicleId: null }; return assignTourResourcesSafe(req, res, next); });

export default router;
