import express from "express";
import { authorize } from "../middleware/permissionMiddleware.js";
import { createAccount, createJournalEntry, getLedgerSummary, listAccounts, listJournalEntries, postJournalEntry, voidJournalEntry } from "../controllers/accountingController.js";
import { getFinancialStatements, getArAging, getApAging, getCashFlow } from "../controllers/accountingReportsController.js";

const router = express.Router();
router.get("/accounts", authorize("finance.view"), listAccounts);
router.post("/accounts", authorize("finance.manage"), createAccount);
router.get("/journal", authorize("finance.view"), listJournalEntries);
router.post("/journal", authorize("finance.manage"), createJournalEntry);
router.post("/journal/:id/post", authorize("finance.manage"), postJournalEntry);
router.post("/journal/:id/void", authorize("finance.manage"), voidJournalEntry);
router.get("/summary", authorize("finance.view"), getLedgerSummary);
router.get("/statements", authorize("finance.view"), getFinancialStatements);
router.get("/ar-aging", authorize("finance.view"), getArAging);
router.get("/ap-aging", authorize("finance.view"), getApAging);
router.get("/cash-flow", authorize("finance.view"), getCashFlow);
export default router;
