/**
 * Purpose: api Monitor Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import express from "express";
// Load ../controllers/apiMonitorController.js so this module can use its exported dependencies.
import { getApiMonitor } from "../controllers/apiMonitorController.js";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect, superAdminOnly } from "../middleware/authMiddleware.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// API monitoring is platform-scoped. Authenticate before any tenant resolution
// so a SuperAdmin request cannot inherit a public tenant context.
// Perform the side effect or state update expressed on the following line.
router.get("/", protect, superAdminOnly, getApiMonitor);

export default router;
