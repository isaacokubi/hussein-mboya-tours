import express from "express";
import {
  getTaxProfile,
  upsertTaxProfile,
  listExpenses,
  createExpense,
  listNotes,
  createNote,
  getFinanceComplianceSummary,
} from "../controllers/financeComplianceController.js";
import { authorize } from "../middleware/permissionMiddleware.js";

const router = express.Router();

router.get("/tax-profile", authorize("finance.view"), getTaxProfile);
router.put("/tax-profile", authorize("finance.manage"), upsertTaxProfile);
router.get("/compliance-summary", authorize("finance.view"), getFinanceComplianceSummary);
router.get("/expenses", authorize("finance.view"), listExpenses);
router.post("/expenses", authorize("finance.manage"), createExpense);
router.get("/notes", authorize("finance.view"), listNotes);
router.post("/notes", authorize("finance.manage"), createNote);

export default router;
