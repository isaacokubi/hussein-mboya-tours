/**
 * Purpose: booking Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// server/routes/bookingRoutes.js

// Load express so this module can use its exported dependencies.
import express from "express";
// Load ../controllers/bookingController.js so this module can use its exported dependencies.
import { getBooking, cancelBooking, rescheduleBooking, updateBookingStatus } from "../controllers/bookingController.js";
// Load ../controllers/tenantBookingAdminController.js so this module can use its exported dependencies.
import { getAllBookings, getConfirmedBookings } from "../controllers/tenantBookingAdminController.js";
// Load ../controllers/bookingRetrievalController.js so this module can use its exported dependencies.
import { getBookingById as getBookingByIdOptimized } from "../controllers/bookingRetrievalController.js";
// Load ../controllers/customerDashboardController.js so this module can use its exported dependencies.
import { getCustomerBookings } from "../controllers/customerDashboardController.js";
// Load ../controllers/bookingTravelDateController.js so this module can use its exported dependencies.
import { updateBookingTravelDate } from "../controllers/bookingTravelDateController.js";
// Load ../controllers/customerBookingController.js so this module can use its exported dependencies.
import { createCustomerBooking } from "../controllers/customerBookingController.js";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect, customerOnly, adminOnly, managerOnly } from "../middleware/authMiddleware.js";
// Load ../middleware/requireFullPaymentForTrip.js so this module can use its exported dependencies.
import { requireFullPaymentForTrip } from "../middleware/requireFullPaymentForTrip.js";
// Load ../middleware/validateBookingTravelDate.js so this module can use its exported dependencies.
import { validateBookingTravelDate } from "../middleware/validateBookingTravelDate.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);
// Perform the side effect or state update expressed on the following line.
router.use(protect);
// Perform the side effect or state update expressed on the following line.
router.get("/test", (req, res) => res.status(200).json({ success: true, message: "Booking routes are loaded" }));
// Perform the side effect or state update expressed on the following line.
router.post("/", customerOnly, validateBookingTravelDate, createCustomerBooking);
// Perform the side effect or state update expressed on the following line.
router.get("/my-bookings", customerOnly, getCustomerBookings);
// Perform the side effect or state update expressed on the following line.
router.put("/cancel/:id", customerOnly, cancelBooking);
// Perform the side effect or state update expressed on the following line.
router.put("/reschedule/:id", customerOnly, rescheduleBooking);
// Perform the side effect or state update expressed on the following line.
router.put("/:id/travel-date", customerOnly, updateBookingTravelDate);
// Perform the side effect or state update expressed on the following line.
router.get("/confirmed", managerOnly, getConfirmedBookings);
// Perform the side effect or state update expressed on the following line.
router.get("/admin", managerOnly, getAllBookings);
// Perform the side effect or state update expressed on the following line.
router.get("/admin/all", adminOnly, getAllBookings);
// Perform the side effect or state update expressed on the following line.
router.put("/:id/status", adminOnly, requireFullPaymentForTrip, updateBookingStatus);
// Perform the side effect or state update expressed on the following line.
router.get("/:id", getBookingByIdOptimized);
export default router;
