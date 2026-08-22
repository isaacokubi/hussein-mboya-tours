import { resolveTenant } from "../middleware/tenantMiddleware.js";
// server/routes/agentCustomerRoutes.js

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
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

router.use(resolveTenant);

router.use(protect);
router.use(agentMiddleware);

router.get("/", getCustomers);
router.get("/stats", getCustomerStats);
router.get("/:id", getCustomer);
router.post("/", createCustomer);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);

export default router;
