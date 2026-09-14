import crypto from "crypto";
import mongoose from "mongoose";
import AccountingSubledger from "../models/AccountingSubledger.js";
import JournalEntry from "../models/JournalEntry.js";
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

const JOURNAL_SUBLEDGER_TYPES = {
  inventory_receipt: "inventory",
  inventory_cogs: "inventory",
  payroll_journal: "payroll",
  payroll: "payroll",
  accrual: "accrual",
  accrual_reversal: "accrual",
  expense_accrual: "accrual",
  supplier_payable: "accrual",
  prepayment: "prepayment",
  prepayment_amortization: "prepayment",
  fx_gain: "fx",
  fx_loss: "fx",
};

const journalAmount = (entry) => money((entry?.lines || []).reduce((sum, line) => sum + Number(line.debit || 0), 0));

const classifyJournal = (entry) => {
  const explicit = JOURNAL_SUBLEDGER_TYPES[String(entry?.sourceType || "").toLowerCase()];
  if (explicit) return explicit;
  const codes = new Set((entry?.lines || []).map((line) => String(line?.account?.code || "").trim()));
  if (codes.has("7000") || codes.has("7010")) return "fx";
  if (codes.has("1300")) return "prepayment";
  if (codes.has("2140")) return "payroll";
  if (codes.has("1200")) return "inventory";
  if (codes.has("2000") && ["5000", "5010", "5020", "5100", "5200"].some((code) => codes.has(code))) return "accrual";
  return null;
};

const journalFallbackRows = async ({ tenantId, type }) => {
  const entries = await JournalEntry.find({ tenantId, status: { $nin: ["void", "voided"] } })
    .populate({ path: "lines.account", select: "code" })
    .sort({ entryDate: -1, createdAt: -1 })
    .limit(1000)
    .lean();

  return entries.map((entry) => {
    const mappedType = classifyJournal(entry);
    if (!mappedType || (type && mappedType !== type)) return null;
    const amount = journalAmount(entry);
    if (amount <= 0) return null;
    const codes = (entry.lines || []).map((line) => String(line?.account?.code || "").trim()).filter(Boolean);
    const journalDate = entry.entryDate || entry.createdAt;
    return {
      _id: `journal-${entry._id}`,
      tenantId,
      type: mappedType,
      reference: entry.reference || entry.entryNumber || String(entry._id),
      transactionDate: journalDate,
      description: entry.description || "Operational accounting journal entry",
      amount,
      currency: "KES",
      exchangeRate: 1,
      baseAmount: amount,
      quantity: null,
      unitCost: null,
      accountCode: codes[0] || "",
      contraAccountCode: codes[1] || "",
      status: entry.status || "posted",
      journalEntry: { _id: entry._id, entryNumber: entry.entryNumber || null, reference: entry.reference || null, status: entry.status || "posted", date: journalDate },
      journalReference: entry.entryNumber || entry.reference || null,
      metadata: { source: "journal", sourceType: entry.sourceType || "account-pattern", sourceId: entry.sourceId || null },
      isLinkedJournalRecord: true,
    };
  }).filter(Boolean);
};

export const listSubledger = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const q = mergeTenantFilter(req, {});
    const requestedType = req.query.type ? String(req.query.type).toLowerCase() : "";
    if (requestedType && requestedType !== "all" && allowed.has(requestedType)) q.type = requestedType;

    const rows = await AccountingSubledger.find(q)
      .populate({ path: "journalEntry", select: "entryNumber reference status date entryDate" })
      .sort({ transactionDate: -1, createdAt: -1 })
      .limit(500)
      .lean();

    const data = rows.map((row) => {
      const amount = money(row.amount);
      const currency = normalizeCurrency(row.currency);
      const exchangeRate = Number.isFinite(Number(row.exchangeRate)) && Number(row.exchangeRate) > 0 ? Number(row.exchangeRate) : 1;
      const baseAmount = Number.isFinite(Number(row.baseAmount)) && Number(row.baseAmount) >= 0 ? money(row.baseAmount) : money(amount * exchangeRate);
      const journalEntry = row.journalEntry || null;
      return { ...row, amount, currency, exchangeRate, baseAmount, quantity: Number.isFinite(Number(row.quantity)) ? Number(row.quantity) : null, unitCost: row.unitCost === null || row.unitCost === undefined ? null : money(row.unitCost), accountCode: String(row.accountCode || "").trim(), contraAccountCode: String(row.contraAccountCode || "").trim(), status: row.status || "draft", journalEntry, journalReference: journalEntry?.entryNumber || journalEntry?.reference || null, isLinkedJournalRecord: false };
    });

    const fallbackRows = await journalFallbackRows({ tenantId, type: requestedType === "all" ? "" : requestedType });
    const representedJournalIds = new Set(data.map((row) => row.journalEntry?._id ? String(row.journalEntry._id) : "").filter(Boolean));
    const linkedRows = fallbackRows.filter((row) => !representedJournalIds.has(String(row.journalEntry._id)));
    const combined = [...data, ...linkedRows].sort((a, b) => new Date(b.transactionDate || 0) - new Date(a.transactionDate || 0)).slice(0, 500);

    const summary = {
      count: combined.length,
      baseTotal: money(combined.reduce((sum, row) => sum + Number(row.baseAmount || 0), 0)),
      foreign: combined.filter((row) => row.currency !== "KES" && Number(row.exchangeRate) > 0 && Number(row.exchangeRate) !== 1).length,
      storedSubledgers: data.length,
      linkedJournalRecords: linkedRows.length,
    };
    return res.json({ success: true, data: combined, summary });
  } catch (e) { next(e); }
};

const buildPosting = (row, body = {}) => {
  const amount = money(row.baseAmount || row.amount); const type = row.type; const meta = row.metadata || {};
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
    return direction === "out" ? { sourceType: "fx_loss", lines: [{ code: "7010", debit: amount, credit: 0, description: "Foreign exchange loss" }, { code: row.contraAccountCode || "1100", debit: 0, credit: amount, description: "FX revaluation" }] } : { sourceType: "fx_gain", lines: [{ code: row.contraAccountCode || "1100", debit: amount, credit: 0, description: "FX revaluation" }, { code: "7000", debit: 0, credit: amount, description: "Foreign exchange gain" }] };
  }
  throw new Error("Unsupported accounting subledger type.");
};

export const createSubledger = async (req, res, next) => {
  try {
    const tenantId = requireTenantId(); const b = req.body || {}; const type = String(b.type || "").trim().toLowerCase(); const amount = money(b.amount); const currency = normalizeCurrency(b.currency); const rate = Number(b.exchangeRate); const quantity = Number(b.quantity || 0); const unitCost = money(b.unitCost); const direction = String(b.direction || "in").toLowerCase();
    if (!allowed.has(type)) return res.status(400).json({ success: false, message: "Unsupported accounting subledger type." });
    if (!b.reference || !String(b.reference).trim()) return res.status(400).json({ success: false, message: "Reference is required." });
    if (!b.description || !String(b.description).trim()) return res.status(400).json({ success: false, message: "Description is required." });
    if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ success: false, message: "Amount must be greater than zero." });
    const currencyError = validateCurrencyAndRate(currency, rate); if (currencyError) return res.status(400).json({ success: false, message: currencyError });
    if (type === "inventory" && (!Number.isFinite(quantity) || quantity <= 0)) return res.status(400).json({ success: false, message: "Inventory quantity must be greater than zero." });
    if (type === "inventory" && unitCost <= 0) return res.status(400).json({ success: false, message: "Inventory unit cost must be greater than zero." });
    if (!["in", "out"].includes(direction)) return res.status(400).json({ success: false, message: "Direction must be in or out." });
    const baseAmount = money(amount * rate); const metadata = { ...(b.metadata || {}), direction };
    const row = await AccountingSubledger.create({ tenantId, type, reference: String(b.reference).trim(), transactionDate: b.transactionDate || new Date(), description: String(b.description).trim(), amount, currency, exchangeRate: rate, baseAmount, quantity: Number.isFinite(quantity) ? quantity : 0, unitCost, accountCode: String(b.accountCode || "").trim(), contraAccountCode: String(b.contraAccountCode || "").trim(), metadata, createdBy: req.user?._id || null });
    try {
      const posting = buildPosting(row, b); const entry = await postFinanceEntry({ tenantId, sourceType: posting.sourceType, sourceId: row._id, description: row.description, reference: row.reference, date: row.transactionDate, lines: posting.lines });
      row.journalEntry = entry?._id || null; row.status = "posted"; row.postedBy = req.user?._id || null; row.postedAt = new Date(); await row.save(); return res.status(201).json({ success: true, data: row });
    } catch (postingError) { await AccountingSubledger.deleteOne({ _id: row._id, tenantId }); throw postingError; }
  } catch (e) { if (e?.code === 11000) return res.status(409).json({ success: false, message: "This subledger reference already exists for the tenant." }); next(e); }
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
    const tenantId = requireTenantId(); const row = await AccountingSubledger.findOne(mergeTenantFilter(req, { _id: req.params.id })); if (!row) return res.status(404).json({ status: 404, success: false, message: "Subledger record not found." }); if (row.type !== "accrual") return res.status(400).json({ success: false, message: "Only accruals can be reversed here." });
    const amount = money(req.body?.amount || row.baseAmount); if (amount <= 0 || amount > money(row.baseAmount)) return res.status(400).json({ success: false, message: "Invalid accrual reversal amount." });
    const posting = await postFinanceEntry({ tenantId, sourceType: "accrual_reversal", sourceId: hashId(`${row._id}:reverse:${req.body?.reference || ""}:${amount}`), description: `Accrual reversal: ${row.description}`, reference: String(req.body?.reference || `REV-${row.reference}`).trim(), date: req.body?.transactionDate || new Date(), lines: [{ code: "2000", debit: amount, credit: 0, description: "Accrued liability reversal" }, { code: row.accountCode || "5200", debit: 0, credit: amount, description: "Accrual reversal" }] });
    row.baseAmount = money(row.baseAmount - amount); row.status = row.baseAmount <= 0 ? "settled" : "posted"; await row.save(); return res.json({ success: true, data: row, journalEntry: posting?._id || null });
  } catch (e) { next(e); }
};