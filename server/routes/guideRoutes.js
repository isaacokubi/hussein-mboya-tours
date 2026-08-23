// server/routes/guideRoutes.js
import express from "express";
import { resolveTenant } from "../middleware/tenantMiddleware.js";
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

// Authenticate before resolving tenant context so guide requests are always
// scoped to the tenant belonging to the authenticated account.
router.use(protect);
router.use(resolveTenant);
router.use(guideOnly);

router.get("/dashboard", guideDashboard);
router.get("/assigned-tours", getAssignedTours);
router.get("/tours/:id", getTourDetails);
router.get("/tours/:id/guests", getTourGuests);
router.put("/tours/:id/status", updateTourStatus);
router.post("/tours/:id/report", submitTourReport);

export default router;
