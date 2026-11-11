/**
 * Purpose: customer Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load ../middleware/permissionMiddleware.js so this module can use its exported dependencies.
import { authorize } from "../middleware/permissionMiddleware.js";
// server/routes/customerRoutes.js

// Load express so this module can use its exported dependencies.
import express from "express";

// Load ../controllers/customerController.js so this module can use its exported dependencies.
import {
  getCustomers,
  getCustomerProfile,
} from "../controllers/customerController.js";

// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import {
  protect,
} from "../middleware/authMiddleware.js";

// Load ../middleware/adminMiddleware.js so this module can use its exported dependencies.
import adminMiddleware from "../middleware/adminMiddleware.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);

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

// Perform the side effect or state update expressed on the following line.
router.use(protect);
// Perform the side effect or state update expressed on the following line.
router.use(adminMiddleware);

// Perform the side effect or state update expressed on the following line.
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
// Perform the side effect or state update expressed on the following line.
router.get(
  "/",
  getCustomers
);

/**
 * GET /api/customers/:id
 * Get a customer's profile
 */
// Perform the side effect or state update expressed on the following line.
router.get(
  "/:id",
  getCustomerProfile
);

export default router;
