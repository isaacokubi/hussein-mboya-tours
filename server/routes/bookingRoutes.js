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
} from "../middleware/authMiddleware.js";

import {
  roleMiddleware,
} from "../middleware/roleMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| AUTHENTICATION
|--------------------------------------------------------------------------
*/

router.use(protect);

/*
|--------------------------------------------------------------------------
| TEST
|--------------------------------------------------------------------------
*/

router.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Booking routes are loaded",
  });
});

/*
|--------------------------------------------------------------------------
| CUSTOMER
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  createBooking
);

router.get(
  "/my-bookings",
  getMyBookings
);

router.put(
  "/cancel/:id",
  cancelBooking
);

router.put(
  "/reschedule/:id",
  rescheduleBooking
);

/*
|--------------------------------------------------------------------------
| ADMIN / TOUR MANAGER
|--------------------------------------------------------------------------
*/

router.get(
  "/confirmed",
  roleMiddleware("admin", "tour_manager", "tourmanager", "manager"),
  getConfirmedBookings
);

router.get(
  "/admin",
  roleMiddleware("admin", "tour_manager", "tourmanager", "manager"),
  getAllBookings
);

router.get(
  "/admin/all",
  roleMiddleware(["admin"]),
  getAllBookings
);

router.put(
  "/:id/status",
  roleMiddleware(["admin"]),
  updateBookingStatus
);

/*
|--------------------------------------------------------------------------
| SINGLE BOOKING
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  getBooking
);

export default router;