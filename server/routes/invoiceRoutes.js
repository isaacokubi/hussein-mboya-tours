// server/routes/invoiceRoutes.js

import express from "express";

import {
  downloadInvoice,
} from "../controllers/invoiceController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| AUTHORIZATION
|--------------------------------------------------------------------------
|
| All invoice routes require authentication.
|
|--------------------------------------------------------------------------
*/

router.use(protect);

/*
|--------------------------------------------------------------------------
| INVOICES
|--------------------------------------------------------------------------
*/

/**
 * GET /api/invoices/:id
 * Download an invoice for the authenticated user.
 */
router.get(
  "/:id",
  downloadInvoice
);

export default router;

// RBAC middleware placeholder
