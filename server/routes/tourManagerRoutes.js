/**
 * Purpose: tour Manager Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import express from "express";
// Load ../middleware/tenantMiddleware.js so this module can use its exported dependencies.
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load ../controllers/tourManagerController.js so this module can use its exported dependencies.
import { getTourManagerDashboard, getTours } from "../controllers/tourManagerController.js";
// Load ../controllers/operationsCopilotController.js so this module can use its exported dependencies.
import { getOperationsCopilotSummary, createOperationsQuoteDraft } from "../controllers/operationsCopilotController.js";
// Load ../controllers/notificationController.js so this module can use its exported dependencies.
import { sendBookingNotification } from "../controllers/notificationController.js";
// Load ../controllers/tourCrudController.js so this module can use its exported dependencies.
import { createTour, updateTour, deleteTour, setPublication } from "../controllers/tourCrudController.js";
// Load ../controllers/tourResourceAssignmentController.js so this module can use its exported dependencies.
import { assignTourResourcesSafe } from "../controllers/tourResourceAssignmentController.js";
// Load ../controllers/tourLifecycleController.js so this module can use its exported dependencies.
import { completeTour, cancelTour, completeBookingAndMaybeRelease, cancelBookingAndUpdateCapacity } from "../controllers/tourLifecycleController.js";
// Load ../controllers/itineraryController.js so this module can use its exported dependencies.
import { createItinerary, getItineraries, getItinerary, updateItinerary, deleteItinerary } from "../controllers/itineraryController.js";
// Load ../controllers/tourAvailabilityController.js so this module can use its exported dependencies.
import { getTourAvailability, updateTourAvailability } from "../controllers/tourAvailabilityController.js";
// Load ../controllers/tourReportController.js so this module can use its exported dependencies.
import { getTourReports } from "../controllers/tourReportController.js";
// Load ../controllers/tenantDirectoryController.js so this module can use its exported dependencies.
import { getTenantGuides, getTenantDrivers, getTenantCustomers, getTenantVehicles } from "../controllers/tenantDirectoryController.js";
// Load ../controllers/tourManagerBookingController.js so this module can use its exported dependencies.
import { getTourManagerBookings } from "../controllers/tourManagerBookingController.js";
// Load ../controllers/calendarReminderController.js so this module can use its exported dependencies.
import { listCalendarReminders, createCalendarReminder, deleteCalendarReminder } from "../controllers/calendarReminderController.js";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect, managerOnly } from "../middleware/authMiddleware.js";
// Load ../middleware/validateFutureTourDate.js so this module can use its exported dependencies.
import validateFutureTourDate from "../middleware/validateFutureTourDate.js";
// Load ../middleware/validateTourAssignmentTenant.js so this module can use its exported dependencies.
import validateTourAssignmentTenant from "../middleware/validateTourAssignmentTenant.js";
// Load ../middleware/validateTourCommand.js so this module can use its exported dependencies.
import validateTourCommand from "../middleware/validateTourCommand.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();
// Perform the side effect or state update expressed on the following line.
router.use(protect);
// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);
// Perform the side effect or state update expressed on the following line.
router.use(managerOnly);

// Perform the side effect or state update expressed on the following line.
router.get("/dashboard", getTourManagerDashboard);
// Read-only operations copilot: profitability and missing-assignment alerts for this tenant.
// Perform the side effect or state update expressed on the following line.
router.get("/copilot/summary", getOperationsCopilotSummary);
// Perform the side effect or state update expressed on the following line.
router.post("/copilot/quote-draft", createOperationsQuoteDraft);
// Perform the side effect or state update expressed on the following line.
router.get("/calendar/reminders", listCalendarReminders);
// Perform the side effect or state update expressed on the following line.
router.post("/calendar/reminders", createCalendarReminder);
// Perform the side effect or state update expressed on the following line.
router.delete("/calendar/reminders/:id", deleteCalendarReminder);
// Perform the side effect or state update expressed on the following line.
router.get("/tours", getTours);
// Perform the side effect or state update expressed on the following line.
router.post("/tours", validateFutureTourDate, validateTourCommand(), createTour);
// Perform the side effect or state update expressed on the following line.
router.put("/tours/:id", validateTourCommand(), updateTour);
// Perform the side effect or state update expressed on the following line.
router.delete("/tours/:id", deleteTour);
// Perform the side effect or state update expressed on the following line.
router.patch("/tours/:id/publication", setPublication);
// Perform the side effect or state update expressed on the following line.
router.put("/tours/:id/assign", validateTourAssignmentTenant, assignTourResourcesSafe);
// Perform the side effect or state update expressed on the following line.
router.patch("/tours/:id/complete", completeTour);
// Perform the side effect or state update expressed on the following line.
router.patch("/tours/:id/cancel", cancelTour);
// Perform the side effect or state update expressed on the following line.
router.put("/assign-resources/:id", validateTourAssignmentTenant, assignTourResourcesSafe);
// Perform the side effect or state update expressed on the following line.
router.post("/assign-guide", (req, res, next) => { req.params.id = req.body?.tourId; next(); }, validateTourAssignmentTenant, assignTourResourcesSafe);

// Perform the side effect or state update expressed on the following line.
router.post("/itineraries", createItinerary);
// Perform the side effect or state update expressed on the following line.
router.get("/itineraries", getItineraries);
// Perform the side effect or state update expressed on the following line.
router.get("/itineraries/:id", getItinerary);
// Perform the side effect or state update expressed on the following line.
router.put("/itineraries/:id", updateItinerary);
// Perform the side effect or state update expressed on the following line.
router.delete("/itineraries/:id", deleteItinerary);

// Perform the side effect or state update expressed on the following line.
router.get("/bookings", getTourManagerBookings);
// Perform the side effect or state update expressed on the following line.
router.patch("/bookings/:id/complete", completeBookingAndMaybeRelease);
// Perform the side effect or state update expressed on the following line.
router.put("/bookings/:id/complete", completeBookingAndMaybeRelease);
// Perform the side effect or state update expressed on the following line.
router.patch("/bookings/:id/cancel", cancelBookingAndUpdateCapacity);
// Managers can explicitly send a tenant-scoped booking/payment reminder through configured channels.
// Perform the side effect or state update expressed on the following line.
router.post("/bookings/:id/notify", sendBookingNotification);
// Perform the side effect or state update expressed on the following line.
router.put("/bookings/:id/cancel", cancelBookingAndUpdateCapacity);
// Perform the side effect or state update expressed on the following line.
router.get("/customers", getTenantCustomers);
// Perform the side effect or state update expressed on the following line.
router.get("/guides", getTenantGuides);
// Perform the side effect or state update expressed on the following line.
router.get("/drivers", getTenantDrivers);
// Perform the side effect or state update expressed on the following line.
router.get("/vehicles", getTenantVehicles);
// Perform the side effect or state update expressed on the following line.
router.get("/reports", getTourReports);
// Perform the side effect or state update expressed on the following line.
router.get("/tours/:id/availability", getTourAvailability);
// Perform the side effect or state update expressed on the following line.
router.put("/tours/:id/availability", updateTourAvailability);

export default router;
