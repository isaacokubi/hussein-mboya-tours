/**
 * Purpose: guide Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// server/routes/guideRoutes.js
// Load express so this module can use its exported dependencies.
import express from "express";
// Load ../middleware/tenantMiddleware.js so this module can use its exported dependencies.
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load ../controllers/guideController.js so this module can use its exported dependencies.
import {
  guideDashboard,
  getAssignedTours,
  getTourDetails,
  getTourGuests,
  updateTourStatus,
  submitTourReport,
} from "../controllers/guideController.js";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect, guideOnly } from "../middleware/authMiddleware.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Authenticate before resolving tenant context so guide requests are always
// scoped to the tenant belonging to the authenticated account.
// Perform the side effect or state update expressed on the following line.
router.use(protect);
// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);
// Perform the side effect or state update expressed on the following line.
router.use(guideOnly);

// Perform the side effect or state update expressed on the following line.
router.get("/dashboard", guideDashboard);
// Perform the side effect or state update expressed on the following line.
router.get("/assigned-tours", getAssignedTours);
// Perform the side effect or state update expressed on the following line.
router.get("/tours/:id", getTourDetails);
// Perform the side effect or state update expressed on the following line.
router.get("/tours/:id/guests", getTourGuests);
// Perform the side effect or state update expressed on the following line.
router.put("/tours/:id/status", updateTourStatus);
// Perform the side effect or state update expressed on the following line.
router.post("/tours/:id/report", submitTourReport);

export default router;
