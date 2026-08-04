// server/routes/adminRoutes.js

import express from "express";

import {
  getDashboardStats,
} from "../controllers/adminController.js";

import {
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  updatePaymentStatus,
  assignBookingResources,
} from "../controllers/adminBookingController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

import adminMiddleware from "../middleware/adminMiddleware.js";

import {
  getUsers,
  updateUserStatus
} from "../controllers/adminUserController.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| ADMIN AUTHORIZATION
|--------------------------------------------------------------------------
|
| All routes require:
| - Valid JWT
| - Active account
| - Admin privileges
|
|--------------------------------------------------------------------------
*/

router.use(protect);
router.use(adminMiddleware);

/*
|--------------------------------------------------------------------------
| DASHBOARD
|--------------------------------------------------------------------------
*/

/**
 * GET /api/admin/dashboard
 * Admin dashboard statistics
 */
router.get(
  "/dashboard",
  getDashboardStats
);

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
  "/bookings",
  getAllBookings
);

/**
 * GET /api/admin/bookings/:id
 * Get booking details
 */
router.get(
  "/bookings/:id",
  getBookingById
);

/**
 * PUT /api/admin/bookings/:id/status
 * Update booking status
 */
router.put(
  "/bookings/:id/status",
  updateBookingStatus
);

/**
 * PUT /api/admin/bookings/:id/payment
 * Update payment status
 */
router.put(
  "/bookings/:id/payment",
  updatePaymentStatus
);

/**
 * PUT /api/admin/bookings/:id/assign
 * Assign guide, driver and vehicle
 */
router.put(
  "/bookings/:id/assign",
  assignBookingResources
);


/*
|--------------------------------------------------------------------------
| USERS
|--------------------------------------------------------------------------
*/

router.get(
  "/users",
  getUsers
);


router.put(
  "/users/:id/status",
  updateUserStatus
);


export default router;
