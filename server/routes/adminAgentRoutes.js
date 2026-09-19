import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import { resolveTenant } from "../middleware/tenantMiddleware.js";
import {
  getAgents,
  getAgentById,
  approveAgent,
  updateAgentStatus,
} from "../controllers/adminAgentController.js";

const router = express.Router();

// Admin agent management is always authenticated and tenant-resolved.
// resolveTenant must remain compatible with the authenticated user's tenant.
router.use(protect);
router.use(resolveTenant);
router.use(adminMiddleware);

router.get("/", getAgents);
router.get("/:id", getAgentById);
router.put("/:id/approve", approveAgent);
router.put("/:id/status", updateAgentStatus);

export default router;
