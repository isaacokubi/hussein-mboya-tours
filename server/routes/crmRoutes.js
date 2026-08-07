// server/routes/crmRoutes.js

import express from "express";

import {
  getCRMStats,
} from "../controllers/crmControllers.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| AUTHORIZATION
|--------------------------------------------------------------------------
|
| All CRM routes require:
| • Valid JWT
| • Administrator privileges
|
|--------------------------------------------------------------------------
*/

router.use(protect);
router.use(adminMiddleware);

/*
|--------------------------------------------------------------------------
| CRM DASHBOARD
|--------------------------------------------------------------------------
*/

/**
 * GET /api/crm/stats
 * Get CRM statistics
 */
router.get(
  "/stats",
  getCRMStats
);

export default router;