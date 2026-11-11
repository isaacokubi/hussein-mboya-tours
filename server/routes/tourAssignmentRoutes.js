/**
 * Purpose: tour Assignment Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import express from "express";
// Load ../middleware/tenantMiddleware.js so this module can use its exported dependencies.
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load ../controllers/tourResourceAssignmentController.js so this module can use its exported dependencies.
import { assignTourResourcesSafe } from "../controllers/tourResourceAssignmentController.js";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect, managerOnly } from "../middleware/authMiddleware.js";
// Load ../middleware/validateTourAssignmentTenant.js so this module can use its exported dependencies.
import validateTourAssignmentTenant from "../middleware/validateTourAssignmentTenant.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);
// Perform the side effect or state update expressed on the following line.
router.use(protect);
// Perform the side effect or state update expressed on the following line.
router.use(managerOnly);

// Perform the side effect or state update expressed on the following line.
router.put("/:id/assign", validateTourAssignmentTenant, assignTourResourcesSafe);

export default router;
