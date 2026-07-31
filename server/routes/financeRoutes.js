// server/routes/financeRoutes.js

import express from "express";

import {
  getFinanceStats,
  getTransactions,
  getReports,
} from "../controllers/financeController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

import {
  adminMiddleware,
} from "../middleware/adminMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| AUTHORIZATION
|--------------------------------------------------------------------------
|
| All finance routes require:
| • Valid JWT
| • Administrator privileges
|
|--------------------------------------------------------------------------
*/

router.use(protect);
router.use(adminMiddleware);

/*
|--------------------------------------------------------------------------
| FINANCE DASHBOARD
|--------------------------------------------------------------------------
*/

/**
 * GET /api/admin/finance/stats
 * Financial dashboard statistics
 */
router.get(
  "/stats",
  getFinanceStats
);

/**
 * GET /api/admin/finance/transactions
 * Payment transaction history
 */
router.get(
  "/transactions",
  getTransactions
);

/**
 * GET /api/admin/finance/reports
 * Revenue and finance reports
 */
router.get(
  "/reports",
  getReports
);

export default router;