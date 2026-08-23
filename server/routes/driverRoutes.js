// Driver operational routes.
import express from "express";
import { resolveTenant } from "../middleware/tenantMiddleware.js";
import { driverDashboard } from "../controllers/driverController.js";
import { getAssignedTours, getTourDetails, getTourGuests, updateTourStatus } from "../controllers/driverTourController.js";
import { protect, driverOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Authenticate before resolving tenant context.
router.use(protect);
router.use(resolveTenant);
router.use(driverOnly);

router.get("/dashboard", driverDashboard);
router.get("/assigned-tours", getAssignedTours);
router.get("/tours/:id", getTourDetails);
router.get("/tours/:id/guests", getTourGuests);
router.put("/tours/:id/status", updateTourStatus);

export default router;
