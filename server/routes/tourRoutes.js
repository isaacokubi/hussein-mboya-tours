import express from "express";

// Controllers

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
  assignGuide,
  assignVehicle,
  removeVehicle,
  getReports,
} from "../controllers/tourController.js";

// Availability Controller

import {
  getTourAvailability,
  updateTourAvailability,
} from "../controllers/tourAvailabilityController.js";

// Authentication

import { protect } from "../middleware/authMiddleware.js";

// Tour Manager Authorization

import { tourManagerOnly } from "../middleware/tourManagerMiddleware.js";

// Image Upload
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| PUBLIC TOUR ROUTES
|--------------------------------------------------------------------------
*/

// Get all tours

router.get(
  "/",

  getTours,
);

// Featured tours homepage

router.get(
  "/featured",

  getFeaturedTours,
);

// Search tours

router.get(
  "/search",

  searchTours,
);

// SEO slug page

router.get(
  "/slug/:slug",

  getTourBySlug,
);

/*
|--------------------------------------------------------------------------
| TOUR MANAGER ROUTES
|--------------------------------------------------------------------------
*/

// Get manager tours

router.get(
  "/manager",

  protect,

  tourManagerOnly,

  getManagerTours,
);

// Reports

router.get(
  "/reports",

  protect,

  tourManagerOnly,

  getReports,
);

/*
|--------------------------------------------------------------------------
| GET SINGLE TOUR
|--------------------------------------------------------------------------
|
| Keep this AFTER:
|
| /featured
| /search
| /slug
| /reports
|
| Otherwise Express treats them as IDs
|
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",

  getTourById,
);

/*
|--------------------------------------------------------------------------
| CREATE TOUR WITH CLOUDINARY IMAGES
|--------------------------------------------------------------------------
*/

router.post(
  "/",

  protect,

  tourManagerOnly,

  upload.array("images", 10),

  createTour,
);

/*
|--------------------------------------------------------------------------
| UPDATE TOUR
|--------------------------------------------------------------------------
*/

router.put(
  "/:id",

  protect,

  tourManagerOnly,

  upload.array("images", 10),

  updateTour,
);

/*
|--------------------------------------------------------------------------
| DELETE TOUR
|--------------------------------------------------------------------------
*/

router.delete(
  "/:id",

  protect,

  tourManagerOnly,

  deleteTour,
);

/*
|--------------------------------------------------------------------------
| TOUR AVAILABILITY
|--------------------------------------------------------------------------
*/

router.get(
  "/:id/availability",

  protect,

  tourManagerOnly,

  getTourAvailability,
);

router.patch(
  "/:id/availability",

  protect,

  tourManagerOnly,

  updateTourAvailability,
);

/*
|--------------------------------------------------------------------------
| ASSIGN GUIDE
|--------------------------------------------------------------------------
*/

router.patch(
  "/:id/guide",

  protect,

  tourManagerOnly,

  assignGuide,
);

/*
|--------------------------------------------------------------------------
| ASSIGN VEHICLE
|--------------------------------------------------------------------------
*/

router.patch(
  "/:id/vehicle",

  protect,

  tourManagerOnly,

  assignVehicle,
);

/*
|--------------------------------------------------------------------------
| REMOVE VEHICLE
|--------------------------------------------------------------------------
*/

router.patch(
  "/:id/remove-vehicle",

  protect,

  tourManagerOnly,

  removeVehicle,
);

export default router;
