/**
 * Purpose: admin Agent Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import express from "express";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";
// Load ../middleware/adminMiddleware.js so this module can use its exported dependencies.
import adminMiddleware from "../middleware/adminMiddleware.js";
// Load ../middleware/tenantMiddleware.js so this module can use its exported dependencies.
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load ../controllers/adminAgentController.js so this module can use its exported dependencies.
import {
  getAgents,
  getAgentById,
  approveAgent,
  updateAgentStatus,
} from "../controllers/adminAgentController.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Admin agent management is always authenticated and tenant-resolved.
// resolveTenant must remain compatible with the authenticated user's tenant.
// Perform the side effect or state update expressed on the following line.
router.use(protect);
// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);
// Perform the side effect or state update expressed on the following line.
router.use(adminMiddleware);

// Perform the side effect or state update expressed on the following line.
router.get("/", getAgents);
// Perform the side effect or state update expressed on the following line.
router.get("/:id", getAgentById);
// Perform the side effect or state update expressed on the following line.
router.put("/:id/approve", approveAgent);
// Perform the side effect or state update expressed on the following line.
router.put("/:id/status", updateAgentStatus);

export default router;
