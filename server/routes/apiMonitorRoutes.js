import express from "express";
import { getApiMonitor } from "../controllers/apiMonitorController.js";
import { protect, superAdminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// API monitoring is platform-scoped. Authenticate before any tenant resolution
// so a SuperAdmin request cannot inherit a public tenant context.
router.get("/", protect, superAdminOnly, getApiMonitor);

export default router;
