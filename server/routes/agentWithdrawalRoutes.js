import express from "express";
import { resolveTenant } from "../middleware/tenantMiddleware.js";
import { protect, managerOnly } from "../middleware/authMiddleware.js";
import agentMiddleware, { requireApprovedAgent } from "../middleware/agentMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";
import {
  getMyWithdrawalData,
  requestWithdrawal,
  getWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  completeWithdrawal,
} from "../controllers/agentWithdrawalController.js";

const router = express.Router();

// Agent self-service endpoints.
router.get("/mine", protect, resolveTenant, agentMiddleware, requireApprovedAgent, getMyWithdrawalData);
router.post("/", protect, resolveTenant, agentMiddleware, requireApprovedAgent, requestWithdrawal);

// Finance/manager payout processing endpoints.
router.use(protect, resolveTenant, managerOnly, authorize("commission.view"));
router.get("/", getWithdrawals);
router.patch("/:id/approve", authorize("commission.approve"), approveWithdrawal);
router.patch("/:id/reject", authorize("commission.approve"), rejectWithdrawal);
router.post("/:id/complete", authorize("commission.pay"), completeWithdrawal);

export default router;
