/**
 * Purpose: agent Package Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// server/routes/agentPackageRoutes.js

// Load express so this module can use its exported dependencies.
import express from "express";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";
// Load ../middleware/agentMiddleware.js so this module can use its exported dependencies.
import agentMiddleware from "../middleware/agentMiddleware.js";
// Load ../controllers/agentPackageController.js so this module can use its exported dependencies.
import { getAgentPackages, getPackageDetails } from "../controllers/agentPackageController.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);

// Perform the side effect or state update expressed on the following line.
router.use(protect);
// Perform the side effect or state update expressed on the following line.
router.use(agentMiddleware);

// Perform the side effect or state update expressed on the following line.
router.get("/", getAgentPackages);
// Perform the side effect or state update expressed on the following line.
router.get("/:id", getPackageDetails);

export default router;
