import express from "express";
import { protect, managerOnly } from "../middleware/authMiddleware.js";
import { listTransfers, getTransfer, createTransfer, updateTransfer, createTransferBooking, updateTransferBooking } from "../controllers/airportTransferController.js";
import { createEnhancedTransferBooking } from "../controllers/enhancedAirportTransferBookingController.js";
import { listAdminTransfersSafe, listTransferBookingsSafe } from "../controllers/hospitalityAdminController.js";
import { paymentMutationGuard } from "../middleware/paymentMutationGuard.js";

const router = express.Router();
router.get("/", listTransfers);
router.get("/admin/catalog", protect, managerOnly, listAdminTransfersSafe);
router.post("/admin/catalog", protect, managerOnly, createTransfer);
router.patch("/admin/catalog/:id", protect, managerOnly, updateTransfer);
router.post("/bookings", protect, createEnhancedTransferBooking);
router.get("/bookings", protect, listTransferBookingsSafe);
router.patch("/bookings/:id", protect, paymentMutationGuard, updateTransferBooking);
router.get("/:id", getTransfer);
export default router;
