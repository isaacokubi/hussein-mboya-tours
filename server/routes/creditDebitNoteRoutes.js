import express from "express";
import { resolveTenant } from "../middleware/tenantMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";
import { listCreditDebitNotes, createCreditDebitNote, issueCreditDebitNote, cancelCreditDebitNote } from "../controllers/creditDebitNoteController.js";

const router = express.Router();
router.use(resolveTenant, protect);
router.get("/", authorize("finance.view"), listCreditDebitNotes);
router.post("/", authorize("finance.manage"), createCreditDebitNote);
router.post("/:id/issue", authorize("finance.manage"), issueCreditDebitNote);
router.post("/:id/cancel", authorize("finance.manage"), cancelCreditDebitNote);
export default router;
