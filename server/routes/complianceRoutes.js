/**
 * Purpose: compliance Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import express from "express";
// Load ../controllers/complianceController.js so this module can use its exported dependencies.
import { listComplianceRecords, upsertComplianceRecord, getComplianceSummary, queueEtimsInvoice, getEtimsInvoiceStatus } from "../controllers/complianceController.js";
// Load ../middleware/tenantMiddleware.js so this module can use its exported dependencies.
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";
// Load ../middleware/permissionMiddleware.js so this module can use its exported dependencies.
import { authorize } from "../middleware/permissionMiddleware.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();
// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant, protect);
// Perform the side effect or state update expressed on the following line.
router.get("/", authorize("finance.view"), listComplianceRecords);
// Perform the side effect or state update expressed on the following line.
router.get("/summary", authorize("finance.view"), getComplianceSummary);
// Perform the side effect or state update expressed on the following line.
router.put("/:type", authorize("finance.manage"), (req, res, next) => { req.body = { ...(req.body || {}), type: req.params.type }; return upsertComplianceRecord(req, res, next); });
// Perform the side effect or state update expressed on the following line.
router.post("/etims/invoices/:id/queue", authorize("finance.manage"), queueEtimsInvoice);
// Perform the side effect or state update expressed on the following line.
router.get("/etims/invoices/:id/status", authorize("finance.view"), getEtimsInvoiceStatus);
export default router;
