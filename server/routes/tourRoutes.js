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


// Upload
import upload from "../middleware/uploadMiddleware.js";


const router = express.Router();


// ============================================================
// PUBLIC TOUR ROUTES
// ============================================================


router.get(
  "/",
  getTours
);


router.get(
  "/featured",
  getFeaturedTours
);


router.get(
  "/search",
  searchTours
);


router.get(
  "/slug/:slug",
  getTourBySlug
);



// ============================================================
// TOUR MANAGER ROUTES
// ============================================================


router.get(
  "/manager",
  protect,
  tourManagerOnly,
  getManagerTours
);



// ============================================================
// SINGLE TOUR
// ============================================================


router.get(
  "/:id",
  getTourById
);



// ============================================================
// CREATE TOUR
// ============================================================


router.post(
  "/",
  protect,
  tourManagerOnly,
  upload.array("images",10),
  createTour
);



// ============================================================
// UPDATE TOUR
// ============================================================


router.put(
  "/:id",
  protect,
  tourManagerOnly,
  upload.array("images",10),
  updateTour
);



// ============================================================
// DELETE TOUR
// ============================================================


router.delete(
  "/:id",
  protect,
  tourManagerOnly,
  deleteTour
);



// ============================================================
// AVAILABILITY
// ============================================================


router.get(
  "/:id/availability",
  protect,
  tourManagerOnly,
  getTourAvailability
);


router.patch(
  "/:id/availability",
  protect,
  tourManagerOnly,
  updateTourAvailability
);


export default router;