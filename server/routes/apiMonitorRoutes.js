import express from "express";
import { getApiMonitor } from "../controllers/apiMonitorController.js";
import { protect, superAdminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// API monitoring exposes operational telemetry and must never be public.
router.get("/", protect, superAdminOnly, getApiMonitor);

export default router;
