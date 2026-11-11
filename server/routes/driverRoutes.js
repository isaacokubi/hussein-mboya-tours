/**
 * Purpose: driver Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// Driver operational routes.
// Load express so this module can use its exported dependencies.
import express from "express";
// Load ../middleware/tenantMiddleware.js so this module can use its exported dependencies.
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load ../controllers/driverController.js so this module can use its exported dependencies.
import { driverDashboard } from "../controllers/driverController.js";
// Load ../controllers/driverTourController.js so this module can use its exported dependencies.
import { getAssignedTours, getTourDetails, getTourGuests, updateTourStatus } from "../controllers/driverTourController.js";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect, driverOnly } from "../middleware/authMiddleware.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Authenticate before resolving tenant context.
// Perform the side effect or state update expressed on the following line.
router.use(protect);
// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);
// Perform the side effect or state update expressed on the following line.
router.use(driverOnly);

// Perform the side effect or state update expressed on the following line.
router.get("/dashboard", driverDashboard);
// Perform the side effect or state update expressed on the following line.
router.get("/assigned-tours", getAssignedTours);
// Perform the side effect or state update expressed on the following line.
router.get("/tours/:id", getTourDetails);
// Perform the side effect or state update expressed on the following line.
router.get("/tours/:id/guests", getTourGuests);
// Perform the side effect or state update expressed on the following line.
router.put("/tours/:id/status", updateTourStatus);

export default router;
