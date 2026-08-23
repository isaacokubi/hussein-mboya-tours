// server/routes/adminRoutes.js
import express from "express";
import { resolveTenant } from "../middleware/tenantMiddleware.js";

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
} from "../controllers/adminDashboardTenantController.js";

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

router.use(protect);
router.use(resolveTenant);
router.use(adminMiddleware);

/* Dashboard and analytics */
router.get("/dashboard", getDashboardStats);
router.get("/bookings/analytics", getBookingAnalytics);
router.get("/revenue/analytics", getRevenueAnalytics);

/* Booking finance operations */
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

/* Booking reports */
router.get("/reports/daily", dailyBookingReport);
router.get("/reports/monthly", monthlyBookingReport);
router.get("/reports/tours", tourBookingReport);
router.get("/reports/agents", agentBookingReport);

/* Agent administration */
router.get("/agents", getAgents);
router.get("/agents/:id", getAgentById);
router.put("/agents/:id/approve", approveAgent);
router.put("/agents/:id/status", updateAgentStatus);

export default router;
