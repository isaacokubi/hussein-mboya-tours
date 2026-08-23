import { resolveTenant } from "../middleware/tenantMiddleware.js";
// server/routes/quotationRoutes.js

import express from "express";

import {
  protect,
} from "../middleware/authMiddleware.js";

import {
  createQuotation,
  getAgentQuotations,
  updateQuotationStatus,
} from "../controllers/quotationController.js";

const router = express.Router();

router.use(resolveTenant);

/*
|--------------------------------------------------------------------------
| AUTHORIZATION
|--------------------------------------------------------------------------
|
| All quotation routes require authentication.
|
|--------------------------------------------------------------------------
*/

router.use(protect);

/*
|--------------------------------------------------------------------------
| QUOTATIONS
|--------------------------------------------------------------------------
*/

/**
 * POST /api/quotations
 * Create a new quotation.
 */
router.post(
  "/",
  createQuotation
);

/**
 * GET /api/quotations
 * Get quotations for the authenticated agent.
 */
router.get(
  "/",
  getAgentQuotations
);

/**
 * PATCH /api/quotations/:id/status
 * Update quotation status.
 */
router.patch(
  "/:id/status",
  updateQuotationStatus
);

export default router;
