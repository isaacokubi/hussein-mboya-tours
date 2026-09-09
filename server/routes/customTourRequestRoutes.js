import { resolveTenant } from "../middleware/tenantMiddleware.js";
import express from "express";
import { protect, optionalProtect } from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import { createCustomTourRequest,getMyCustomTourRequests,getAdminCustomTourRequests,quoteCustomTourRequest,assignCustomTourResources,convertCustomTourToBooking } from "../controllers/customTourRequestController.js";

const router = express.Router();

router.use(resolveTenant);

// Guests may submit requests, but logged-in customers must be resolved so the
// request appears in /mine and can later be converted into their booking.
router.post("/", optionalProtect, createCustomTourRequest);
router.get("/mine", protect, getMyCustomTourRequests);
router.get("/admin", protect, adminMiddleware, getAdminCustomTourRequests);
router.patch("/admin/:id/quote", protect, adminMiddleware, quoteCustomTourRequest);
router.patch("/admin/:id/assign", protect, adminMiddleware, assignCustomTourResources);
router.post("/:id/convert", protect, convertCustomTourToBooking);

export default router;
