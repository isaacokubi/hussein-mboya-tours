/**
 * Purpose: accounting Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import express from "express";
// Load ../middleware/permissionMiddleware.js so this module can use its exported dependencies.
import { authorize } from "../middleware/permissionMiddleware.js";
// Load ../controllers/accountingController.js so this module can use its exported dependencies.
import { createAccount, createJournalEntry, getLedgerSummary, listAccounts, listJournalEntries, postJournalEntry, voidJournalEntry } from "../controllers/accountingController.js";
// Load ../controllers/accountingReportsController.js so this module can use its exported dependencies.
import { getFinancialStatements, getArAging, getApAging, getCashFlow } from "../controllers/accountingReportsController.js";
// Load ../controllers/managementAccountingController.js so this module can use its exported dependencies.
import { listAssets, createAsset, disposeAsset, postAssetDepreciation, listBudgets, upsertBudget, approveBudget, budgetVsActual, listPeriods, closePeriod, reopenPeriod, closeFinancialYear } from "../controllers/managementAccountingController.js";
// Load ../controllers/accountingControlReportsController.js so this module can use its exported dependencies.
import { getTaxControlReport, getCustomerLedgerReport, getSupplierLedgerReport, getProfitabilityReport } from "../controllers/accountingControlReportsController.js";
// Load ../controllers/accountingSubledgerController.js so this module can use its exported dependencies.
import { listSubledger, createSubledger, amortizeSubledger, reverseAccrual } from "../controllers/accountingSubledgerController.js";
// Load ../controllers/accountingExportController.js so this module can use its exported dependencies.
import { exportGeneralLedgerCSV, exportTaxControlCSV } from "../controllers/accountingExportController.js";
// Load ../controllers/accountingOperationalReconciliationController.js so this module can use its exported dependencies.
import { reconcileOperationalAccounting } from "../controllers/accountingOperationalReconciliationController.js";
// Load ../controllers/accountingReconciliationController.js so this module can use its exported dependencies.
import { listReconciliationTransactions, createReconciliationTransaction, matchReconciliationTransaction, markReconciliationException } from "../controllers/accountingReconciliationController.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();
// Perform the side effect or state update expressed on the following line.
router.get("/accounts", authorize("finance.view"), listAccounts);
// Perform the side effect or state update expressed on the following line.
router.post("/accounts", authorize("finance.manage"), createAccount);
// Perform the side effect or state update expressed on the following line.
router.get("/journal", authorize("finance.view"), listJournalEntries);
// Perform the side effect or state update expressed on the following line.
router.post("/journal", authorize("finance.manage"), createJournalEntry);
// Perform the side effect or state update expressed on the following line.
router.post("/journal/:id/post", authorize("finance.manage"), postJournalEntry);
// Perform the side effect or state update expressed on the following line.
router.post("/journal/:id/void", authorize("finance.manage"), voidJournalEntry);
// Perform the side effect or state update expressed on the following line.
router.get("/summary", authorize("finance.view"), getLedgerSummary);
// Perform the side effect or state update expressed on the following line.
router.get("/statements", authorize("finance.view"), getFinancialStatements);
// Perform the side effect or state update expressed on the following line.
router.get("/ar-aging", authorize("finance.view"), getArAging);
// Perform the side effect or state update expressed on the following line.
router.get("/ap-aging", authorize("finance.view"), getApAging);
// Perform the side effect or state update expressed on the following line.
router.get("/cash-flow", authorize("finance.view"), getCashFlow);
// Perform the side effect or state update expressed on the following line.
router.get("/tax-control", authorize("finance.view"), getTaxControlReport);
// Perform the side effect or state update expressed on the following line.
router.get("/customer-ledger", authorize("finance.view"), getCustomerLedgerReport);
// Perform the side effect or state update expressed on the following line.
router.get("/supplier-ledger", authorize("finance.view"), getSupplierLedgerReport);
// Perform the side effect or state update expressed on the following line.
router.get("/profitability", authorize("finance.view"), getProfitabilityReport);
// Perform the side effect or state update expressed on the following line.
router.get("/exports/general-ledger.csv", authorize("finance.view"), exportGeneralLedgerCSV);
// Perform the side effect or state update expressed on the following line.
router.get("/exports/tax-control.csv", authorize("finance.view"), exportTaxControlCSV);
// Perform the side effect or state update expressed on the following line.
router.get("/subledgers", authorize("finance.view"), listSubledger);
// Perform the side effect or state update expressed on the following line.
router.post("/subledgers", authorize("finance.manage"), createSubledger);
// Perform the side effect or state update expressed on the following line.
router.post("/subledgers/:id/amortize", authorize("finance.manage"), amortizeSubledger);
// Perform the side effect or state update expressed on the following line.
router.post("/subledgers/:id/reverse", authorize("finance.manage"), reverseAccrual);
// Perform the side effect or state update expressed on the following line.
router.get("/reconciliation/transactions", authorize("finance.view"), listReconciliationTransactions);
// Perform the side effect or state update expressed on the following line.
router.post("/reconciliation/transactions", authorize("finance.manage"), createReconciliationTransaction);
// Perform the side effect or state update expressed on the following line.
router.post("/reconciliation/transactions/:id/match", authorize("finance.manage"), matchReconciliationTransaction);
// Perform the side effect or state update expressed on the following line.
router.post("/reconciliation/transactions/:id/exception", authorize("finance.manage"), markReconciliationException);
// Perform the side effect or state update expressed on the following line.
router.post("/operational-reconciliation", authorize("finance.manage"), reconcileOperationalAccounting);
// Perform the side effect or state update expressed on the following line.
router.get("/assets", authorize("finance.view"), listAssets);
// Perform the side effect or state update expressed on the following line.
router.post("/assets", authorize("finance.manage"), createAsset);
// Perform the side effect or state update expressed on the following line.
router.post("/assets/:id/depreciate", authorize("finance.manage"), postAssetDepreciation);
// Perform the side effect or state update expressed on the following line.
router.post("/assets/:id/dispose", authorize("finance.manage"), disposeAsset);
// Perform the side effect or state update expressed on the following line.
router.get("/budgets", authorize("finance.view"), listBudgets);
// Perform the side effect or state update expressed on the following line.
router.post("/budgets", authorize("finance.manage"), upsertBudget);
// Perform the side effect or state update expressed on the following line.
router.post("/budgets/:id/approve", authorize("finance.manage"), approveBudget);
// Perform the side effect or state update expressed on the following line.
router.get("/budgets-vs-actual", authorize("finance.view"), budgetVsActual);
// Perform the side effect or state update expressed on the following line.
router.get("/periods", authorize("finance.view"), listPeriods);
// Perform the side effect or state update expressed on the following line.
router.post("/periods/:period/close", authorize("finance.manage"), closePeriod);
// Perform the side effect or state update expressed on the following line.
router.post("/periods/:period/reopen", authorize("finance.manage"), reopenPeriod);
// Perform the side effect or state update expressed on the following line.
router.post("/periods/:year/year-end-close", authorize("finance.manage"), closeFinancialYear);
export default router;
