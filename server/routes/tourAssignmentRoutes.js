import { resolveTenant } from "../middleware/tenantMiddleware.js";
// server/routes/tourAssignmentRoutes.js

import express from "express";
import { assignTourResources } from "../controllers/tourAssignmentController.js";
import { protect, managerOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(resolveTenant);

router.use(protect);
router.use(managerOnly);

/**
 * PUT /api/tour-assignments/:id/assign
 * Assign or update guide, driver and/or vehicle resources for a tour.
 */
router.put("/:id/assign", assignTourResources);

export default router;
