import crypto from "crypto";
import mongoose from "mongoose";
import AccountingSubledger from "../models/AccountingSubledger.js";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import { postFinanceEntry } from "../services/financeLifecycleService.js";

const money = (n) => Math.round(Number(n || 0) * 100) / 100;
const allowed = new Set(["inventory", "payroll", "accrual", "prepayment", "fx"]);
const hashId = (value) => new mongoose.Types.ObjectId(crypto.createHash("sha256").update(String(value)).digest("hex").slice(0, 24));
const cashCode = (method) => { const m = String(method || "BANK").toUpperCase(); return m === "MPESA" ? "1020" : m === "CARD" ? "1030" : m === "CASH" ? "1000" : "1010"; };

const normalizeCurrency = (value) => String(value || "KES").trim().toUpperCase();
const validateCurrencyAndRate = (currency, rate) => {
  if (!/^[A-Z]{3}$/.test(currency)) return "Currency must be a valid three-letter ISO-style code.";
  if (!Number.isFinite(rate) || rate <= 0) return "Exchange rate to KES must be greater than zero.";
  if (currency === "KES" && rate !== 1) return "KES entries must use an exchange rate of 1.00.";
  if (currency !== "KES" && rate === 1) return "A valid explicit exchange rate to KES is required for non-KES entries.";
  return null;
};

export const listSubledger = async (req, res, next) => {
  try {
    requireTenantId();
    const q = mergeTenantFilter(req, {});
    if (req.query.type) {
      const type = String(req.query.type).toLowerCase();
      if (allowed.has(type)) q.type = type;
    }
    const rows = await AccountingSubledger.find(q)
      .populate({ path: "journalEntry", select: "entryNumber reference status date" })
      .sort({ transactionDate: -1, createdAt: -1 })
      .limit(500)
      .lean();

    // Normalise legacy records at read time so the UI never hides a valid
    // transaction simply because older documents did not persist derived fields.
    const data = rows.map((row) => {
      const amount = money(row.amount);
      const currency = normalizeCurrency(row.currency);
      const exchangeRate = Number.isFinite(Number(row.exchangeRate)) && Number(row.exchangeRate) > 0
        ? Number(row.exchangeRate)
        : 1;
      const baseAmount = Number.isFinite(Number(row.baseAmount)) && Number(row.baseAmount) >= 0
        ? money(row.baseAmount)
        : money(amount * exchangeRate);
      const journalEntry = row.journalEntry || null;
      return {
        ...row,
        amount,
        currency,
        exchangeRate,
        baseAmount,
        quantity: Number.isFinite(Number(row.quantity)) ? Number(row.quantity) : 0,
        unitCost: money(row.unitCost),
        accountCode: String(row.accountCode || "").trim(),
        contraAccountCode: String(row.contraAccountCode || "").trim(),
        status: row.status || "draft",
        journalEntry,
        journalReference: journalEntry?.entryNumber || journalEntry?.reference || null,
      };
    });

    const summary = {
      count: data.length,
      baseTotal: money(data.reduce((sum, row) => sum + Number(row.baseAmount || 0), 0)),
      foreign: data.filter((row) => row.currency !== "KES").length,
    };

    return res.json({ success: true, data, summary });
  } catch (e) { next(e); }
};

const buildPosting = (row, body = {}) => {
  const amount = money(row.baseAmount || row.amount);
  const type = row.type;
  const meta = row.metadata || {};
  if (amount <= 0) throw new Error("Subledger base amount must be positive.");

  if (type === "inventory") {
    const action = String(body.transactionType || meta.transactionType || (meta.direction === "out" ? "issue" : "receipt")).toLowerCase();
    if (action === "issue" || action === "cogs") return { sourceType: "inventory_cogs", lines: [{ code: row.accountCode || "5000", debit: amount, credit: 0, description: "Inventory issue / COGS" }, { code: row.contraAccountCode || "1200", debit: 0, credit: amount, description: "Inventory consumed" }] };
    return { sourceType: "inventory_receipt", lines: [{ code: row.accountCode || "1200", debit: amount, credit: 0, description: "Inventory received" }, { code: row.contraAccountCode || cashCode(meta.paymentMethod), debit: 0, credit: amount, description: "Inventory funding / payable" }] };
  }
  if (type === "payroll") return { sourceType: "payroll_journal", lines: [{ code: row.accountCode || "5200", debit: amount, credit: 0, description: "Payroll expense" }, { code: row.contraAccountCode || "2140", debit: 0, credit: amount, description: "Payroll liabilities" }] };
  if (type === "accrual") return { sourceType: "accrual", lines: [{ code: row.accountCode || "5200", debit: amount, credit: 0, description: "Accrued expense" }, { code: row.contraAccountCode || "2000", debit: 0, credit: amount, description: "Accrued liability" }] };
  if (type === "prepayment") return { sourceType: "prepayment", lines: [{ code: row.accountCode || "1300", debit: amount, credit: 0, description: "Prepayment asset" }, { code: row.contraAccountCode || cashCode(meta.paymentMethod), debit: 0, credit: amount, description: "Prepayment settlement" }] };
  if (type === "fx") {
    const direction = String(body.direction || meta.direction || "in").toLowerCase();
    return direction === "out"
      ? { sourceType: "fx_loss", lines: [{ code: "7010", debit: amount, credit: 0, description: "Foreign exchange loss" }, { code: row.contraAccountCode || "1100", debit: 0, credit: amount, description: "FX revaluation" }] }
      : { sourceType: "fx_gain", lines: [{ code: row.contraAccountCode || "1100", debit: amount, credit: 0, description: "FX revaluation" }, { code: "7000", debit: 0, credit: amount, description: "Foreign exchange gain" }] };
  }
  throw new Error("Unsupported accounting subledger type.");
};

export const createSubledger = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const b = req.body || {};
    const type = String(b.type || "").trim().toLowerCase();
    const amount = money(b.amount);
    const currency = normalizeCurrency(b.currency);
    const rate = Number(b.exchangeRate);
    const quantity = Number(b.quantity || 0);
    const unitCost = money(b.unitCost);
    const direction = String(b.direction || "in").toLowerCase();

    if (!allowed.has(type)) return res.status(400).json({ success: false, message: "Unsupported accounting subledger type." });
    if (!b.reference || !String(b.reference).trim()) return res.status(400).json({ success: false, message: "Reference is required." });
    if (!b.description || !String(b.description).trim()) return res.status(400).json({ success: false, message: "Description is required." });
    if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ success: false, message: "Amount must be greater than zero." });
    const currencyError = validateCurrencyAndRate(currency, rate);
    if (currencyError) return res.status(400).json({ success: false, message: currencyError });
    if (type === "inventory" && (!Number.isFinite(quantity) || quantity <= 0)) return res.status(400).json({ success: false, message: "Inventory quantity must be greater than zero." });
    if (type === "inventory" && unitCost <= 0) return res.status(400).json({ success: false, message: "Inventory unit cost must be greater than zero." });
    if (!["in", "out"].includes(direction)) return res.status(400).json({ success: false, message: "Direction must be in or out." });

    const baseAmount = money(amount * rate);
    const metadata = { ...(b.metadata || {}), direction };
    const row = await AccountingSubledger.create({
      tenantId,
      type,
      reference: String(b.reference).trim(),
      transactionDate: b.transactionDate || new Date(),
      description: String(b.description).trim(),
      amount,
      currency,
      exchangeRate: rate,
      baseAmount,
      quantity: Number.isFinite(quantity) ? quantity : 0,
      unitCost,
      accountCode: String(b.accountCode || "").trim(),
      contraAccountCode: String(b.contraAccountCode || "").trim(),
      metadata,
      createdBy: req.user?._id || null
    });

    try {
      const posting = buildPosting(row, b);
      const entry = await postFinanceEntry({ tenantId, sourceType: posting.sourceType, sourceId: row._id, description: row.description, reference: row.reference, date: row.transactionDate, lines: posting.lines });
      row.journalEntry = entry?._id || null;
      row.status = "posted";
      row.postedBy = req.user?._id || null;
      row.postedAt = new Date();
      await row.save();
      return res.status(201).json({ success: true, data: row });
    } catch (postingError) {
      await AccountingSubledger.deleteOne({ _id: row._id, tenantId });
      throw postingError;
    }
  } catch (e) {
    if (e?.code === 11000) return res.status(409).json({ success: false, message: "This subledger reference already exists for the tenant." });
    next(e);
  }
};

export const amortizeSubledger = async (req, res, next) => {
  try {
    const tenantId = requireTenantId(); const row = await AccountingSubledger.findOne(mergeTenantFilter(req, { _id: req.params.id })); if (!row) return res.status(404).json({ success: false, message: "Subledger record not found." }); if (row.type !== "prepayment") return res.status(400).json({ success: false, message: "Only prepayments can be amortized here." });
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
