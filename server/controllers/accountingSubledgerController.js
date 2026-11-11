/**
 * Purpose: accounting Subledger Controller HTTP controller. Main declarations: money, hashId, cashCode, normalizeCurrency, validateCurrencyAndRate.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import crypto from "crypto";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../models/AccountingSubledger.js so this module can use its exported dependencies.
import AccountingSubledger from "../models/AccountingSubledger.js";
// Load ../models/JournalEntry.js so this module can use its exported dependencies.
import JournalEntry from "../models/JournalEntry.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../services/financeLifecycleService.js so this module can use its exported dependencies.
import { postFinanceEntry } from "../services/financeLifecycleService.js";

// Declare money for use by the surrounding module or function.
const money = (n) => Math.round(Number(n || 0) * 100) / 100;
// Declare allowed for use by the surrounding module or function.
const allowed = new Set(["inventory", "payroll", "accrual", "prepayment", "fx"]);
// Declare hashId for use by the surrounding module or function.
const hashId = (value) => new mongoose.Types.ObjectId(crypto.createHash("sha256").update(String(value)).digest("hex").slice(0, 24));
// Declare cashCode for use by the surrounding module or function.
const cashCode = (method) => { const m = String(method || "BANK").toUpperCase(); return m === "MPESA" ? "1020" : m === "CARD" ? "1030" : m === "CASH" ? "1000" : "1010"; };

// Declare normalizeCurrency for use by the surrounding module or function.
const normalizeCurrency = (value) => String(value || "KES").trim().toUpperCase();
// Declare validateCurrencyAndRate for use by the surrounding module or function.
const validateCurrencyAndRate = (currency, rate) => {
  // Check the condition (!/^[A-Z]{3}$/.test(currency)) and run the matching branch.
  if (!/^[A-Z]{3}$/.test(currency)) return "Currency must be a valid three-letter ISO-style code.";
  // Check the condition (!Number.isFinite(rate) || rate <= 0) and run the matching branch.
  if (!Number.isFinite(rate) || rate <= 0) return "Exchange rate to KES must be greater than zero.";
  // Check the condition (currency === "KES" && rate !== 1) and run the matching branch.
  if (currency === "KES" && rate !== 1) return "KES entries must use an exchange rate of 1.00.";
  // Check the condition (currency !== "KES" && rate === 1) and run the matching branch.
  if (currency !== "KES" && rate === 1) return "A valid explicit exchange rate to KES is required for non-KES entries.";
  // Return the expression shown below to the caller.
  return null;
};

// Declare JOURNAL_SUBLEDGER_TYPES for use by the surrounding module or function.
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

// Declare journalAmount for use by the surrounding module or function.
const journalAmount = (entry) => money((entry?.lines || []).reduce((sum, line) => sum + Number(line.debit || 0), 0));

// Declare classifyJournal for use by the surrounding module or function.
const classifyJournal = (entry) => {
  // Declare explicit for use by the surrounding module or function.
  const explicit = JOURNAL_SUBLEDGER_TYPES[String(entry?.sourceType || "").toLowerCase()];
  // Check the condition (explicit) and run the matching branch.
  if (explicit) return explicit;
  // Declare codes for use by the surrounding module or function.
  const codes = new Set((entry?.lines || []).map((line) => String(line?.account?.code || "").trim()));
  // Check the condition (codes.has("7000") || codes.has("7010")) and run the matching branch.
  if (codes.has("7000") || codes.has("7010")) return "fx";
  // Check the condition (codes.has("1300")) and run the matching branch.
  if (codes.has("1300")) return "prepayment";
  // Check the condition (codes.has("2140")) and run the matching branch.
  if (codes.has("2140")) return "payroll";
  // Check the condition (codes.has("1200")) and run the matching branch.
  if (codes.has("1200")) return "inventory";
  // Check the condition (codes.has("2000") && ["5000", "5010", "5020", "5100", "5200"].some((co) and run the matching branch.
  if (codes.has("2000") && ["5000", "5010", "5020", "5100", "5200"].some((code) => codes.has(code))) return "accrual";
  // Return the expression shown below to the caller.
  return null;
};

// Declare journalFallbackRows for use by the surrounding module or function.
const journalFallbackRows = async ({ tenantId, type }) => {
  // Declare entries for use by the surrounding module or function.
  const entries = await JournalEntry.find({ tenantId, status: { $nin: ["void", "voided"] } })
    .populate({ path: "lines.account", select: "code" })
    .sort({ entryDate: -1, createdAt: -1 })
    .limit(1000)
    .lean();

  // Return the result of entries.map((entry) => {     const mappedType = classifyJournal(entry);     if (!mappedType || (type && mappedType !== type)) return null;     const amount = journalAmount(entry);     if (amount <= 0) return null;     const codes = (entry.lines || []).map((line) => String(line?.account?.code || "").trim()).filter(Boolean);     const journalDate = entry.entryDate || entry.createdAt;     return {       _id: `journal-${entry._id}`,       tenantId,       type: mappedType,       reference: entry.reference || entry.entryNumber || String(entry._id),       transactionDate: journalDate,       description: entry.description || "Operational accounting journal entry",       amount,       currency: "KES",       exchangeRate: 1,       baseAmount: amount,       quantity: null,       unitCost: null,       accountCode: codes[0] || "",       contraAccountCode: codes[1] || "",       status: entry.status || "posted",       journalEntry: { _id: entry._id, entryNumber: entry.entryNumber || null, reference: entry.reference || null, status: entry.status || "posted", date: journalDate },       journalReference: entry.entryNumber || entry.reference || null,       metadata: { source: "journal", sourceType: entry.sourceType || "account-pattern", sourceId: entry.sourceId || null },       isLinkedJournalRecord: true,     };   }).filter() to the caller.
  return entries.map((entry) => {
    // Declare mappedType for use by the surrounding module or function.
    const mappedType = classifyJournal(entry);
    // Check the condition (!mappedType || (type && mappedType !== type)) and run the matching branch.
    if (!mappedType || (type && mappedType !== type)) return null;
    // Declare amount for use by the surrounding module or function.
    const amount = journalAmount(entry);
    // Check the condition (amount <= 0) and run the matching branch.
    if (amount <= 0) return null;
    // Declare codes for use by the surrounding module or function.
    const codes = (entry.lines || []).map((line) => String(line?.account?.code || "").trim()).filter(Boolean);
    // Declare journalDate for use by the surrounding module or function.
    const journalDate = entry.entryDate || entry.createdAt;
    // Return the object assembled below to the caller.
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

// Declare listSubledger for use by the surrounding module or function.
export const listSubledger = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId();
    // Declare q for use by the surrounding module or function.
    const q = mergeTenantFilter(req, {});
    // Declare requestedType for use by the surrounding module or function.
    const requestedType = req.query.type ? String(req.query.type).toLowerCase() : "";
    // Check the condition (requestedType && requestedType !== "all" && allowed.has(requestedType)) and run the matching branch.
    if (requestedType && requestedType !== "all" && allowed.has(requestedType)) q.type = requestedType;

    // Declare rows for use by the surrounding module or function.
    const rows = await AccountingSubledger.find(q)
      .populate({ path: "journalEntry", select: "entryNumber reference status date entryDate" })
      .sort({ transactionDate: -1, createdAt: -1 })
      .limit(500)
      .lean();

    // Declare data for use by the surrounding module or function.
    const data = rows.map((row) => {
      // Declare amount for use by the surrounding module or function.
      const amount = money(row.amount);
      // Declare currency for use by the surrounding module or function.
      const currency = normalizeCurrency(row.currency);
      // Declare exchangeRate for use by the surrounding module or function.
      const exchangeRate = Number.isFinite(Number(row.exchangeRate)) && Number(row.exchangeRate) > 0 ? Number(row.exchangeRate) : 1;
      // Declare baseAmount for use by the surrounding module or function.
      const baseAmount = Number.isFinite(Number(row.baseAmount)) && Number(row.baseAmount) >= 0 ? money(row.baseAmount) : money(amount * exchangeRate);
      // Declare journalEntry for use by the surrounding module or function.
      const journalEntry = row.journalEntry || null;
      // Return the object assembled below to the caller.
      return { ...row, amount, currency, exchangeRate, baseAmount, quantity: Number.isFinite(Number(row.quantity)) ? Number(row.quantity) : null, unitCost: row.unitCost === null || row.unitCost === undefined ? null : money(row.unitCost), accountCode: String(row.accountCode || "").trim(), contraAccountCode: String(row.contraAccountCode || "").trim(), status: row.status || "draft", journalEntry, journalReference: journalEntry?.entryNumber || journalEntry?.reference || null, isLinkedJournalRecord: false };
    });

    // Declare fallbackRows for use by the surrounding module or function.
    const fallbackRows = await journalFallbackRows({ tenantId, type: requestedType === "all" ? "" : requestedType });
    // Declare representedJournalIds for use by the surrounding module or function.
    const representedJournalIds = new Set(data.map((row) => row.journalEntry?._id ? String(row.journalEntry._id) : "").filter(Boolean));
    // Declare linkedRows for use by the surrounding module or function.
    const linkedRows = fallbackRows.filter((row) => !representedJournalIds.has(String(row.journalEntry._id)));
    // Declare combined for use by the surrounding module or function.
    const combined = [...data, ...linkedRows].sort((a, b) => new Date(b.transactionDate || 0) - new Date(a.transactionDate || 0)).slice(0, 500);

    // Declare summary for use by the surrounding module or function.
    const summary = {
      count: combined.length,
      baseTotal: money(combined.reduce((sum, row) => sum + Number(row.baseAmount || 0), 0)),
      foreign: combined.filter((row) => row.currency !== "KES" && Number(row.exchangeRate) > 0 && Number(row.exchangeRate) !== 1).length,
      storedSubledgers: data.length,
      linkedJournalRecords: linkedRows.length,
    };
    // Return the result of res.json() to the caller.
    return res.json({ success: true, data: combined, summary });
  } catch (e) { next(e); }
};

// Declare buildPosting for use by the surrounding module or function.
const buildPosting = (row, body = {}) => {
  // Declare amount for use by the surrounding module or function.
  const amount = money(row.baseAmount || row.amount); const type = row.type; const meta = row.metadata || {};
  // Check the condition (amount <= 0) and run the matching branch.
  if (amount <= 0) throw new Error("Subledger base amount must be positive.");
  // Check the condition (type === "inventory") and run the matching branch.
  if (type === "inventory") {
    // Declare action for use by the surrounding module or function.
    const action = String(body.transactionType || meta.transactionType || (meta.direction === "out" ? "issue" : "receipt")).toLowerCase();
    // Check the condition (action === "issue" || action === "cogs") and run the matching branch.
    if (action === "issue" || action === "cogs") return { sourceType: "inventory_cogs", lines: [{ code: row.accountCode || "5000", debit: amount, credit: 0, description: "Inventory issue / COGS" }, { code: row.contraAccountCode || "1200", debit: 0, credit: amount, description: "Inventory consumed" }] };
    // Return the object assembled below to the caller.
    return { sourceType: "inventory_receipt", lines: [{ code: row.accountCode || "1200", debit: amount, credit: 0, description: "Inventory received" }, { code: row.contraAccountCode || cashCode(meta.paymentMethod), debit: 0, credit: amount, description: "Inventory funding / payable" }] };
  }
  // Check the condition (type === "payroll") and run the matching branch.
  if (type === "payroll") return { sourceType: "payroll_journal", lines: [{ code: row.accountCode || "5200", debit: amount, credit: 0, description: "Payroll expense" }, { code: row.contraAccountCode || "2140", debit: 0, credit: amount, description: "Payroll liabilities" }] };
  // Check the condition (type === "accrual") and run the matching branch.
  if (type === "accrual") return { sourceType: "accrual", lines: [{ code: row.accountCode || "5200", debit: amount, credit: 0, description: "Accrued expense" }, { code: row.contraAccountCode || "2000", debit: 0, credit: amount, description: "Accrued liability" }] };
  // Check the condition (type === "prepayment") and run the matching branch.
  if (type === "prepayment") return { sourceType: "prepayment", lines: [{ code: row.accountCode || "1300", debit: amount, credit: 0, description: "Prepayment asset" }, { code: row.contraAccountCode || cashCode(meta.paymentMethod), debit: 0, credit: amount, description: "Prepayment settlement" }] };
  // Check the condition (type === "fx") and run the matching branch.
  if (type === "fx") {
    // Declare direction for use by the surrounding module or function.
    const direction = String(body.direction || meta.direction || "in").toLowerCase();
    // Return the expression shown below to the caller.
    return direction === "out" ? { sourceType: "fx_loss", lines: [{ code: "7010", debit: amount, credit: 0, description: "Foreign exchange loss" }, { code: row.contraAccountCode || "1100", debit: 0, credit: amount, description: "FX revaluation" }] } : { sourceType: "fx_gain", lines: [{ code: row.contraAccountCode || "1100", debit: amount, credit: 0, description: "FX revaluation" }, { code: "7000", debit: 0, credit: amount, description: "Foreign exchange gain" }] };
  }
  // Stop the current operation by raising a new Error instance.
  throw new Error("Unsupported accounting subledger type.");
};

// Declare createSubledger for use by the surrounding module or function.
export const createSubledger = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId(); const b = req.body || {}; const type = String(b.type || "").trim().toLowerCase(); const amount = money(b.amount); const currency = normalizeCurrency(b.currency); const rate = Number(b.exchangeRate); const quantity = Number(b.quantity || 0); const unitCost = money(b.unitCost); const direction = String(b.direction || "in").toLowerCase();
    // Check the condition (!allowed.has(type)) and run the matching branch.
    if (!allowed.has(type)) return res.status(400).json({ success: false, message: "Unsupported accounting subledger type." });
    // Check the condition (!b.reference || !String(b.reference).trim()) and run the matching branch.
    if (!b.reference || !String(b.reference).trim()) return res.status(400).json({ success: false, message: "Reference is required." });
    // Check the condition (!b.description || !String(b.description).trim()) and run the matching branch.
    if (!b.description || !String(b.description).trim()) return res.status(400).json({ success: false, message: "Description is required." });
    // Check the condition (!Number.isFinite(amount) || amount <= 0) and run the matching branch.
    if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ success: false, message: "Amount must be greater than zero." });
    // Declare currencyError for use by the surrounding module or function.
    const currencyError = validateCurrencyAndRate(currency, rate); if (currencyError) return res.status(400).json({ success: false, message: currencyError });
    // Check the condition (type === "inventory" && (!Number.isFinite(quantity) || quantity <= 0)) and run the matching branch.
    if (type === "inventory" && (!Number.isFinite(quantity) || quantity <= 0)) return res.status(400).json({ success: false, message: "Inventory quantity must be greater than zero." });
    // Check the condition (type === "inventory" && unitCost <= 0) and run the matching branch.
    if (type === "inventory" && unitCost <= 0) return res.status(400).json({ success: false, message: "Inventory unit cost must be greater than zero." });
    // Check the condition (!["in", "out"].includes(direction)) and run the matching branch.
    if (!["in", "out"].includes(direction)) return res.status(400).json({ success: false, message: "Direction must be in or out." });
    // Declare baseAmount for use by the surrounding module or function.
    const baseAmount = money(amount * rate); const metadata = { ...(b.metadata || {}), direction };
    // Declare row for use by the surrounding module or function.
    const row = await AccountingSubledger.create({ tenantId, type, reference: String(b.reference).trim(), transactionDate: b.transactionDate || new Date(), description: String(b.description).trim(), amount, currency, exchangeRate: rate, baseAmount, quantity: Number.isFinite(quantity) ? quantity : 0, unitCost, accountCode: String(b.accountCode || "").trim(), contraAccountCode: String(b.contraAccountCode || "").trim(), metadata, createdBy: req.user?._id || null });
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Declare posting for use by the surrounding module or function.
      const posting = buildPosting(row, b); const entry = await postFinanceEntry({ tenantId, sourceType: posting.sourceType, sourceId: row._id, description: row.description, reference: row.reference, date: row.transactionDate, lines: posting.lines });
      // Perform the side effect or state update expressed on the following line.
      row.journalEntry = entry?._id || null; row.status = "posted"; row.postedBy = req.user?._id || null; row.postedAt = new Date(); await row.save(); return res.status(201).json({ success: true, data: row });
    } catch (postingError) { await AccountingSubledger.deleteOne({ _id: row._id, tenantId }); throw postingError; }
  } catch (e) { if (e?.code === 11000) return res.status(409).json({ success: false, message: "This subledger reference already exists for the tenant." }); next(e); }
};

// Declare amortizeSubledger for use by the surrounding module or function.
export const amortizeSubledger = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId(); const row = await AccountingSubledger.findOne(mergeTenantFilter(req, { _id: req.params.id })); if (!row) return res.status(404).json({ success: false, message: "Subledger record not found." }); if (row.type !== "prepayment") return res.status(400).json({ success: false, message: "Only prepayments can be amortized here." });
    // Declare amount for use by the surrounding module or function.
    const amount = money(req.body?.amount); if (amount <= 0 || amount > money(row.baseAmount)) return res.status(400).json({ success: false, message: "Amortization amount must be positive and cannot exceed the prepayment balance." });
    // Declare posting for use by the surrounding module or function.
    const posting = await postFinanceEntry({ tenantId, sourceType: "prepayment_amortization", sourceId: hashId(`${row._id}:${req.body?.reference || ""}:${amount}`), description: `Prepayment amortization: ${row.description}`, reference: String(req.body?.reference || `AMORT-${row.reference}`).trim(), date: req.body?.transactionDate || new Date(), lines: [{ code: row.accountCode || "5200", debit: amount, credit: 0, description: "Expense recognized from prepayment" }, { code: "1300", debit: 0, credit: amount, description: "Prepayment amortization" }] });
    // Perform the side effect or state update expressed on the following line.
    row.baseAmount = money(row.baseAmount - amount); row.status = row.baseAmount <= 0 ? "settled" : "posted"; await row.save(); return res.json({ success: true, data: row, journalEntry: posting?._id || null });
  } catch (e) { next(e); }
};

// Declare reverseAccrual for use by the surrounding module or function.
export const reverseAccrual = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId(); const row = await AccountingSubledger.findOne(mergeTenantFilter(req, { _id: req.params.id })); if (!row) return res.status(404).json({ status: 404, success: false, message: "Subledger record not found." }); if (row.type !== "accrual") return res.status(400).json({ success: false, message: "Only accruals can be reversed here." });
    // Declare amount for use by the surrounding module or function.
    const amount = money(req.body?.amount || row.baseAmount); if (amount <= 0 || amount > money(row.baseAmount)) return res.status(400).json({ success: false, message: "Invalid accrual reversal amount." });
    // Declare posting for use by the surrounding module or function.
    const posting = await postFinanceEntry({ tenantId, sourceType: "accrual_reversal", sourceId: hashId(`${row._id}:reverse:${req.body?.reference || ""}:${amount}`), description: `Accrual reversal: ${row.description}`, reference: String(req.body?.reference || `REV-${row.reference}`).trim(), date: req.body?.transactionDate || new Date(), lines: [{ code: "2000", debit: amount, credit: 0, description: "Accrued liability reversal" }, { code: row.accountCode || "5200", debit: 0, credit: amount, description: "Accrual reversal" }] });
    // Perform the side effect or state update expressed on the following line.
    row.baseAmount = money(row.baseAmount - amount); row.status = row.baseAmount <= 0 ? "settled" : "posted"; await row.save(); return res.json({ success: true, data: row, journalEntry: posting?._id || null });
  } catch (e) { next(e); }
};