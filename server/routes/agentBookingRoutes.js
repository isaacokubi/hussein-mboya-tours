/**
 * Purpose: agent Booking Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// server/routes/agentBookingRoutes.js

// Load express so this module can use its exported dependencies.
import express from "express";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";
// Load ../middleware/agentMiddleware.js so this module can use its exported dependencies.
import agentMiddleware from "../middleware/agentMiddleware.js";
// Load ../controllers/agentBookingController.js so this module can use its exported dependencies.
import {
  createBooking,
  getAgentBookings,
  getAgentBooking,
  updateBookingStatus,
  cancelAgentBooking,
} from "../controllers/agentBookingController.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);

// Perform the side effect or state update expressed on the following line.
router.use(protect);
// Perform the side effect or state update expressed on the following line.
router.use(agentMiddleware);

// Perform the side effect or state update expressed on the following line.
router.get("/", getAgentBookings);
// Perform the side effect or state update expressed on the following line.
router.get("/:id", getAgentBooking);
// Perform the side effect or state update expressed on the following line.
router.post("/", createBooking);
// Perform the side effect or state update expressed on the following line.
router.patch("/:id/status", updateBookingStatus);
// Perform the side effect or state update expressed on the following line.
router.patch("/:id/cancel", cancelAgentBooking);
// Perform the side effect or state update expressed on the following line.
router.delete("/:id", cancelAgentBooking);

export default router;
