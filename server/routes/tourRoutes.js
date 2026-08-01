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


import {
  protect,
} from "../middleware/authMiddleware.js";


import tourManagerOnly 
from "../middleware/tourManagerMiddleware.js";


import upload 
from "../middleware/uploadMiddleware.js";



const router = express.Router();





/*
|--------------------------------------------------------------------------
| PUBLIC TOUR ROUTES
|--------------------------------------------------------------------------
*/


// GET ALL TOURS
// /api/tours
router.get(
  "/",
  getTours
);



// FEATURED TOURS
// /api/tours/featured
router.get(
  "/featured",
  getFeaturedTours
);



// SEARCH TOURS
// /api/tours/search
router.get(
  "/search",
  searchTours
);



// GET TOUR BY SLUG
// /api/tours/slug/:slug
router.get(
  "/slug/:slug",
  getTourBySlug
);







/*
|--------------------------------------------------------------------------
| TOUR AVAILABILITY PUBLIC CHECK
|--------------------------------------------------------------------------
*/


// IMPORTANT:
// This must come BEFORE "/:id"
// Otherwise Express treats "availability" as an id


router.get(
  "/:id/availability",
  getTourAvailability
);








/*
|--------------------------------------------------------------------------
| GET SINGLE TOUR
|--------------------------------------------------------------------------
*/


// /api/tours/:id

router.get(
  "/:id",
  getTourById
);









/*
|--------------------------------------------------------------------------
| PROTECTED TOUR MANAGER ROUTES
|--------------------------------------------------------------------------
*/


router.use(protect);

router.use(tourManagerOnly);







// GET MANAGER TOURS
// /api/tours/manager


router.get(
  "/manager",
  getManagerTours
);







// CREATE TOUR


router.post(
  "/",
  upload.array(
    "images",
    10
  ),
  createTour
);








// UPDATE TOUR


router.put(
  "/:id",
  upload.array(
    "images",
    10
  ),
  updateTour
);









// DELETE TOUR


router.delete(
  "/:id",
  deleteTour
);









/*
|--------------------------------------------------------------------------
| TOUR AVAILABILITY MANAGEMENT
|--------------------------------------------------------------------------
*/


router.patch(
  "/:id/availability",
  updateTourAvailability
);








/*
|--------------------------------------------------------------------------
| VEHICLE ASSIGNMENT
|--------------------------------------------------------------------------
*/


router.patch(
  "/:id/assign-vehicle",
  assignVehicle
);



router.patch(
  "/:id/remove-vehicle",
  removeVehicle
);







export default router;