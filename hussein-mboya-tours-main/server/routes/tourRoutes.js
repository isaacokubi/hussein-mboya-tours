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

router.get("/", getTours);
router.get("/featured", getFeaturedTours);
router.get("/search", searchTours);
router.get("/slug/:slug", getTourBySlug);
router.get("/:id/availability", getTourAvailability);

/*
|--------------------------------------------------------------------------
| PROTECTED MANAGER READ ROUTE
|--------------------------------------------------------------------------
|
| This must appear before /:id so /manager is not interpreted as a
| MongoDB tour ID.
|--------------------------------------------------------------------------
*/

router.get(
  "/manager",
  protect,
  tourManagerOnly,
  getManagerTours
);

/*
|--------------------------------------------------------------------------
| PUBLIC SINGLE TOUR
|--------------------------------------------------------------------------
*/

router.get("/:id", getTourById);

/*
|--------------------------------------------------------------------------
| PROTECTED TOUR MANAGER ROUTES
|--------------------------------------------------------------------------
*/

router.use(protect);
router.use(tourManagerOnly);

router.post("/", upload.array("images", 10), createTour);
router.put("/:id", upload.array("images", 10), updateTour);
router.delete("/:id", deleteTour);

/*
|--------------------------------------------------------------------------
| TOUR AVAILABILITY MANAGEMENT
|--------------------------------------------------------------------------
*/

router.patch("/:id/availability", updateTourAvailability);

/*
|--------------------------------------------------------------------------
| RESOURCE ASSIGNMENT
|--------------------------------------------------------------------------
*/

router.put("/:id/assign", assignTourResources);

/*
|--------------------------------------------------------------------------
| VEHICLE COMPATIBILITY ROUTES
|--------------------------------------------------------------------------
*/

router.patch("/:id/assign-vehicle", assignVehicle);
router.patch("/:id/remove-vehicle", removeVehicle);

export default router;
