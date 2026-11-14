/**
 * Purpose: admin Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// server/routes/adminRoutes.js
// Load express so this module can use its exported dependencies.
import express from "express";
// Load ../middleware/tenantMiddleware.js so this module can use its exported dependencies.
import { resolveTenant } from "../middleware/tenantMiddleware.js";

// Load ../controllers/adminDashboardTenantController.js so this module can use its exported dependencies.
import { getUserAnalytics, getBookingAnalytics, getRevenueAnalytics } from "../controllers/adminDashboardTenantController.js";
// Load ../controllers/bookingReportController.js so this module can use its exported dependencies.
import { dailyBookingReport, monthlyBookingReport, tourBookingReport, agentBookingReport } from "../controllers/bookingReportController.js";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect, checkPermission } from "../middleware/authMiddleware.js";
// Load ../middleware/adminMiddleware.js so this module can use its exported dependencies.
import adminMiddleware from "../middleware/adminMiddleware.js";
// Load ../controllers/adminPaymentController.js so this module can use its exported dependencies.
import { refundBooking, processRefund } from "../controllers/adminPaymentController.js";
// Load ../controllers/adminUserController.js so this module can use its exported dependencies.
import { getUsers, updateUserStatus, deleteUser, createStaffAccount } from "../controllers/adminUserController.js";
// Load ../controllers/adminUserProfileController.js so this module can use its exported dependencies.
import { updateUserProfile } from "../controllers/adminUserProfileController.js";
import { getMpesaSandboxBookingCandidates } from "../controllers/mpesaSandboxBookingLookupController.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
router.use(protect);
// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);
// Perform the side effect or state update expressed on the following line.
router.use(adminMiddleware);

/* Dashboard analytics that are not the canonical dashboard metrics endpoint. */
// Perform the side effect or state update expressed on the following line.
router.get("/bookings/analytics", getBookingAnalytics);
// Perform the side effect or state update expressed on the following line.
router.get("/revenue/analytics", getRevenueAnalytics);

/* Read-only candidate lookup; inherits protect, tenant resolution and admin authorization. */
router.get("/bookings/mpesa-sandbox-candidates", getMpesaSandboxBookingCandidates);

/* Booking finance operations */
// Perform the side effect or state update expressed on the following line.
router.put("/bookings/:id/refund", refundBooking);
// Perform the side effect or state update expressed on the following line.
router.post("/bookings/:id/refund", refundBooking);
// Perform the side effect or state update expressed on the following line.
router.put("/refunds/:id/process", processRefund);

/* User-management permission applies only to user-management endpoints. */
// Perform the side effect or state update expressed on the following line.
router.use("/users", checkPermission("user.manage"));
// Perform the side effect or state update expressed on the following line.
router.get("/users", getUsers);
// Perform the side effect or state update expressed on the following line.
router.post("/users/staff", createStaffAccount);
// Perform the side effect or state update expressed on the following line.
router.get("/users/analytics", getUserAnalytics);
// Perform the side effect or state update expressed on the following line.
router.patch("/users/:id/status", updateUserStatus);
// Perform the side effect or state update expressed on the following line.
router.put("/users/:id/status", updateUserStatus);
// Perform the side effect or state update expressed on the following line.
router.put("/users/:id", updateUserProfile);
// Perform the side effect or state update expressed on the following line.
router.delete("/users/:id", deleteUser);

/* Booking reports */
// Perform the side effect or state update expressed on the following line.
router.get("/reports/daily", dailyBookingReport);
// Perform the side effect or state update expressed on the following line.
router.get("/reports/monthly", monthlyBookingReport);
// Perform the side effect or state update expressed on the following line.
router.get("/reports/tours", tourBookingReport);
// Perform the side effect or state update expressed on the following line.
router.get("/reports/agents", agentBookingReport);


export default router;
