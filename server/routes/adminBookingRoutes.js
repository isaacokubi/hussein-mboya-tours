import { resolveTenant } from "../middleware/tenantMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";
import express from "express";
import { getBookings, getBooking, updateBookingStatus, assignResources, updatePaymentStatus, getBookingTimeline, downloadBookingInvoice, sendBookingNotification } from "../controllers/bookingAdminController.js";
import { protect } from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import { guardBookingResources } from "../middleware/resourceTenantGuard.js";

const router = express.Router();
router.use(resolveTenant);
router.use(protect);
router.use(adminMiddleware);
router.use(authorize("booking.manage"));

router.get("/", getBookings);
router.get("/:id", getBooking);
router.put("/:id/status", updateBookingStatus);
router.put("/:id/assign", guardBookingResources, assignResources);
router.put("/:id/payment", updatePaymentStatus);
router.get("/:id/timeline", getBookingTimeline);
router.get("/:id/invoice", downloadBookingInvoice);
router.post("/:id/notify", sendBookingNotification);

export default router;
