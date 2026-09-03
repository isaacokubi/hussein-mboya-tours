import { resolveTenant } from "../middleware/tenantMiddleware.js";
import express from "express";
import { assignTourResources } from "../controllers/tourAssignmentController.js";
import { protect, managerOnly } from "../middleware/authMiddleware.js";
import validateTourAssignmentTenant from "../middleware/validateTourAssignmentTenant.js";

const router = express.Router();

router.use(resolveTenant);
router.use(protect);
router.use(managerOnly);

router.put("/:id/assign", validateTourAssignmentTenant, assignTourResources);

export default router;
