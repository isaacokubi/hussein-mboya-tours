/**
 * Purpose: finance Compliance Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import express from "express";
// Load ../controllers/financeComplianceController.js so this module can use its exported dependencies.
import { getTaxProfile, upsertTaxProfile, getEtimsCredentialStatus, saveEtimsCredentials, listExpenses, createExpense, listNotes, createNote, queueNoteEtims, listEtimsSubmissions, getFinanceComplianceSummary } from "../controllers/financeComplianceController.js";
// Load ../controllers/expenseLifecycleController.js so this module can use its exported dependencies.
import { transitionExpense } from "../controllers/expenseLifecycleController.js";
// Load ../controllers/withholdingTaxController.js so this module can use its exported dependencies.
import { listWithholdingTax, createWithholdingTax, remitWithholdingTax, cancelWithholdingTax } from "../controllers/withholdingTaxController.js";
// Load ../middleware/permissionMiddleware.js so this module can use its exported dependencies.
import { authorize } from "../middleware/permissionMiddleware.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();
// Perform the side effect or state update expressed on the following line.
router.get("/tax-profile", authorize("finance.view"), getTaxProfile);
// Perform the side effect or state update expressed on the following line.
router.put("/tax-profile", authorize("finance.manage"), upsertTaxProfile);
// Perform the side effect or state update expressed on the following line.
router.get("/etims/credentials", authorize("finance.view"), getEtimsCredentialStatus);
// Perform the side effect or state update expressed on the following line.
router.put("/etims/credentials", authorize("finance.manage"), saveEtimsCredentials);
// Perform the side effect or state update expressed on the following line.
router.get("/compliance-summary", authorize("finance.view"), getFinanceComplianceSummary);
// Perform the side effect or state update expressed on the following line.
router.get("/expenses", authorize("finance.view"), listExpenses);
// Perform the side effect or state update expressed on the following line.
router.post("/expenses", authorize("finance.manage"), createExpense);
// Perform the side effect or state update expressed on the following line.
router.post("/expenses/:id/status", authorize("finance.manage"), transitionExpense);
// Perform the side effect or state update expressed on the following line.
router.get("/withholding-tax", authorize("finance.view"), listWithholdingTax);
// Perform the side effect or state update expressed on the following line.
router.post("/withholding-tax", authorize("finance.manage"), createWithholdingTax);
// Perform the side effect or state update expressed on the following line.
router.post("/withholding-tax/:id/remit", authorize("finance.manage"), remitWithholdingTax);
// Perform the side effect or state update expressed on the following line.
router.post("/withholding-tax/:id/cancel", authorize("finance.manage"), cancelWithholdingTax);
// Perform the side effect or state update expressed on the following line.
router.get("/notes", authorize("finance.view"), listNotes);
// Perform the side effect or state update expressed on the following line.
router.post("/notes", authorize("finance.manage"), createNote);
// Perform the side effect or state update expressed on the following line.
router.post("/notes/:id/queue", authorize("finance.manage"), queueNoteEtims);
// Perform the side effect or state update expressed on the following line.
router.get("/etims/submissions", authorize("finance.view"), listEtimsSubmissions);
export default router;
