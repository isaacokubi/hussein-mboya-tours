// server/routes/agentBookingRoutes.js

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import agentMiddleware from "../middleware/agentMiddleware.js";
import {
  createBooking,
  getAgentBookings,
  getAgentBooking,
  updateBookingStatus,
  cancelAgentBooking,
} from "../controllers/agentBookingController.js";

const router = express.Router();

router.use(protect);
router.use(agentMiddleware);

router.get("/", getAgentBookings);
router.get("/:id", getAgentBooking);
router.post("/", createBooking);
router.patch("/:id/status", updateBookingStatus);
router.patch("/:id/cancel", cancelAgentBooking);
router.delete("/:id", cancelAgentBooking);

export default router;
