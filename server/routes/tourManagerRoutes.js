// server/routes/tourManagerRoutes.js

import express from "express";

import {
  getTourManagerDashboard,
  createTour,
  getTours,
  updateTour,
  deleteTour,
  assignTourGuide,
} from "../controllers/tourManagerController.js";

import {
  createItinerary,
  getItineraries,
  getItinerary,
  updateItinerary,
  deleteItinerary,
} from "../controllers/itineraryController.js";

import {
  getTourAvailability,
  updateTourAvailability,
} from "../controllers/tourAvailabilityController.js";

import {
  getBookings,
} from "../controllers/bookingController.js";

import {
  getCustomers,
} from "../controllers/customerController.js";

import {
  getGuides,
} from "../controllers/userController.js";

import {
  getTourReports,
} from "../controllers/tourReportController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

import {
  roleMiddleware,
} from "../middleware/roleMiddleware.js";

const router = express.Router();

const managerRoles = [
  "admin",
  "tour_manager",
  "tourmanager",
  "manager",
];

router.use(protect);
router.use(roleMiddleware(...managerRoles));

/*
|--------------------------------------------------------------------------
| DASHBOARD
|--------------------------------------------------------------------------
*/

router.get("/dashboard", getTourManagerDashboard);

/*
|--------------------------------------------------------------------------
| TOURS
|--------------------------------------------------------------------------
*/

router.get("/tours", getTours);
router.post("/tours", createTour);
router.put("/tours/:id", updateTour);
router.delete("/tours/:id", deleteTour);

/*
|--------------------------------------------------------------------------
| GUIDE / RESOURCE ASSIGNMENT
|--------------------------------------------------------------------------
|
| The audited frontend submits { tourId, guideId } to this endpoint.
|--------------------------------------------------------------------------
*/

router.put("/assign-guide", assignTourGuide);

/*
|--------------------------------------------------------------------------
| ITINERARIES
|--------------------------------------------------------------------------
*/

router.post("/itineraries", createItinerary);
router.get("/itineraries", getItineraries);
router.get("/itineraries/:id", getItinerary);
router.put("/itineraries/:id", updateItinerary);
router.delete("/itineraries/:id", deleteItinerary);

/*
|--------------------------------------------------------------------------
| BOOKINGS / CUSTOMERS / GUIDES
|--------------------------------------------------------------------------
*/

router.get("/bookings", getBookings);
router.get("/customers", getCustomers);
router.get("/guides", getGuides);

/*
|--------------------------------------------------------------------------
| REPORTS
|--------------------------------------------------------------------------
*/

router.get("/reports", getTourReports);

/*
|--------------------------------------------------------------------------
| TOUR AVAILABILITY
|--------------------------------------------------------------------------
*/

router.get("/tours/:id/availability", getTourAvailability);
router.put("/tours/:id/availability", updateTourAvailability);

export default router;
