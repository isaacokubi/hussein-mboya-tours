// server/routes/bookingRoutes.js

import express from "express";
import { getMyBookings, getBooking, cancelBooking, rescheduleBooking, getAllBookings, getConfirmedBookings, updateBookingStatus } from "../controllers/bookingController.js";
import { createCustomerBooking } from "../controllers/customerBookingController.js";
import { protect, customerOnly, adminOnly, managerOnly } from "../middleware/authMiddleware.js";
import { requireFullPaymentForTrip } from "../middleware/requireFullPaymentForTrip.js";

const router = express.Router();
router.use(protect);
router.get("/test", (req, res) => res.status(200).json({ success: true, message: "Booking routes are loaded" }));
router.post("/", customerOnly, createCustomerBooking);
router.get("/my-bookings", customerOnly, getMyBookings);
router.put("/cancel/:id", customerOnly, cancelBooking);
router.put("/reschedule/:id", customerOnly, rescheduleBooking);
router.get("/confirmed", managerOnly, getConfirmedBookings);
router.get("/admin", managerOnly, getAllBookings);
router.get("/admin/all", adminOnly, getAllBookings);
router.put("/:id/status", adminOnly, requireFullPaymentForTrip, updateBookingStatus);
router.get("/:id", getBooking);
export default router;
