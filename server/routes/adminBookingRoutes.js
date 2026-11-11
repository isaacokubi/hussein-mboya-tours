/**
 * Purpose: admin Booking Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load ../middleware/permissionMiddleware.js so this module can use its exported dependencies.
import { authorize } from "../middleware/permissionMiddleware.js";
// Load express so this module can use its exported dependencies.
import express from "express";
// Load ../controllers/tenantBookingAdminController.js so this module can use its exported dependencies.
import { getBookings, getBooking } from "../controllers/tenantBookingAdminController.js";
// Load ../controllers/bookingAdminController.js so this module can use its exported dependencies.
import { updateBookingStatus, assignResources, updatePaymentStatus, getBookingTimeline, downloadBookingInvoice, sendBookingNotification } from "../controllers/bookingAdminController.js";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";
// Load ../middleware/adminMiddleware.js so this module can use its exported dependencies.
import adminMiddleware from "../middleware/adminMiddleware.js";
// Load ../middleware/resourceTenantGuard.js so this module can use its exported dependencies.
import { guardBookingResources } from "../middleware/resourceTenantGuard.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();
// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);
// Perform the side effect or state update expressed on the following line.
router.use(protect);
// Perform the side effect or state update expressed on the following line.
router.use(adminMiddleware);
// Perform the side effect or state update expressed on the following line.
router.use(authorize("booking.manage"));

// Both list and detail reads are explicitly tenant-scoped.
// Perform the side effect or state update expressed on the following line.
router.get("/", getBookings);
// Perform the side effect or state update expressed on the following line.
router.get("/:id", getBooking);
// Perform the side effect or state update expressed on the following line.
router.put("/:id/status", updateBookingStatus);
// Perform the side effect or state update expressed on the following line.
router.put("/:id/assign", guardBookingResources, assignResources);
// Perform the side effect or state update expressed on the following line.
router.put("/:id/payment", updatePaymentStatus);
// Perform the side effect or state update expressed on the following line.
router.get("/:id/timeline", getBookingTimeline);
// Perform the side effect or state update expressed on the following line.
router.get("/:id/invoice", downloadBookingInvoice);
// Perform the side effect or state update expressed on the following line.
router.post("/:id/notify", sendBookingNotification);

export default router;
