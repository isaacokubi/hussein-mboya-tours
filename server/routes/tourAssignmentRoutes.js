import express from "express";
import { resolveTenant } from "../middleware/tenantMiddleware.js";
import { assignTourResourcesSafe } from "../controllers/tourResourceAssignmentController.js";
import { protect, managerOnly } from "../middleware/authMiddleware.js";
import validateTourAssignmentTenant from "../middleware/validateTourAssignmentTenant.js";

const router = express.Router();

router.use(resolveTenant);
router.use(protect);
router.use(managerOnly);

router.put("/:id/assign", validateTourAssignmentTenant, assignTourResourcesSafe);

export default router;
