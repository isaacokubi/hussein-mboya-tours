import { resolveTenant } from "../middleware/tenantMiddleware.js";
// server/routes/financeRoutes.js
import express from "express";

import {
  getFinanceStats,
  getTransactions,
  getReports,
} from "../controllers/financeController.js";

import { protect } from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";
import { getUserRole } from "../utils/roleUtils.js";

const router = express.Router();

router.use(resolveTenant);

/*
 * Finance is an administrator capability. Legacy Admin/SuperAdmin accounts
 * may not have a populated Role document after account recreation, so do not
 * turn a missing `finance.view` permission into a 403 for those roles.
 * Non-admin callers still pass through the normal permission check.
 */
const financeAccess = (req, res, next) => {
  const role = getUserRole(req.user);
  if (["admin", "superadmin"].includes(role)) return next();
  return authorize("finance.view")(req, res, next);
};

router.use(protect);
router.use(adminMiddleware);
router.use(financeAccess);

router.get("/", getFinanceStats);
router.get("/stats", getFinanceStats);
router.get("/transactions", getTransactions);
router.get("/reports", getReports);

export default router;
