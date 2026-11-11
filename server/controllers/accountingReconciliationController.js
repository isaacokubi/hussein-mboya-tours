/**
 * Purpose: accounting Reconciliation Controller HTTP controller. Main declarations: money, listReconciliationTransactions, createReconciliationTransaction, matchReconciliationTransaction, markReconciliationException.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import AccountingReconciliation from "../models/AccountingReconciliation.js";
// Load ../models/JournalEntry.js so this module can use its exported dependencies.
import JournalEntry from "../models/JournalEntry.js";
// Load ../models/ChartOfAccount.js so this module can use its exported dependencies.
import ChartOfAccount from "../models/ChartOfAccount.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";

// Declare money for use by the surrounding module or function.
const money = (n) => Math.round(Number(n || 0) * 100) / 100;
// Declare allowed for use by the surrounding module or function.
const allowed = new Set(["bank", "mpesa", "card", "gateway", "cash", "tax", "supplier", "customer"]);

// Declare listReconciliationTransactions for use by the surrounding module or function.
export const listReconciliationTransactions = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try { requireTenantId(); const q = mergeTenantFilter(req, {}); if (req.query.sourceType && allowed.has(String(req.query.sourceType))) q.sourceType = String(req.query.sourceType); if (req.query.status) q.status = String(req.query.status); const rows = await AccountingReconciliation.find(q).sort({ transactionDate: -1, createdAt: -1 }).limit(500).populate("journalEntry", "entryNumber entryDate description lines").lean(); return res.json({ success: true, data: rows }); } catch (e) { next(e); }
};

// Declare createReconciliationTransaction for use by the surrounding module or function.
export const createReconciliationTransaction = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId(); const b = req.body || {}; const sourceType = String(b.sourceType || "").toLowerCase(); const amount = money(b.amount);
    // Check the condition (!allowed.has(sourceType) || !String(b.externalReference || "").trim() ) and run the matching branch.
    if (!allowed.has(sourceType) || !String(b.externalReference || "").trim() || amount <= 0) return res.status(400).json({ success: false, message: "Source type, external reference and positive amount are required." });
    // Declare row for use by the surrounding module or function.
    const row = await AccountingReconciliation.create({ tenantId, sourceType, externalReference: String(b.externalReference).trim(), transactionDate: b.transactionDate || new Date(), amount, currency: String(b.currency || "KES").toUpperCase(), accountCode: String(b.accountCode || "").trim(), notes: String(b.notes || "").trim(), createdBy: req.user?._id || null });
    // Return the result of res.status(201).json() to the caller.
    return res.status(201).json({ success: true, data: row });
  } catch (e) { if (e?.code === 11000) return res.status(409).json({ success: false, message: "This external reference is already reconciled for the tenant." }); next(e); }
};

// Declare matchReconciliationTransaction for use by the surrounding module or function.
export const matchReconciliationTransaction = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId(); const row = await AccountingReconciliation.findOne(mergeTenantFilter(req, { _id: req.params.id })); if (!row) return res.status(404).json({ success: false, message: "Reconciliation transaction not found." }); if (row.status === "matched") return res.status(409).json({ success: false, message: "Transaction is already matched." });
    // Declare entry for use by the surrounding module or function.
    const entry = await JournalEntry.findOne(mergeTenantFilter(req, { _id: req.body?.journalEntryId, status: "posted" })).lean(); if (!entry) return res.status(404).json({ success: false, message: "Posted journal entry not found." });
    // Declare accountIds for use by the surrounding module or function.
    const accountIds = (entry.lines || []).filter((line) => Number(line.debit || 0) > 0 || Number(line.credit || 0) > 0).map((line) => line.account); const accounts = await ChartOfAccount.find({ tenantId, _id: { $in: accountIds } }).select("code type").lean(); const accountMap = new Map(accounts.map((a) => [String(a._id), a]));
    // Declare cashLines for use by the surrounding module or function.
    const cashLines = (entry.lines || []).filter((line) => { const a = accountMap.get(String(line.account)); return a && ["1000", "1010", "1020", "1030"].includes(a.code); }); const matchedAmount = money(cashLines.reduce((sum, line) => sum + Number(line.debit || 0) - Number(line.credit || 0), 0));
    // Check the condition (Math.abs(Math.abs(matchedAmount) - row.amount) > 0.01) and run the matching branch.
    if (Math.abs(Math.abs(matchedAmount) - row.amount) > 0.01) return res.status(409).json({ success: false, message: "Reconciliation amount does not match the cash/bank movement in the selected journal entry.", expected: row.amount, journalMovement: Math.abs(matchedAmount) });
    // Perform the side effect or state update expressed on the following line.
    row.journalEntry = entry._id; row.status = "matched"; row.matchedAt = new Date(); row.matchedBy = req.user?._id || null; await row.save(); return res.json({ success: true, data: row });
  } catch (e) { next(e); }
};

// Declare markReconciliationException for use by the surrounding module or function.
export const markReconciliationException = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try { requireTenantId(); const row = await AccountingReconciliation.findOne(mergeTenantFilter(req, { _id: req.params.id })); if (!row) return res.status(404).json({ success: false, message: "Reconciliation transaction not found." }); row.status = "exception"; row.notes = String(req.body?.notes || row.notes || "Reconciliation exception").trim(); await row.save(); return res.json({ success: true, data: row }); } catch (e) { next(e); }
};
