import { resolveTenant } from "../middleware/tenantMiddleware.js";
// server/routes/guideRoutes.js

import express from "express";
import {
  guideDashboard,
  getAssignedTours,
  getTourDetails,
  getTourGuests,
  updateTourStatus,
  submitTourReport,
} from "../controllers/guideController.js";
import { protect, guideOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(resolveTenant);

// All guide operations use the canonical authentication/RBAC contract.
router.use(protect);
router.use(guideOnly);

router.get("/dashboard", guideDashboard);
router.get("/assigned-tours", getAssignedTours);
router.get("/tours/:id", getTourDetails);
router.get("/tours/:id/guests", getTourGuests);
router.put("/tours/:id/status", updateTourStatus);
router.post("/tours/:id/report", submitTourReport);

export default router;
