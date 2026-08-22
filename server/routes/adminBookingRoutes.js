import { authorize } from "../middleware/permissionMiddleware.js";
// server/routes/bookingAdminRoutes.js

import express from "express";

import {
  getBookings,
  getBooking,
  updateBookingStatus,
  assignResources,
  updatePaymentStatus,
  getBookingTimeline,
  downloadBookingInvoice,
  sendBookingNotification,
} from "../controllers/bookingAdminController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| ADMIN AUTHORIZATION
|--------------------------------------------------------------------------
|
| All booking administration routes require:
| - Valid JWT
| - Active account
| - Admin privileges
|
|--------------------------------------------------------------------------
*/

router.use(protect);
router.use(adminMiddleware);

router.use(authorize("booking.manage"));

/*
|--------------------------------------------------------------------------
| BOOKINGS
|--------------------------------------------------------------------------
*/

/**
 * GET /api/admin/bookings
 * Get all bookings
 */
router.get(
  "/",
  getBookings
);

/**
 * GET /api/admin/bookings/:id
 * Get booking details
 */
router.get(
  "/:id",
  getBooking
);

/**
 * PUT /api/admin/bookings/:id/status
 * Update booking status
 *
 * Allowed statuses:
 * - pending
 * - confirmed
 * - assigned
 * - ongoing
 * - completed
 * - cancelled
 */
router.put(
  "/:id/status",
  updateBookingStatus
);

/**
 * PUT /api/admin/bookings/:id/assign
 * Assign:
 * - Guide
 * - Driver
 * - Vehicle
 */
router.put(
  "/:id/assign",
  assignResources
);

/**
 * PUT /api/admin/bookings/:id/payment
 * Update payment status
 *
 * Allowed statuses:
 * - pending
 * - partial
 * - paid
 * - failed
 * - refunded
 */
router.put(
  "/:id/payment",
  updatePaymentStatus
);

router.get(
  "/:id/timeline",
  getBookingTimeline
);

router.get(
  "/:id/invoice",
  downloadBookingInvoice
);

router.post(
  "/:id/notify",
  sendBookingNotification
);

export default router;