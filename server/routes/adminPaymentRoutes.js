import { resolveTenant } from "../middleware/tenantMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";
import express from "express";
import { getPayments, getPaymentStats, getPayment, getPaymentAnalytics, updatePaymentStatus, refundPayment } from "../controllers/adminPaymentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { getPaymentReconciliation } from "../controllers/reconciliationController.js";
import { exportPaymentsCSV, exportPaymentsPDF } from "../controllers/financeExportController.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import { guardPaymentRefund } from "../middleware/resourceTenantGuard.js";

const router = express.Router();
router.use(resolveTenant);
router.use(protect);
router.use(adminMiddleware);
router.use(authorize("payment.manage"));

router.get("/", getPayments);
router.get("/reconciliation", getPaymentReconciliation);
router.get("/stats", getPaymentStats);
router.get("/analytics", getPaymentAnalytics);
router.get("/export/csv", exportPaymentsCSV);
router.get("/export/pdf", exportPaymentsPDF);
router.get("/:id", getPayment);
router.patch("/:id/status", updatePaymentStatus);
router.patch("/:id", updatePaymentStatus);
router.patch("/:id/refund", guardPaymentRefund, refundPayment);
router.put("/:id/refund", guardPaymentRefund, refundPayment);
router.post("/:id/refund", guardPaymentRefund, refundPayment);

export default router;
