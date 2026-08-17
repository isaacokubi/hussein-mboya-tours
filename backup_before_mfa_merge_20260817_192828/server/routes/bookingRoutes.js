// server/routes/bookingRoutes.js

import express from "express";

import {
  createBooking,
  getMyBookings,
  getBooking,
  cancelBooking,
  rescheduleBooking,
  getAllBookings,
  getConfirmedBookings,
  updateBookingStatus,
} from "../controllers/bookingController.js";

import {
  protect,
  customerOnly,
  adminOnly,
  managerOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Booking routes are loaded",
  });
});

// Customer-owned booking operations. These endpoints must never become
// generic staff endpoints because the controller uses req.user ownership.
router.post("/", customerOnly, createBooking);
router.get("/my-bookings", customerOnly, getMyBookings);
router.put("/cancel/:id", customerOnly, cancelBooking);
router.put("/reschedule/:id", customerOnly, rescheduleBooking);

// Operational booking views.
router.get("/confirmed", managerOnly, getConfirmedBookings);
router.get("/admin", managerOnly, getAllBookings);
router.get("/admin/all", adminOnly, getAllBookings);
router.put("/:id/status", adminOnly, updateBookingStatus);

// Single-booking access is additionally ownership-checked by the controller.
router.get("/:id", getBooking);

export default router;
