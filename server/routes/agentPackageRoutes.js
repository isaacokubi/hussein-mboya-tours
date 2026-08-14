// server/routes/agentPackageRoutes.js

import express from "express";

import {
  protect,
} from "../middleware/authMiddleware.js";

import agentMiddleware from "../middleware/agentMiddleware.js";

import {
  getAgentPackages,
  getPackageDetails,
} from "../controllers/agentPackageController.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| AGENT AUTHORIZATION
|--------------------------------------------------------------------------
|
| All routes require:
| - Valid JWT
| - Active account
| - Approved agent
|
|--------------------------------------------------------------------------
*/

router.use(protect);
router.use(agentMiddleware);

/*
|--------------------------------------------------------------------------
| TOUR PACKAGES
|--------------------------------------------------------------------------
*/

/**
 * GET /api/agent/packages
 * Get all tour packages available to the authenticated agent.
 */
router.get(
  "/",
  getAgentPackages
);

/**
 * GET /api/agent/packages/:id
 * Get a single package with full details.
 */
router.get(
  "/:id",
  getPackageDetails
);

export default router;

// RBAC middleware placeholder
