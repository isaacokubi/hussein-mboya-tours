import express from "express";
import { resolveTenant } from "../middleware/tenantMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";
import { protect, managerOnly } from "../middleware/authMiddleware.js";

import {
  getCommissions,
  getAgentCommissions,
  approveCommission,
  payCommission,
} from "../controllers/commissionController.js";

const router = express.Router();

router.use(resolveTenant);
router.use(protect);
// Managers are explicitly allowed to administer operational commission payouts.
// This also keeps admin and super_admin access working through managerOnly.
router.use(managerOnly);
router.use(authorize("commission.view"));

router.get("/", getCommissions);
router.get("/agent/:agentId", getAgentCommissions);

router.patch("/:id/approve", authorize("commission.approve"), approveCommission);
router.post("/:id/pay", authorize("commission.pay"), payCommission);

export default router;
