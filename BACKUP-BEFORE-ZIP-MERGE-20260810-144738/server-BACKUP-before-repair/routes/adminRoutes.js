// server/routes/adminRoutes.js

import express from "express";


import {
getFinanceStats
} from "../controllers/financeController.js";

import {
getAgents,
getAgentById,
approveAgent,
updateAgentStatus
} from "../controllers/adminAgentController.js";











import {
  sendBookingNotification
} from "../controllers/notificationController.js";

import {
  getDashboardStats,
  getUserAnalytics,
  getBookingAnalytics,
  getRevenueAnalytics,
} from "../controllers/adminController.js";



import {
dailyBookingReport,
monthlyBookingReport,
tourBookingReport,
agentBookingReport

} from "../controllers/bookingReportController.js";

import {
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  updatePaymentStatus,
  assignResources,
  getBookingTimeline,
  downloadBookingInvoice,
} from "../controllers/adminBookingController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

import adminMiddleware from "../middleware/adminMiddleware.js";

import {
  exportBookings,
} from "../controllers/reportController.js";

import {
  refundPayment,
  refundBooking,
  processRefund,
} from "../controllers/adminPaymentController.js";

import {
  getUsers,
  updateUserStatus,
  deleteUser
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
  "/bookings/analytics",
  getBookingAnalytics
);

router.get(
  "/bookings/export",
  exportBookings
);

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
router.get(
  "/bookings/:id/timeline",
  getBookingTimeline
);


router.get(
  "/bookings/:id/invoice",
  downloadBookingInvoice
);





router.put(
  "/bookings/:id/refund",
  refundBooking
);

router.post(
  "/bookings/:id/refund",
  refundBooking
);

router.post(
  "/bookings/:id/notify",
  sendBookingNotification
);

router.put(
  "/bookings/:id/assign",
  assignResources
);


router.put(
  "/refunds/:id/process",
  processRefund
);

/*
|--------------------------------------------------------------------------
| USERS
|--------------------------------------------------------------------------
*/



/**
 * DELETE /api/admin/users/:id
 * Delete user
 */

router.delete(
  "/users/:id",
  deleteUser
);


router.get(
  "/users",
  getUsers
);

router.get(
  "/users/analytics",
  getUserAnalytics
);


router.put(
  "/users/:id/status",
  updateUserStatus
);

router.patch(
  "/users/:id/status",
  updateUserStatus
);




router.get(
  "/revenue/analytics",
  getRevenueAnalytics
);

/*
|--------------------------------------------------------------------------
| BOOKING REPORTS
|--------------------------------------------------------------------------
*/


router.get(
"/reports/daily",
dailyBookingReport
);


router.get(
"/reports/monthly",
monthlyBookingReport
);


router.get(
"/reports/tours",
tourBookingReport
);


router.get(
"/reports/agents",
agentBookingReport
);





router.get(
  "/agents",
  getAgents
);


router.get(
  "/agents/:id",
  getAgentById
);


router.put(
  "/agents/:id/approve",
  approveAgent
);


router.put(
  "/agents/:id/status",
  updateAgentStatus
);


export default router;
