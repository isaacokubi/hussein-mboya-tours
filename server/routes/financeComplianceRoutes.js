import express from "express";
import { getTaxProfile, upsertTaxProfile, listExpenses, createExpense, listNotes, createNote, getFinanceComplianceSummary } from "../controllers/financeComplianceController.js";

const router = express.Router();
router.get("/tax-profile", getTaxProfile);
router.put("/tax-profile", upsertTaxProfile);
router.get("/compliance-summary", getFinanceComplianceSummary);
router.get("/expenses", listExpenses);
router.post("/expenses", createExpense);
router.get("/notes", listNotes);
router.post("/notes", createNote);
export default router;
