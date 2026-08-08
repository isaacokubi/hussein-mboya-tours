// server/routes/agentBookingRoutes.js

import express from "express";

import {
  protect,
} from "../middleware/authMiddleware.js";

import {
  agentMiddleware,
} from "../middleware/agentMiddleware.js";

import {
  createBooking,
  getAgentBookings,
  getAgentBooking,
  updateBookingStatus,
  cancelAgentBooking,
} from "../controllers/agentBookingController.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| AGENT AUTHORIZATION
|--------------------------------------------------------------------------
|
| All routes require:
| - Valid JWT
| - Active account
| - Approved agent
|
|--------------------------------------------------------------------------
*/

router.use(protect);
router.use(agentMiddleware);

/*
|--------------------------------------------------------------------------
| BOOKINGS
|--------------------------------------------------------------------------
*/

/**
 * GET /api/agent/bookings
 * Get all bookings created by the authenticated agent.
 */
router.get(
  "/",
  getAgentBookings
);

/**
 * GET /api/agent/bookings/:id
 * Get a single booking.
 */
router.get(
  "/:id",
  getAgentBooking
);

/**
 * POST /api/agent/bookings
 * Create a new booking.
 */
router.post(
  "/",
  createBooking
);

/**
 * PATCH /api/agent/bookings/:id/status
 * Update booking status.
 */
router.patch(
  "/:id/status",
  updateBookingStatus
);

/**
 * PATCH /api/agent/bookings/:id/cancel
 * Cancel a booking.
 */
router.patch(
  "/:id/cancel",
  cancelAgentBooking
);

export default router;