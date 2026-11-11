/**
 * Purpose: tour Report Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// server/routes/tourReportRoutes.js

// Load express so this module can use its exported dependencies.
import express from "express";
// Load ../controllers/tourReportController.js so this module can use its exported dependencies.
import { getTourReports } from "../controllers/tourReportController.js";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";
// Load ../middleware/roleMiddleware.js so this module can use its exported dependencies.
import { roleMiddleware } from "../middleware/roleMiddleware.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);

// Perform the side effect or state update expressed on the following line.
router.use(protect);
// Perform the side effect or state update expressed on the following line.
router.get("/", roleMiddleware("admin", "manager", "super_admin"), getTourReports);

export default router;
