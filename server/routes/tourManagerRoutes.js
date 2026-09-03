import express from "express";
import { resolveTenant } from "../middleware/tenantMiddleware.js";
import { getTourManagerDashboard, createTour, getTours, updateTour, deleteTour, assignTourGuide, completeBooking, cancelBooking } from "../controllers/tourManagerController.js";
import { createItinerary, getItineraries, getItinerary, updateItinerary, deleteItinerary } from "../controllers/itineraryController.js";
import { getTourAvailability, updateTourAvailability } from "../controllers/tourAvailabilityController.js";
import { getBookings } from "../controllers/bookingController.js";
import { getTourReports } from "../controllers/tourReportController.js";
import { getTenantGuides, getTenantCustomers, getTenantVehicles } from "../controllers/tenantDirectoryController.js";
import { protect, managerOnly } from "../middleware/authMiddleware.js";
import validateFutureTourDate from "../middleware/validateFutureTourDate.js";
import validateTourAssignmentTenant from "../middleware/validateTourAssignmentTenant.js";

const router = express.Router();
router.use(protect);
router.use(resolveTenant);
router.use(managerOnly);

router.get("/dashboard", getTourManagerDashboard);
router.get("/tours", getTours);
router.post("/tours", validateFutureTourDate, createTour);
router.put("/tours/:id", updateTour);
router.delete("/tours/:id", deleteTour);
router.post("/assign-guide", (req, res, next) => { req.params.id = req.body?.tourId; next(); }, validateTourAssignmentTenant, assignTourGuide);

router.post("/itineraries", createItinerary);
router.get("/itineraries", getItineraries);
router.get("/itineraries/:id", getItinerary);
router.put("/itineraries/:id", updateItinerary);
router.delete("/itineraries/:id", deleteItinerary);

router.get("/bookings", getBookings);
router.patch("/bookings/:id/complete", completeBooking);
router.put("/bookings/:id/complete", completeBooking);
router.patch("/bookings/:id/cancel", cancelBooking);
router.put("/bookings/:id/cancel", cancelBooking);
router.get("/customers", getTenantCustomers);
router.get("/guides", getTenantGuides);
router.get("/vehicles", getTenantVehicles);
router.get("/reports", getTourReports);
router.get("/tours/:id/availability", getTourAvailability);
router.put("/tours/:id/availability", updateTourAvailability);

export default router;
