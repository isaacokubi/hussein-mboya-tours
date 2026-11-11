/**
 * Purpose: quotation Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// server/routes/quotationRoutes.js

// Load express so this module can use its exported dependencies.
import express from "express";

// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import {
  protect,
} from "../middleware/authMiddleware.js";

// Load ../controllers/quotationController.js so this module can use its exported dependencies.
import {
  createQuotation,
  getAgentQuotations,
  getQuotationById,
  updateQuotationStatus,
} from "../controllers/quotationController.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
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

// Perform the side effect or state update expressed on the following line.
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
// Perform the side effect or state update expressed on the following line.
router.post(
  "/",
  createQuotation
);

/**
 * GET /api/quotations
 * Get quotations for the authenticated agent.
 */
// Perform the side effect or state update expressed on the following line.
router.get(
  "/",
  getAgentQuotations
);
// Perform the side effect or state update expressed on the following line.
router.get(
  "/:id",
  getQuotationById
);

/**
 * PATCH /api/quotations/:id/status
 * Update quotation status.
 */
// Perform the side effect or state update expressed on the following line.
router.patch(
  "/:id/status",
  updateQuotationStatus
);

export default router;
