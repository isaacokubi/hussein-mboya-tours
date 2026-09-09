import { resolveTenant } from "../middleware/tenantMiddleware.js";
import express from "express";
import { getFinanceStats, getTransactions, getReports } from "../controllers/financeController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";
import { getUserRole } from "../utils/roleUtils.js";
import financeComplianceRoutes from "./financeComplianceRoutes.js";
import accountingRoutes from "./accountingRoutes.js";

const router = express.Router();
router.use(resolveTenant);
router.use(protect);

const financeAccess = (req, res, next) => {
  const role = getUserRole(req.user);
  if (["admin", "super_admin", "superadmin"].includes(String(role || "").toLowerCase())) return next();
  return authorize("finance.view")(req, res, next);
};

router.use(financeAccess);
router.get("/", getFinanceStats);
router.get("/stats", getFinanceStats);
router.get("/transactions", getTransactions);
router.get("/reports", getReports);
router.use("/compliance", financeComplianceRoutes);
router.use("/accounting", accountingRoutes);

export default router;
