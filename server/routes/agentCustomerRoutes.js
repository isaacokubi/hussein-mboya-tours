/**
 * Purpose: agent Customer Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// server/routes/agentCustomerRoutes.js

// Load express so this module can use its exported dependencies.
import express from "express";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";
// Load ../middleware/agentMiddleware.js so this module can use its exported dependencies.
import agentMiddleware from "../middleware/agentMiddleware.js";
// Load ../controllers/agentCustomerController.js so this module can use its exported dependencies.
import {
  createCustomer,
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerStats,
} from "../controllers/agentCustomerController.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);

// Perform the side effect or state update expressed on the following line.
router.use(protect);
// Perform the side effect or state update expressed on the following line.
router.use(agentMiddleware);

// Perform the side effect or state update expressed on the following line.
router.get("/", getCustomers);
// Perform the side effect or state update expressed on the following line.
router.get("/stats", getCustomerStats);
// Perform the side effect or state update expressed on the following line.
router.get("/:id", getCustomer);
// Perform the side effect or state update expressed on the following line.
router.post("/", createCustomer);
// Perform the side effect or state update expressed on the following line.
router.put("/:id", updateCustomer);
// Perform the side effect or state update expressed on the following line.
router.delete("/:id", deleteCustomer);

export default router;
