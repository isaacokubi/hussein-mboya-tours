import express from "express";
import { listComplianceRecords, upsertComplianceRecord, getComplianceSummary, queueEtimsInvoice, getEtimsInvoiceStatus } from "../controllers/complianceController.js";
import { resolveTenant } from "../middleware/tenantMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";

const router = express.Router();
router.use(resolveTenant, protect);
router.get("/", authorize("finance.view"), listComplianceRecords);
router.get("/summary", authorize("finance.view"), getComplianceSummary);
router.put("/:type", authorize("finance.manage"), (req, res, next) => { req.body = { ...(req.body || {}), type: req.params.type }; return upsertComplianceRecord(req, res, next); });
router.post("/etims/invoices/:id/queue", authorize("finance.manage"), queueEtimsInvoice);
router.get("/etims/invoices/:id/status", authorize("finance.view"), getEtimsInvoiceStatus);
export default router;
