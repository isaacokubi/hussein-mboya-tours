import crypto from "crypto";
import AccountingSubledger from "../models/AccountingSubledger.js";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import { postFinanceEntry } from "../services/financeLifecycleService.js";

const money = (n) => Math.round(Number(n || 0) * 100) / 100;
const allowed = new Set(["inventory", "payroll", "accrual", "prepayment", "fx"]);
const hashId = (value) => crypto.createHash("sha256").update(String(value)).digest("hex").slice(0, 24);
const cashCode = (method) => { const m = String(method || "BANK").toUpperCase(); return m === "MPESA" ? "1020" : m === "CARD" ? "1030" : m === "CASH" ? "1000" : "1010"; };

export const listSubledger = async (req, res, next) => {
  try { requireTenantId(); const q = mergeTenantFilter(req, {}); if (req.query.type && allowed.has(String(req.query.type).toLowerCase())) q.type = String(req.query.type).toLowerCase(); const rows = await AccountingSubledger.find(q).sort({ transactionDate: -1, createdAt: -1 }).limit(500).lean(); return res.json({ success: true, data: rows }); } catch (e) { next(e); }
};

const buildPosting = (row, body = {}) => {
  const amount = money(row.baseAmount || row.amount); const type = row.type; const meta = row.metadata || {};
  if (amount <= 0) throw new Error("Subledger base amount must be positive.");
  if (type === "inventory") {
    const action = String(body.transactionType || meta.transactionType || "receipt").toLowerCase();
    if (action === "issue" || action === "cogs") return { sourceType: "inventory_cogs", lines: [{ code: row.accountCode || "5000", debit: amount, credit: 0, description: "Inventory issue / COGS" }, { code: row.contraAccountCode || "1200", debit: 0, credit: amount, description: "Inventory consumed" }] };
    return { sourceType: "inventory_receipt", lines: [{ code: row.accountCode || "1200", debit: amount, credit: 0, description: "Inventory received" }, { code: row.contraAccountCode || cashCode(meta.paymentMethod), debit: 0, credit: amount, description: "Inventory funding / payable" }] };
  }
  if (type === "payroll") return { sourceType: "payroll_journal", lines: [{ code: row.accountCode || "5200", debit: amount, credit: 0, description: "Payroll expense" }, { code: row.contraAccountCode || "2140", debit: 0, credit: amount, description: "Payroll liabilities" }] };
  if (type === "accrual") return { sourceType: "accrual", lines: [{ code: row.accountCode || "5200", debit: amount, credit: 0, description: "Accrued expense" }, { code: row.contraAccountCode || "2000", debit: 0, credit: amount, description: "Accrued liability" }] };
  if (type === "prepayment") return { sourceType: "prepayment", lines: [{ code: row.accountCode || "1300", debit: amount, credit: 0, description: "Prepayment asset" }, { code: row.contraAccountCode || cashCode(meta.paymentMethod), debit: 0, credit: amount, description: "Prepayment settlement" }] };
  if (type === "fx") {
    const direction = String(body.direction || meta.direction || "gain").toLowerCase();
    return direction === "loss" ? { sourceType: "fx_loss", lines: [{ code: "7010", debit: amount, credit: 0, description: "Foreign exchange loss" }, { code: row.contraAccountCode || "1100", debit: 0, credit: amount, description: "FX revaluation" }] } : { sourceType: "fx_gain", lines: [{ code: row.contraAccountCode || "1100", debit: amount, credit: 0, description: "FX revaluation" }, { code: "7000", debit: 0, credit: amount, description: "Foreign exchange gain" }] };
  }
  throw new Error("Unsupported accounting subledger type.");
};

export const createSubledger = async (req, res, next) => {
  try {
    const tenantId = requireTenantId(); const b = req.body || {}; const type = String(b.type || "").trim().toLowerCase(); const amount = money(b.amount); const rate = Number(b.exchangeRate || 1); const quantity = Number(b.quantity || 0);
    if (!allowed.has(type)) return res.status(400).json({ success: false, message: "Unsupported accounting subledger type." });
    if (!b.reference || !b.description || amount <= 0 || !Number.isFinite(rate) || rate <= 0) return res.status(400).json({ success: false, message: "Reference, description, positive amount and exchange rate are required." });
    if (type === "inventory" && quantity < 0) return res.status(400).json({ success: false, message: "Inventory quantity cannot be negative." });
    const baseAmount = money(amount * rate); const metadata = b.metadata || {};
    const row = await AccountingSubledger.create({ tenantId, type, reference: String(b.reference).trim(), transactionDate: b.transactionDate || new Date(), description: String(b.description).trim(), amount, currency: String(b.currency || "KES").toUpperCase(), exchangeRate: rate, baseAmount, quantity, unitCost: money(b.unitCost), accountCode: String(b.accountCode || "").trim(), contraAccountCode: String(b.contraAccountCode || "").trim(), metadata, createdBy: req.user?._id || null });
    const posting = buildPosting(row, b); const entry = await postFinanceEntry({ tenantId, sourceType: posting.sourceType, sourceId: row._id, description: row.description, reference: row.reference, date: row.transactionDate, lines: posting.lines });
    row.journalEntry = entry?._id || null; row.status = "posted"; row.postedBy = req.user?._id || null; row.postedAt = new Date(); await row.save();
    return res.status(201).json({ success: true, data: row });
  } catch (e) { if (e?.code === 11000) return res.status(409).json({ success: false, message: "This subledger reference already exists for the tenant." }); next(e); }
};

export const amortizeSubledger = async (req, res, next) => {
  try {
    const tenantId = requireTenantId(); const row = await AccountingSubledger.findOne(mergeTenantFilter(req, { _id: req.params.id })); if (!row) return res.status(404).json({ success: false, message: "Subledger record not found." });
    if (row.type !== "prepayment") return res.status(400).json({ success: false, message: "Only prepayments can be amortized here." });
    const amount = money(req.body?.amount); if (amount <= 0 || amount > money(row.baseAmount)) return res.status(400).json({ success: false, message: "Amortization amount must be positive and cannot exceed the prepayment balance." });
    const posting = await postFinanceEntry({ tenantId, sourceType: "prepayment_amortization", sourceId: hashId(`${row._id}:${req.body?.reference || ""}:${amount}`), description: `Prepayment amortization: ${row.description}`, reference: String(req.body?.reference || `AMORT-${row.reference}`).trim(), date: req.body?.transactionDate || new Date(), lines: [{ code: row.accountCode || "5200", debit: amount, credit: 0, description: "Expense recognized from prepayment" }, { code: "1300", debit: 0, credit: amount, description: "Prepayment amortization" }] });
    row.baseAmount = money(row.baseAmount - amount); row.status = row.baseAmount <= 0 ? "settled" : "posted"; await row.save(); return res.json({ success: true, data: row, journalEntry: posting?._id || null });
  } catch (e) { next(e); }
};

export const reverseAccrual = async (req, res, next) => {
  try {
    const tenantId = requireTenantId(); const row = await AccountingSubledger.findOne(mergeTenantFilter(req, { _id: req.params.id })); if (!row) return res.status(404).json({ success: false, message: "Subledger record not found." }); if (row.type !== "accrual") return res.status(400).json({ success: false, message: "Only accruals can be reversed here." });
    const amount = money(req.body?.amount || row.baseAmount); if (amount <= 0 || amount > money(row.baseAmount)) return res.status(400).json({ success: false, message: "Invalid accrual reversal amount." });
    const posting = await postFinanceEntry({ tenantId, sourceType: "accrual_reversal", sourceId: hashId(`${row._id}:reverse:${req.body?.reference || ""}:${amount}`), description: `Accrual reversal: ${row.description}`, reference: String(req.body?.reference || `REV-${row.reference}`).trim(), date: req.body?.transactionDate || new Date(), lines: [{ code: "2000", debit: amount, credit: 0, description: "Accrued liability reversal" }, { code: row.accountCode || "5200", debit: 0, credit: amount, description: "Accrued expense reversal" }] });
    row.baseAmount = money(row.baseAmount - amount); row.status = row.baseAmount <= 0 ? "reversed" : "posted"; await row.save(); return res.json({ success: true, data: row, journalEntry: posting?._id || null });
  } catch (e) { next(e); }
};
