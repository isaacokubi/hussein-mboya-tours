/**
 * Purpose: airport Transfer Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import express from "express";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect, managerOnly } from "../middleware/authMiddleware.js";
// Load ../controllers/airportTransferController.js so this module can use its exported dependencies.
import { listTransfers, getTransfer, createTransfer, updateTransfer, createTransferBooking, updateTransferBooking } from "../controllers/airportTransferController.js";
// Load ../controllers/enhancedAirportTransferBookingController.js so this module can use its exported dependencies.
import { createEnhancedTransferBooking } from "../controllers/enhancedAirportTransferBookingController.js";
// Load ../controllers/hospitalityAdminController.js so this module can use its exported dependencies.
import { listAdminTransfersSafe, listTransferBookingsSafe } from "../controllers/hospitalityAdminController.js";
// Load ../middleware/paymentMutationGuard.js so this module can use its exported dependencies.
import { paymentMutationGuard } from "../middleware/paymentMutationGuard.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();
// Perform the side effect or state update expressed on the following line.
router.get("/", listTransfers);
// Perform the side effect or state update expressed on the following line.
router.get("/admin/catalog", protect, managerOnly, listAdminTransfersSafe);
// Perform the side effect or state update expressed on the following line.
router.post("/admin/catalog", protect, managerOnly, createTransfer);
// Perform the side effect or state update expressed on the following line.
router.patch("/admin/catalog/:id", protect, managerOnly, updateTransfer);
// Perform the side effect or state update expressed on the following line.
router.post("/bookings", protect, createEnhancedTransferBooking);
// Perform the side effect or state update expressed on the following line.
router.get("/bookings", protect, listTransferBookingsSafe);
// Perform the side effect or state update expressed on the following line.
router.patch("/bookings/:id", protect, paymentMutationGuard, updateTransferBooking);
// Perform the side effect or state update expressed on the following line.
router.get("/:id", getTransfer);
export default router;
