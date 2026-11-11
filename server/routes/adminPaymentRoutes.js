/**
 * Purpose: admin Payment Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load ../middleware/permissionMiddleware.js so this module can use its exported dependencies.
import { authorize } from "../middleware/permissionMiddleware.js";
// Load express so this module can use its exported dependencies.
import express from "express";
// Load ../controllers/adminPaymentController.js so this module can use its exported dependencies.
import { getPayments, getPaymentStats, getPayment, getPaymentAnalytics, updatePaymentStatus, refundPayment } from "../controllers/adminPaymentController.js";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";
// Load ../controllers/reconciliationController.js so this module can use its exported dependencies.
import { getPaymentReconciliation } from "../controllers/reconciliationController.js";
// Load ../controllers/financeExportController.js so this module can use its exported dependencies.
import { exportPaymentsCSV, exportPaymentsPDF } from "../controllers/financeExportController.js";
// Load ../middleware/adminMiddleware.js so this module can use its exported dependencies.
import adminMiddleware from "../middleware/adminMiddleware.js";
// Load ../middleware/resourceTenantGuard.js so this module can use its exported dependencies.
import { guardPaymentRefund } from "../middleware/resourceTenantGuard.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();
// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);
// Perform the side effect or state update expressed on the following line.
router.use(protect);
// Perform the side effect or state update expressed on the following line.
router.use(adminMiddleware);
// Perform the side effect or state update expressed on the following line.
router.use(authorize("payment.manage"));

// Perform the side effect or state update expressed on the following line.
router.get("/", getPayments);
// Perform the side effect or state update expressed on the following line.
router.get("/reconciliation", getPaymentReconciliation);
// Perform the side effect or state update expressed on the following line.
router.get("/stats", getPaymentStats);
// Perform the side effect or state update expressed on the following line.
router.get("/analytics", getPaymentAnalytics);
// Perform the side effect or state update expressed on the following line.
router.get("/export/csv", exportPaymentsCSV);
// Perform the side effect or state update expressed on the following line.
router.get("/export/pdf", exportPaymentsPDF);
// Perform the side effect or state update expressed on the following line.
router.get("/:id", getPayment);
// Perform the side effect or state update expressed on the following line.
router.patch("/:id/status", updatePaymentStatus);
// Perform the side effect or state update expressed on the following line.
router.patch("/:id", updatePaymentStatus);
// Perform the side effect or state update expressed on the following line.
router.patch("/:id/refund", guardPaymentRefund, refundPayment);
// Perform the side effect or state update expressed on the following line.
router.put("/:id/refund", guardPaymentRefund, refundPayment);
// Perform the side effect or state update expressed on the following line.
router.post("/:id/refund", guardPaymentRefund, refundPayment);

export default router;
