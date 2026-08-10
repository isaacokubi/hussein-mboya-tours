// server/routes/agentRoutes.js

import express from "express";

import {
  getAgentDashboard,
  getMyAgentCommission,
} from "../controllers/agentController.js";

import { getAgentQuotations } from "../controllers/quotationController.js";

import {
  createAgentTour,
  getAgentTours,
  getAgentTour,
  updateAgentTour,
  deleteAgentTour,
} from "../controllers/agentTourController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

import agentMiddleware from "../middleware/agentMiddleware.js";

import {
  authorize,
} from "../middleware/permissionMiddleware.js";

import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| AGENT AUTHORIZATION
|--------------------------------------------------------------------------
|
| Every route requires:
| • Valid JWT
| • Approved Agent
|
|--------------------------------------------------------------------------
*/

router.use(protect);
router.use(agentMiddleware);

/*
|--------------------------------------------------------------------------
| DASHBOARD
|--------------------------------------------------------------------------
*/

/**
 * GET /api/agent/dashboard
 */
router.get(
  "/dashboard",
  authorize("view_agent_dashboard"),
  getAgentDashboard
);

router.get(
  "/quotes",
  getAgentQuotations
);

router.get(
  "/commission",
  getMyAgentCommission
);

/*
|--------------------------------------------------------------------------
| TOURS
|--------------------------------------------------------------------------
*/

/**
 * GET /api/agent/tours
 * View own tours
 */
router.get(
  "/tours",
  authorize("view_agent_tours"),
  getAgentTours
);

/**
 * GET /api/agent/tours/:id
 * View single tour
 */
router.get(
  "/tours/:id",
  authorize("view_agent_tours"),
  getAgentTour
);

/**
 * POST /api/agent/tours
 * Create tour
 */
router.post(
  "/tours",
  authorize("create_agent_tour"),
  upload.array("images", 10),
  createAgentTour
);

/**
 * PUT /api/agent/tours/:id
 * Update tour
 */
router.put(
  "/tours/:id",
  authorize("edit_agent_tour"),
  upload.array("images", 10),
  updateAgentTour
);

/**
 * DELETE /api/agent/tours/:id
 * Delete tour
 */
router.delete(
  "/tours/:id",
  authorize("delete_agent_tour"),
  deleteAgentTour
);

export default router;