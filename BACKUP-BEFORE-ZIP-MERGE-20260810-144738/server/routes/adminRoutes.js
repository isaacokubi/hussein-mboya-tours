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

router.get(
  "/bookings/analytics",
  getBookingAnalytics
);

/**
 * PUT /api/admin/bookings/:id/status
 * Update booking status
 */
/**
 * PUT /api/admin/bookings/:id/payment
 * Update payment status
 */
/**
 * PUT /api/admin/bookings/:id/assign
 * Assign guide, driver and vehicle
 */
router.put(
  "/bookings/:id/refund",
  refundBooking
);

router.post(
  "/bookings/:id/refund",
  refundBooking
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
