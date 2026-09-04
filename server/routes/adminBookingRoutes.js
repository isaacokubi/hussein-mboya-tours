import express from "express";

import { resolveTenant } from "../middleware/tenantMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import { guardBookingResources } from "../middleware/resourceTenantGuard.js";

import {
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  assignResources,
  updatePaymentStatus,
  getBookingTimeline,
  downloadBookingInvoice,
} from "../controllers/adminBookingController.js";

import { sendBookingNotification } from "../controllers/notificationController.js";

const router = express.Router();

router.use(resolveTenant);
router.use(protect);
router.use(adminMiddleware);
router.use(authorize("booking.manage"));

router.get("/", getAllBookings);
router.get("/:id", getBookingById);
router.put("/:id/status", updateBookingStatus);
router.put("/:id/assign", guardBookingResources, assignResources);
router.put("/:id/payment", updatePaymentStatus);
router.get("/:id/timeline", getBookingTimeline);
router.get("/:id/invoice", downloadBookingInvoice);
router.post("/:id/notify", sendBookingNotification);

export default router;
