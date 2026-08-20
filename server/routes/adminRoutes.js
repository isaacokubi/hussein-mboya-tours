// server/routes/adminRoutes.js
import express from "express";
import Booking from "../models/Booking.js";

import {
  getAgents,
  getAgentById,
  approveAgent,
  updateAgentStatus,
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
  agentBookingReport,
} from "../controllers/bookingReportController.js";

import { protect, checkPermission } from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

import {
  refundBooking,
  processRefund,
} from "../controllers/adminPaymentController.js";

import {
  getUsers,
  updateUserStatus,
  deleteUser,
  createStaffAccount,
} from "../controllers/adminUserController.js";

const router = express.Router();

/* Every admin endpoint requires an authenticated active Admin/SuperAdmin. */
router.use(protect);
router.use(adminMiddleware);

/* Dashboard must not depend on the user-management permission. */
router.get("/dashboard", getDashboardStats);
router.get("/bookings/analytics", getBookingAnalytics);
router.get("/revenue/analytics", getRevenueAnalytics);

/*
 * Finance overview.
 * Keep this behind the canonical admin middleware instead of a Role-document
 * permission so recreating an Admin/SuperAdmin account cannot produce the
 * misleading 403 seen by the dashboard.
 */
router.get("/finance", async (req, res) => {
  try {
    const rows = await Booking.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      {
        $group: {
          _id: null,
          revenue: {
            $sum: {
              $cond: [
                { $in: ["$paymentStatus", ["paid", "partial"]] },
                { $ifNull: ["$totalAmount", 0] },
                0,
              ],
            },
          },
          paidRevenue: {
            $sum: {
              $cond: [
                { $in: ["$paymentStatus", ["paid", "partial"]] },
                { $ifNull: ["$depositAmount", 0] },
                0,
              ],
            },
          },
          refundedAmount: { $sum: { $ifNull: ["$refundAmount", 0] } },
          paidBookings: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, 1, 0] },
          },
          pendingPayments: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "pending"] }, 1, 0] },
          },
          failedPayments: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "failed"] }, 1, 0] },
          },
        },
      },
    ]);

    const stats = rows[0] || {
      revenue: 0,
      paidRevenue: 0,
      refundedAmount: 0,
      paidBookings: 0,
      pendingPayments: 0,
      failedPayments: 0,
    };

    stats.netRevenue = Math.max(0, Number(stats.paidRevenue || 0) - Number(stats.refundedAmount || 0));
    return res.json({ success: true, data: stats });
  } catch (error) {
    console.error("Admin finance overview error:", error);
    return res.status(500).json({ success: false, message: "Unable to load finance data" });
  }
});

/* Booking finance operations. */
router.put("/bookings/:id/refund", refundBooking);
router.post("/bookings/:id/refund", refundBooking);
router.put("/refunds/:id/process", processRefund);

/* User-management permission applies only to user-management endpoints. */
router.use("/users", checkPermission("user.manage"));
router.get("/users", getUsers);
router.post("/users/staff", createStaffAccount);
router.get("/users/analytics", getUserAnalytics);
router.patch("/users/:id/status", updateUserStatus);
router.put("/users/:id/status", updateUserStatus);
router.delete("/users/:id", deleteUser);

/* Booking reports. */
router.get("/reports/daily", dailyBookingReport);
router.get("/reports/monthly", monthlyBookingReport);
router.get("/reports/tours", tourBookingReport);
router.get("/reports/agents", agentBookingReport);

/* Agent administration. */
router.get("/agents", getAgents);
router.get("/agents/:id", getAgentById);
router.put("/agents/:id/approve", approveAgent);
router.put("/agents/:id/status", updateAgentStatus);

export default router;
