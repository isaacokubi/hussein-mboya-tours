import { authorize } from "../middleware/permissionMiddleware.js";
// server/routes/customerRoutes.js

import express from "express";

import {
  getCustomers,
  getCustomerProfile,
} from "../controllers/customerController.js";

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
| All customer management routes require:
| • Valid JWT
| • Administrator privileges
|
|--------------------------------------------------------------------------
*/

router.use(protect);
router.use(adminMiddleware);

router.use(authorize("manage_customers"));

/*
|--------------------------------------------------------------------------
| CUSTOMERS
|--------------------------------------------------------------------------
*/

/**
 * GET /api/customers
 * Get all customers
 */
router.get(
  "/",
  getCustomers
);

/**
 * GET /api/customers/:id
 * Get a customer's profile
 */
router.get(
  "/:id",
  getCustomerProfile
);

export default router;