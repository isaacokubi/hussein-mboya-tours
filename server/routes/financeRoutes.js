import { resolveTenant } from "../middleware/tenantMiddleware.js";
import express from "express";
import { getFinanceStats, getTransactions, getReports } from "../controllers/financeController.js";
import { protect } from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";
import { getUserRole } from "../utils/roleUtils.js";
import financeComplianceRoutes from "./financeComplianceRoutes.js";

const router = express.Router();
router.use(resolveTenant);

const financeAccess = (req, res, next) => {
  const role = getUserRole(req.user);
  if (["admin", "super_admin"].includes(role)) return next();
  return authorize("finance.view")(req, res, next);
};

router.use(protect);
router.use(adminMiddleware);
router.use(financeAccess);

router.get("/", getFinanceStats);
router.get("/stats", getFinanceStats);
router.get("/transactions", getTransactions);
router.get("/reports", getReports);
router.use("/compliance", financeComplianceRoutes);

export default router;
