/**
 * Purpose: custom Tour Request Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load express so this module can use its exported dependencies.
import express from "express";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect, optionalProtect } from "../middleware/authMiddleware.js";
// Load ../middleware/adminMiddleware.js so this module can use its exported dependencies.
import adminMiddleware from "../middleware/adminMiddleware.js";
// Load ../controllers/customTourRequestController.js so this module can use its exported dependencies.
import { createCustomTourRequest,getMyCustomTourRequests,getAdminCustomTourRequests,quoteCustomTourRequest,assignCustomTourResources,convertCustomTourToBooking } from "../controllers/customTourRequestController.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);

// Guests may submit requests, but logged-in customers must be resolved so the
// request appears in /mine and can later be converted into their booking.
// Perform the side effect or state update expressed on the following line.
router.post("/", optionalProtect, createCustomTourRequest);
// Perform the side effect or state update expressed on the following line.
router.get("/mine", protect, getMyCustomTourRequests);
// Perform the side effect or state update expressed on the following line.
router.get("/admin", protect, adminMiddleware, getAdminCustomTourRequests);
// Perform the side effect or state update expressed on the following line.
router.patch("/admin/:id/quote", protect, adminMiddleware, quoteCustomTourRequest);
// Perform the side effect or state update expressed on the following line.
router.patch("/admin/:id/assign", protect, adminMiddleware, assignCustomTourResources);
// Perform the side effect or state update expressed on the following line.
router.post("/:id/convert", protect, convertCustomTourToBooking);

export default router;
