import AccountingReconciliation from "../models/AccountingReconciliation.js";
import JournalEntry from "../models/JournalEntry.js";
import ChartOfAccount from "../models/ChartOfAccount.js";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";

const money = (n) => Math.round(Number(n || 0) * 100) / 100;
const allowed = new Set(["bank", "mpesa", "card", "gateway", "cash", "tax", "supplier", "customer"]);

export const listReconciliationTransactions = async (req, res, next) => {
  try { requireTenantId(); const q = mergeTenantFilter(req, {}); if (req.query.sourceType && allowed.has(String(req.query.sourceType))) q.sourceType = String(req.query.sourceType); if (req.query.status) q.status = String(req.query.status); const rows = await AccountingReconciliation.find(q).sort({ transactionDate: -1, createdAt: -1 }).limit(500).populate("journalEntry", "entryNumber entryDate description lines").lean(); return res.json({ success: true, data: rows }); } catch (e) { next(e); }
};

export const createReconciliationTransaction = async (req, res, next) => {
  try {
    const tenantId = requireTenantId(); const b = req.body || {}; const sourceType = String(b.sourceType || "").toLowerCase(); const amount = money(b.amount);
    if (!allowed.has(sourceType) || !String(b.externalReference || "").trim() || amount <= 0) return res.status(400).json({ success: false, message: "Source type, external reference and positive amount are required." });
    const row = await AccountingReconciliation.create({ tenantId, sourceType, externalReference: String(b.externalReference).trim(), transactionDate: b.transactionDate || new Date(), amount, currency: String(b.currency || "KES").toUpperCase(), accountCode: String(b.accountCode || "").trim(), notes: String(b.notes || "").trim(), createdBy: req.user?._id || null });
    return res.status(201).json({ success: true, data: row });
  } catch (e) { if (e?.code === 11000) return res.status(409).json({ success: false, message: "This external reference is already reconciled for the tenant." }); next(e); }
};

export const matchReconciliationTransaction = async (req, res, next) => {
  try {
    const tenantId = requireTenantId(); const row = await AccountingReconciliation.findOne(mergeTenantFilter(req, { _id: req.params.id })); if (!row) return res.status(404).json({ success: false, message: "Reconciliation transaction not found." }); if (row.status === "matched") return res.status(409).json({ success: false, message: "Transaction is already matched." });
    const entry = await JournalEntry.findOne(mergeTenantFilter(req, { _id: req.body?.journalEntryId, status: "posted" })).lean(); if (!entry) return res.status(404).json({ success: false, message: "Posted journal entry not found." });
    const accountIds = (entry.lines || []).filter((line) => Number(line.debit || 0) > 0 || Number(line.credit || 0) > 0).map((line) => line.account); const accounts = await ChartOfAccount.find({ tenantId, _id: { $in: accountIds } }).select("code type").lean(); const accountMap = new Map(accounts.map((a) => [String(a._id), a]));
    const cashLines = (entry.lines || []).filter((line) => { const a = accountMap.get(String(line.account)); return a && ["1000", "1010", "1020", "1030"].includes(a.code); }); const matchedAmount = money(cashLines.reduce((sum, line) => sum + Number(line.debit || 0) - Number(line.credit || 0), 0));
    if (Math.abs(Math.abs(matchedAmount) - row.amount) > 0.01) return res.status(409).json({ success: false, message: "Reconciliation amount does not match the cash/bank movement in the selected journal entry.", expected: row.amount, journalMovement: Math.abs(matchedAmount) });
    row.journalEntry = entry._id; row.status = "matched"; row.matchedAt = new Date(); row.matchedBy = req.user?._id || null; await row.save(); return res.json({ success: true, data: row });
  } catch (e) { next(e); }
};

export const markReconciliationException = async (req, res, next) => {
  try { requireTenantId(); const row = await AccountingReconciliation.findOne(mergeTenantFilter(req, { _id: req.params.id })); if (!row) return res.status(404).json({ success: false, message: "Reconciliation transaction not found." }); row.status = "exception"; row.notes = String(req.body?.notes || row.notes || "Reconciliation exception").trim(); await row.save(); return res.json({ success: true, data: row }); } catch (e) { next(e); }
};
