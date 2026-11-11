/**
 * Purpose: finance Routes API route module. Main declarations: financeAccess.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load express so this module can use its exported dependencies.
import express from "express";
// Load ../controllers/financeController.js so this module can use its exported dependencies.
import { getFinanceStats, getTransactions, getReports } from "../controllers/financeController.js";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";
// Load ../middleware/permissionMiddleware.js so this module can use its exported dependencies.
import { authorize } from "../middleware/permissionMiddleware.js";
// Load ../utils/roleUtils.js so this module can use its exported dependencies.
import { getUserRole } from "../utils/roleUtils.js";
// Load ./financeComplianceRoutes.js so this module can use its exported dependencies.
import financeComplianceRoutes from "./financeComplianceRoutes.js";
// Load ./accountingRoutes.js so this module can use its exported dependencies.
import accountingRoutes from "./accountingRoutes.js";
// Load ./kenyaReadinessRoutes.js so this module can use its exported dependencies.
import kenyaReadinessRoutes from "./kenyaReadinessRoutes.js";
// Load ../controllers/withholdingTaxController.js so this module can use its exported dependencies.
import { listWithholdingTax, createWithholdingTax, remitWithholdingTax, cancelWithholdingTax } from "../controllers/withholdingTaxController.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();
// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);
// Perform the side effect or state update expressed on the following line.
router.use(protect);

// Declare financeAccess for use by the surrounding module or function.
const financeAccess = (req, res, next) => {
  // Declare role for use by the surrounding module or function.
  const role = getUserRole(req.user);
  // Check the condition (["admin", "super_admin", "superadmin"].includes(String(role || "").toL) and run the matching branch.
  if (["admin", "super_admin", "superadmin"].includes(String(role || "").toLowerCase())) return next();
  // Return the result of authorize("finance.view")() to the caller.
  return authorize("finance.view")(req, res, next);
};

// Perform the side effect or state update expressed on the following line.
router.use(financeAccess);
// Perform the side effect or state update expressed on the following line.
router.get("/", getFinanceStats);
// Perform the side effect or state update expressed on the following line.
router.get("/stats", getFinanceStats);
// Perform the side effect or state update expressed on the following line.
router.get("/transactions", getTransactions);
// Perform the side effect or state update expressed on the following line.
router.get("/reports", getReports);
// Perform the side effect or state update expressed on the following line.
router.get("/withholding-tax", listWithholdingTax);
// Perform the side effect or state update expressed on the following line.
router.post("/withholding-tax", authorize("finance.manage"), createWithholdingTax);
// Perform the side effect or state update expressed on the following line.
router.post("/withholding-tax/:id/remit", authorize("finance.manage"), remitWithholdingTax);
// Perform the side effect or state update expressed on the following line.
router.post("/withholding-tax/:id/cancel", authorize("finance.manage"), cancelWithholdingTax);
// Perform the side effect or state update expressed on the following line.
router.use("/compliance", financeComplianceRoutes);
// Perform the side effect or state update expressed on the following line.
router.use("/kenya-readiness", kenyaReadinessRoutes);
// Perform the side effect or state update expressed on the following line.
router.use("/accounting", accountingRoutes);

export default router;
