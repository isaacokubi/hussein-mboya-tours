import express from "express";
import { getTaxProfile, upsertTaxProfile, getEtimsCredentialStatus, saveEtimsCredentials, listExpenses, createExpense, listNotes, createNote, queueNoteEtims, listEtimsSubmissions, getFinanceComplianceSummary } from "../controllers/financeComplianceController.js";
import { authorize } from "../middleware/permissionMiddleware.js";

const router = express.Router();
router.get("/tax-profile", authorize("finance.view"), getTaxProfile);
router.put("/tax-profile", authorize("finance.manage"), upsertTaxProfile);
router.get("/etims/credentials", authorize("finance.view"), getEtimsCredentialStatus);
router.put("/etims/credentials", authorize("finance.manage"), saveEtimsCredentials);
router.get("/compliance-summary", authorize("finance.view"), getFinanceComplianceSummary);
router.get("/expenses", authorize("finance.view"), listExpenses);
router.post("/expenses", authorize("finance.manage"), createExpense);
router.get("/notes", authorize("finance.view"), listNotes);
router.post("/notes", authorize("finance.manage"), createNote);
router.post("/notes/:id/queue", authorize("finance.manage"), queueNoteEtims);
router.get("/etims/submissions", authorize("finance.view"), listEtimsSubmissions);
export default router;
