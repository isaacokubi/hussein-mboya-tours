import express from "express";
import { resolveTenant } from "../middleware/tenantMiddleware.js";
import { protect, checkPermission } from "../middleware/authMiddleware.js";
import { listTravelServiceRequests, createTravelServiceRequest, updateTravelServiceRequest, getTravelServiceSummary } from "../controllers/travelServiceRequestController.js";

const router = express.Router();
router.use(resolveTenant, protect, checkPermission("booking.manage"));
router.get("/summary", getTravelServiceSummary);
router.get("/", listTravelServiceRequests);
router.post("/", createTravelServiceRequest);
router.patch("/:id", updateTravelServiceRequest);
export default router;
