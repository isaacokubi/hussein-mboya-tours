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
} from "../controllers/tourController.js";

import {
  getTourAvailability,
  updateTourAvailability,
} from "../controllers/tourAvailabilityController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

import {
  tourManagerOnly,
} from "../middleware/tourManagerMiddleware.js";

import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

router.get("/", getTours);

router.get("/featured", getFeaturedTours);

router.get("/search", searchTours);

router.get("/slug/:slug", getTourBySlug);

router.get("/:id", getTourById);

/*
|--------------------------------------------------------------------------
| TOUR MANAGER ROUTES
|--------------------------------------------------------------------------
*/

router.use(protect);
router.use(tourManagerOnly);

router.get(
  "/manager",
  getManagerTours
);

router.post(
  "/",
  upload.array("images", 10),
  createTour
);

router.put(
  "/:id",
  upload.array("images", 10),
  updateTour
);

router.delete(
  "/:id",
  deleteTour
);

router.get(
  "/:id/availability",
  getTourAvailability
);

router.patch(
  "/:id/availability",
  updateTourAvailability
);

export default router;