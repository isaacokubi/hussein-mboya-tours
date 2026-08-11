// server/routes/agentCustomerRoutes.js

import express from "express";

import {
  protect,
} from "../middleware/authMiddleware.js";

import agentMiddleware from "../middleware/agentMiddleware.js";

import {
  createCustomer,
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerStats,
} from "../controllers/agentCustomerController.js";

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
| CUSTOMERS
|--------------------------------------------------------------------------
*/

/**
 * GET /api/agent/customers
 * Get all customers belonging to the authenticated agent.
 */
router.get(
  "/",
  getCustomers
);

/**
 * GET /api/agent/customers/:id
 * Get a single customer.
 */
router.get(
  "/stats",
  getCustomerStats
);

router.get(
  "/:id",
  getCustomer
);

/**
 * POST /api/agent/customers
 * Create a new customer.
 */
router.post(
  "/",
  createCustomer
);

/**
 * PUT /api/agent/customers/:id
 * Update customer details.
 */
router.put(
  "/:id",
  updateCustomer
);

/**
 * DELETE /api/agent/customers/:id
 * Delete a customer.
 */
router.delete(
  "/:id",
  deleteCustomer
);

export default router;