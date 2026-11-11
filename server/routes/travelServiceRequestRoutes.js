/**
 * Purpose: travel Service Request Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import express from "express";
// Load ../middleware/tenantMiddleware.js so this module can use its exported dependencies.
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect, checkPermission } from "../middleware/authMiddleware.js";
// Load ../controllers/travelServiceRequestController.js so this module can use its exported dependencies.
import { listTravelServiceRequests, createTravelServiceRequest, updateTravelServiceRequest, getTravelServiceSummary } from "../controllers/travelServiceRequestController.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();
// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant, protect, checkPermission("booking.manage"));
// Perform the side effect or state update expressed on the following line.
router.get("/summary", getTravelServiceSummary);
// Perform the side effect or state update expressed on the following line.
router.get("/", listTravelServiceRequests);
// Perform the side effect or state update expressed on the following line.
router.post("/", createTravelServiceRequest);
// Perform the side effect or state update expressed on the following line.
router.patch("/:id", updateTravelServiceRequest);
export default router;
