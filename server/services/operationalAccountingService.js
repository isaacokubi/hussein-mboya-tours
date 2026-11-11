/**
 * Purpose: operational Accounting Service business-logic service. Main declarations: round, safeReference, invalidateAccountCache, account, ensureAccounts.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import crypto from "node:crypto";
// Load ../models/JournalEntry.js so this module can use its exported dependencies.
import JournalEntry from "../models/JournalEntry.js";
// Load ../models/ChartOfAccount.js so this module can use its exported dependencies.
import ChartOfAccount from "../models/ChartOfAccount.js";
// Load ../models/Invoice.js so this module can use its exported dependencies.
import Invoice from "../models/Invoice.js";

// Declare round for use by the surrounding module or function.
const round = (n) => Math.round(Number(n || 0) * 100) / 100;
// Declare safeReference for use by the surrounding module or function.
const safeReference = (...values) => values.map((value) => String(value ?? "").trim()).find((value) => value && !/^(undefined|null|nan)$/i.test(value)) || "";
// Declare ACCOUNT_CACHE_TTL_MS for use by the surrounding module or function.
const ACCOUNT_CACHE_TTL_MS = Math.max(5_000, Number(process.env.ACCOUNT_CACHE_TTL_MS || 60_000));
// Declare accountCache for use by the surrounding module or function.
const accountCache = new Map();

// Declare invalidateAccountCache for use by the surrounding module or function.
const invalidateAccountCache = (tenantId = null) => {
  // Declare prefix for use by the surrounding module or function.
  const prefix = tenantId ? `${String(tenantId)}:` : "";
  // Repeat the enclosed work for each required iteration.
  for (const key of accountCache.keys()) {
    // Check the condition (!prefix || key === `__ready__:${String(tenantId)}` || key.startsWith(p) and run the matching branch.
    if (!prefix || key === `__ready__:${String(tenantId)}` || key.startsWith(prefix)) {
      // Perform the side effect or state update expressed on the following line.
      accountCache.delete(key);
    }
  }
};

// Declare account for use by the surrounding module or function.
const account = async (tenantId, code) => {
  // Declare key for use by the surrounding module or function.
  const key = String(tenantId) + ":" + code;
  // Declare cached for use by the surrounding module or function.
  const cached = accountCache.get(key);
  // Check the condition (cached && cached.expiresAt > Date.now()) and run the matching branch.
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  // Perform the side effect or state update expressed on the following line.
  accountCache.delete(key);
  // Declare value for use by the surrounding module or function.
  const value = await ChartOfAccount.findOne({ tenantId, code, active: true }).lean();
  // Check the condition (value) and run the matching branch.
  if (value) accountCache.set(key, { value, expiresAt: Date.now() + ACCOUNT_CACHE_TTL_MS });
  // Return the value of value to the caller.
  return value;
};
// Declare ensureAccounts for use by the surrounding module or function.
const ensureAccounts = async (tenantId) => {
  // Declare tenantKey for use by the surrounding module or function.
  const tenantKey = String(tenantId);
  // Declare readyKey for use by the surrounding module or function.
  const readyKey = "__ready__:" + tenantKey;
  // Declare readyAt for use by the surrounding module or function.
  const readyAt = accountCache.get(readyKey);
  // Check the condition (readyAt && readyAt > Date.now()) and run the matching branch.
  if (readyAt && readyAt > Date.now()) return;
  // Perform the side effect or state update expressed on the following line.
  accountCache.delete(readyKey);
  // Declare defaults for use by the surrounding module or function.
  const defaults = [
    ["1000", "Cash on Hand", "asset", "cash"], ["1010", "Bank Account", "asset", "bank"], ["1020", "M-Pesa", "asset", "mobile_money"], ["1030", "Card / Gateway Clearing", "asset", "payment_clearing"],
    ["1100", "Accounts Receivable", "asset", "receivable"], ["1110", "Corporate Receivables", "asset", "corporate_receivable"], ["1200", "Inventory", "asset", "inventory"], ["1300", "Prepayments", "asset", "prepayment"], ["1400", "Property, Plant & Equipment", "asset", "fixed_asset"], ["1490", "Accumulated Depreciation", "asset", "accumulated_depreciation"],
    ["2000", "Accounts Payable", "liability", "payable"], ["2100", "VAT / Tax Payable", "liability", "tax"], ["2110", "Output VAT", "liability", "vat_output"], ["2120", "Input VAT", "asset", "vat_input"], ["2130", "Withholding Tax Payable", "liability", "withholding_tax"], ["2140", "Payroll Liabilities", "liability", "payroll"], ["2150", "Customer Deposits", "liability", "customer_deposit"],
    ["3000", "Owner Equity", "equity", "capital"], ["3010", "Retained Earnings", "equity", "retained_earnings"], ["3020", "Current Year Earnings", "equity", "current_year_earnings"],
    ["4000", "Tour Revenue", "revenue", "sales"], ["4010", "Hotel Revenue", "revenue", "sales"], ["4020", "Airport Transfer Revenue", "revenue", "sales"], ["4030", "Excursion Revenue", "revenue", "sales"], ["4100", "Other Revenue", "revenue", "other_revenue"],
    ["5000", "Tour / Supplier Costs", "expense", "cost_of_sales"], ["5010", "Hotel Direct Costs", "expense", "cost_of_sales"], ["5020", "Transport Direct Costs", "expense", "cost_of_sales"], ["5100", "Commissions", "expense", "commission"], ["5200", "General Operating Expenses", "expense", "operating"], ["5260", "Bank & Payment Charges", "expense", "payment_charges"], ["5270", "Depreciation Expense", "expense", "depreciation"], ["6100", "Interest Expense", "expense", "finance_cost"], ["7000", "Foreign Exchange Gain", "revenue", "fx_gain"], ["7010", "Foreign Exchange Loss", "expense", "fx_loss"],
  ];
  // Perform the side effect or state update expressed on the following line.
  await ChartOfAccount.bulkWrite(
    defaults.map(([code, name, type, subtype]) => ({
      updateOne: {
        filter: { tenantId, code },
        update: { $setOnInsert: { tenantId, code, name, type, subtype, currency: "KES", active: true, system: true } },
        upsert: true,
      },
    })),
    { ordered: false }
  );
  // Perform the side effect or state update expressed on the following line.
  accountCache.set(readyKey, Date.now() + ACCOUNT_CACHE_TTL_MS);
};

// Declare postOnce for use by the surrounding module or function.
const postOnce = async ({ tenantId, sourceType, sourceId, date, description, reference, lines, session = null }) => {
  // Check the condition (!tenantId || !sourceId || !lines?.length) and run the matching branch.
  if (!tenantId || !sourceId || !lines?.length) return null;
  // Declare existingQuery for use by the surrounding module or function.
  const existingQuery = JournalEntry.findOne({ tenantId, sourceType, sourceId });
  // Check the condition (session) and run the matching branch.
  if (session) existingQuery.session(session);
  // Declare existing for use by the surrounding module or function.
  const existing = await existingQuery.lean();
  // Check the condition (existing) and run the matching branch.
  if (existing) return existing;
  // Perform the side effect or state update expressed on the following line.
  await ensureAccounts(tenantId);
  // Declare resolved for use by the surrounding module or function.
  const resolved = [];
  // Repeat the enclosed work for each required iteration.
  for (const line of lines) {
    // Normal postings resolve accounts by chart code. Reversal postings may
    // already carry the original journal line's account ObjectId; resolve it
    // inside the same tenant instead of treating the ObjectId as a code.
    // Declare acc for use by the surrounding module or function.
    const acc = line.code
      ? await account(tenantId, line.code)
      : line.account
        ? await ChartOfAccount.findOne({ tenantId, _id: line.account, active: true }).lean()
        : null;
    // Check the condition (!acc) and run the matching branch.
    if (!acc) throw new Error(`Accounting account ${line.code || line.account || "unknown"} is unavailable for tenant.`);
    // Perform the side effect or state update expressed on the following line.
    resolved.push({ account: acc._id, description: line.description || description, debit: round(line.debit), credit: round(line.credit) });
  }
  // Declare totalDebit for use by the surrounding module or function.
  const totalDebit = round(resolved.reduce((s, l) => s + l.debit, 0));
  // Declare totalCredit for use by the surrounding module or function.
  const totalCredit = round(resolved.reduce((s, l) => s + l.credit, 0));
  // Check the condition (totalDebit <= 0 || Math.abs(totalDebit - totalCredit) > 0.01) and run the matching branch.
  if (totalDebit <= 0 || Math.abs(totalDebit - totalCredit) > 0.01) throw new Error("Operational accounting entry must be balanced and non-zero.");
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare entry for use by the surrounding module or function.
    const entry = { tenantId, entryDate: date || new Date(), description, reference: reference || "", sourceType, sourceId, status: "posted", lines: resolved, postedAt: new Date() };
    // Check the condition (session) and run the matching branch.
    if (session) return (await JournalEntry.create([entry], { session }))[0];
    // Return the completed the result of JournalEntry.create() operation to the caller.
    return await JournalEntry.create(entry);
  } catch (error) {
    // Check the condition (error?.code === 11000) and run the matching branch.
    if (error?.code === 11000) {
      // Declare retryQuery for use by the surrounding module or function.
      const retryQuery = JournalEntry.findOne({ tenantId, sourceType, sourceId });
      // Check the condition (session) and run the matching branch.
      if (session) retryQuery.session(session);
      // Return the result of retryQuery.lean() to the caller.
      return retryQuery.lean();
    }
    // Stop the current operation by raising the value of error.
    throw error;
  }
};

// Declare reverseJournalOnce for use by the surrounding module or function.
export const reverseJournalOnce = async ({ tenantId, originalJournal, sourceType, sourceId, date, description, reference }) => {
  // Check the condition (!tenantId || !originalJournal?._id || !sourceType || !sourceId) and run the matching branch.
  if (!tenantId || !originalJournal?._id || !sourceType || !sourceId) return null;
  // Declare existing for use by the surrounding module or function.
  const existing = await JournalEntry.findOne({ tenantId, sourceType, sourceId }).lean();
  // Check the condition (existing) and run the matching branch.
  if (existing) return existing;
  // Declare lines for use by the surrounding module or function.
  const lines = (originalJournal.lines || []).map((line) => ({
    account: line.account,
    description: description || `Reversal of ${originalJournal.reference || originalJournal._id}`,
    debit: round(line.credit),
    credit: round(line.debit),
  }));
  // Declare totalDebit for use by the surrounding module or function.
  const totalDebit = round(lines.reduce((sum, line) => sum + line.debit, 0));
  // Declare totalCredit for use by the surrounding module or function.
  const totalCredit = round(lines.reduce((sum, line) => sum + line.credit, 0));
  // Check the condition (totalDebit <= 0 || Math.abs(totalDebit - totalCredit) > 0.01) and run the matching branch.
  if (totalDebit <= 0 || Math.abs(totalDebit - totalCredit) > 0.01) throw new Error("Journal reversal must be balanced and non-zero.");
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Return the completed the result of JournalEntry.create() operation to the caller.
    return await JournalEntry.create({
      tenantId,
      entryDate: date || new Date(),
      description: description || `Reversal of ${originalJournal.reference || originalJournal._id}`,
      reference: reference || `REV-${originalJournal.reference || originalJournal._id}`,
      sourceType,
      sourceId,
      status: "posted",
      lines,
      postedAt: new Date(),
    });
  } catch (error) {
    // Check the condition (error?.code === 11000) and run the matching branch.
    if (error?.code === 11000) return JournalEntry.findOne({ tenantId, sourceType, sourceId }).lean();
    // Stop the current operation by raising the value of error.
    throw error;
  }
};

// Declare postInvoiceToLedger for use by the surrounding module or function.
export const postInvoiceToLedger = async (invoice, { session = null } = {}) => {
  // Check the condition (!invoice || invoice.isDeleted || ["draft", "cancelled"].includes(invoi) and run the matching branch.
  if (!invoice || invoice.isDeleted || ["draft", "cancelled"].includes(invoice.status)) return null;
  // Declare total for use by the surrounding module or function.
  const total = Math.max(0, round(invoice.totalAmount));
  // Declare tax for use by the surrounding module or function.
  const tax = Math.max(0, Math.min(total, round(invoice.tax)));
  // Declare revenue for use by the surrounding module or function.
  const revenue = round(total - tax);
  // Declare revenueCode for use by the surrounding module or function.
  const revenueCode = invoice.hospitalityType === "hotel" ? "4010" : invoice.hospitalityType === "airport_transfer" ? "4020" : "4000";
  // Declare lines for use by the surrounding module or function.
  const lines = [{ code: "1100", debit: total, credit: 0, description: "Accounts receivable" }, { code: revenueCode, debit: 0, credit: revenue, description: invoice.hospitalityType === "hotel" ? "Hotel revenue" : invoice.hospitalityType === "airport_transfer" ? "Airport transfer revenue" : "Tour revenue" }];
  // Check the condition (tax > 0) and run the matching branch.
  if (tax > 0) lines.push({ code: "2110", debit: 0, credit: tax, description: "Output VAT" });
  // Return the result of postOnce() to the caller.
  return postOnce({ session, tenantId: invoice.tenantId, sourceType: "invoice", sourceId: invoice._id, date: invoice.issueDate, description: `Invoice ${invoice.invoiceNumber}`, reference: invoice.invoiceNumber, lines });
};

// Declare postPaymentToLedger for use by the surrounding module or function.
export const postPaymentToLedger = async (payment, { session = null } = {}) => {
  // A refunded payment still represents an original completed settlement. The
  // refund is a separate journal that reverses the cash movement/revenue.
  // Check the condition (!payment || !["completed", "refunded"].includes(String(payment.status ) and run the matching branch.
  if (!payment || !["completed", "refunded"].includes(String(payment.status || "").toLowerCase())) return null;
  // Declare provider for use by the surrounding module or function.
  const provider = String(payment.provider || payment.paymentMethod || "").toUpperCase();
  // Declare cashCode for use by the surrounding module or function.
  const cashCode = provider === "MPESA" ? "1020" : provider === "CARD" || provider === "STRIPE" || provider === "PAYPAL" || provider === "PESAPAL" ? "1030" : provider === "CASH" ? "1000" : "1010";
  // Declare gross for use by the surrounding module or function.
  const gross = round(payment.amount);
  // Declare fee for use by the surrounding module or function.
  const fee = round(payment.feeAmount || payment.paymentFee || payment.transactionFee || payment.gatewayFee || 0);
  // Check the condition (gross <= 0) and run the matching branch.
  if (gross <= 0) return null;
  // Check the condition (fee > gross) and run the matching branch.
  if (fee > gross) throw new Error("Payment fee cannot exceed the payment amount.");
  // Declare lines for use by the surrounding module or function.
  const lines = [{ code: cashCode, debit: round(gross - fee), credit: 0, description: "Net payment settlement" }, { code: "1100", debit: 0, credit: gross, description: "Accounts receivable" }];
  // Check the condition (fee > 0) and run the matching branch.
  if (fee > 0) lines.push({ code: "5260", debit: fee, credit: 0, description: "Payment provider fee" });
  // Return the result of postOnce() to the caller.
  return postOnce({ session, tenantId: payment.tenantId, sourceType: "payment", sourceId: payment._id, date: payment.paidAt || payment.updatedAt, description: `${payment.hospitalityType ? `${payment.hospitalityType} ` : ""}Payment ${safeReference(payment.transactionReference, payment.transactionId, payment.mpesaReceiptNumber, payment._id)}`, reference: safeReference(payment.transactionReference, payment.transactionId, payment.mpesaReceiptNumber), lines });
};

// Declare postPaymentRefundToLedger for use by the surrounding module or function.
export const postPaymentRefundToLedger = async (payment, refundAmount = null, refundReference = "", { session = null } = {}) => {
  // Check the condition (!payment || !payment.tenantId) and run the matching branch.
  if (!payment || !payment.tenantId) return null;
  // Declare amount for use by the surrounding module or function.
  const amount = round(refundAmount ?? payment.refundedAmount ?? 0);
  // Check the condition (amount <= 0) and run the matching branch.
  if (amount <= 0) return null;
  // Declare originalAmount for use by the surrounding module or function.
  const originalAmount = round(payment.amount);
  // Check the condition (amount > originalAmount) and run the matching branch.
  if (amount > originalAmount) throw new Error("Refund cannot exceed the original payment amount.");
  // Declare provider for use by the surrounding module or function.
  const provider = String(payment.provider || payment.paymentMethod || "").toUpperCase();
  // Declare cashCode for use by the surrounding module or function.
  const cashCode = provider === "MPESA" ? "1020" : provider === "CARD" || provider === "STRIPE" || provider === "PAYPAL" || provider === "PESAPAL" ? "1030" : provider === "CASH" ? "1000" : "1010";
  // Declare reference for use by the surrounding module or function.
  const reference = safeReference(refundReference, payment.refundReference, "REFUND-" + payment._id + "-" + amount);
  // Declare sourceId for use by the surrounding module or function.
  const sourceId = payment._id;

  // Declare invoice for use by the surrounding module or function.
  const invoice = payment.invoiceNumber
    ? await Invoice.findOne({ tenantId: payment.tenantId, invoiceNumber: payment.invoiceNumber, isDeleted: { $ne: true } }).lean()
    : payment.booking
      ? await Invoice.findOne({ tenantId: payment.tenantId, booking: payment.booking, isDeleted: { $ne: true } }).lean()
      : payment.hospitalityBooking
        ? await Invoice.findOne({ tenantId: payment.tenantId, hospitalityBooking: payment.hospitalityBooking, isDeleted: { $ne: true } }).lean()
        : null;

  // Repair a legacy refund journal that incorrectly debited AR. Posted journals
  // are immutable, so reverse the old entry and post corrected accounting.
  // Declare existingRefund for use by the surrounding module or function.
  const existingRefund = await JournalEntry.findOne({
    tenantId: payment.tenantId,
    sourceType: "payment_refund",
    $or: [
      { sourceId },
      { reference },
      ...(payment.transactionReference ? [{ reference: String(payment.transactionReference).trim() }] : []),
      ...(payment.refundReference ? [{ reference: String(payment.refundReference).trim() }] : []),
    ],
  }).sort({ createdAt: 1 }).lean();
  // Check the condition (existingRefund) and run the matching branch.
  if (existingRefund) {
    // Declare lineAccounts for use by the surrounding module or function.
    const lineAccounts = await ChartOfAccount.find({
      tenantId: payment.tenantId,
      _id: { $in: (existingRefund.lines || []).map((line) => line.account) },
      active: true,
    }).select("code").lean();
    // Declare codeById for use by the surrounding module or function.
    const codeById = new Map(lineAccounts.map((item) => [String(item._id), item.code]));
    // Declare arLine for use by the surrounding module or function.
    const arLine = (existingRefund.lines || []).find((line) => codeById.get(String(line.account)) === "1100" && Number(line.debit || 0) > 0);
    // Declare existingCashLine for use by the surrounding module or function.
    const existingCashLine = (existingRefund.lines || []).find((line) => ["1000", "1010", "1020", "1030"].includes(codeById.get(String(line.account))) && Number(line.credit || 0) > 0);
    // Check the condition (!arLine || !existingCashLine) and run the matching branch.
    if (!arLine || !existingCashLine) return existingRefund;

    // Check the condition (!(await JournalEntry.findOne({ tenantId: payment.tenantId, sourceType:) and run the matching branch.
    if (!(await JournalEntry.findOne({ tenantId: payment.tenantId, sourceType: "payment_refund_reversal", sourceId: existingRefund._id }).lean())) {
      // Perform the side effect or state update expressed on the following line.
      await postOnce({
        tenantId: payment.tenantId,
        sourceType: "payment_refund_reversal",
        sourceId: existingRefund._id,
        date: new Date(),
        description: "Reverse legacy refund accounting " + reference,
        reference: "CORRECT-" + reference,
        lines: existingRefund.lines.map((line) => ({ account: line.account, description: "Reversal of legacy refund journal", debit: round(line.credit), credit: round(line.debit) })),
      });
    }

    // Check the condition (!(await JournalEntry.findOne({ tenantId: payment.tenantId, sourceType:) and run the matching branch.
    if (!(await JournalEntry.findOne({ tenantId: payment.tenantId, sourceType: "payment_refund_correction", sourceId: existingRefund._id }).lean())) {
      // Declare invoiceTotal for use by the surrounding module or function.
      const invoiceTotal = Math.max(0, round(invoice?.totalAmount));
      // Declare invoiceTax for use by the surrounding module or function.
      const invoiceTax = Math.max(0, Math.min(invoiceTotal, round(invoice?.tax)));
      // Declare ratio for use by the surrounding module or function.
      const ratio = invoiceTotal > 0 ? Math.min(1, amount / invoiceTotal) : 1;
      // Declare taxReversal for use by the surrounding module or function.
      const taxReversal = round(invoiceTax * ratio);
      // Declare revenueReversal for use by the surrounding module or function.
      const revenueReversal = round(amount - taxReversal);
      // Declare revenueCode for use by the surrounding module or function.
      const revenueCode = invoice?.hospitalityType === "hotel" ? "4010" : invoice?.hospitalityType === "airport_transfer" ? "4020" : "4000";
      // Declare revenueAccount for use by the surrounding module or function.
      const revenueAccount = await account(payment.tenantId, revenueCode);
      // Declare cashAccount for use by the surrounding module or function.
      const cashAccount = await account(payment.tenantId, codeById.get(String(existingCashLine.account)));
      // Declare correctionLines for use by the surrounding module or function.
      const correctionLines = [
        { account: revenueAccount._id, description: "Revenue reversal for customer refund", debit: revenueReversal, credit: 0 },
        { account: cashAccount._id, description: "Refund paid to customer", debit: 0, credit: amount },
      ];
      // Check the condition (taxReversal > 0) and run the matching branch.
      if (taxReversal > 0) correctionLines.splice(1, 0, { account: (await account(payment.tenantId, "2110"))._id, description: "Output VAT reversal on customer refund", debit: taxReversal, credit: 0 });
      // Perform the side effect or state update expressed on the following line.
      await postOnce({
        tenantId: payment.tenantId,
        sourceType: "payment_refund_correction",
        sourceId: existingRefund._id,
        date: existingRefund.entryDate || payment.refundedAt || new Date(),
        description: "Correct legacy refund accounting " + reference,
        reference,
        lines: correctionLines,
      });
    }
    // Return the value of existingRefund to the caller.
    return existingRefund;
  }

  // A refund reverses recognised revenue (and output VAT when present).
  // It must not debit AR because the original payment already cleared AR.
  // Declare invoiceTotal for use by the surrounding module or function.
  const invoiceTotal = Math.max(0, round(invoice?.totalAmount));
  // Declare invoiceTax for use by the surrounding module or function.
  const invoiceTax = Math.max(0, Math.min(invoiceTotal, round(invoice?.tax)));
  // Declare refundRatio for use by the surrounding module or function.
  const refundRatio = invoiceTotal > 0 ? Math.min(1, amount / invoiceTotal) : 1;
  // Declare taxReversal for use by the surrounding module or function.
  const taxReversal = round(invoiceTax * refundRatio);
  // Declare revenueReversal for use by the surrounding module or function.
  const revenueReversal = round(amount - taxReversal);
  // Declare revenueCode for use by the surrounding module or function.
  const revenueCode = invoice?.hospitalityType === "hotel" ? "4010" : invoice?.hospitalityType === "airport_transfer" ? "4020" : "4000";
  // Declare lines for use by the surrounding module or function.
  const lines = [{ code: revenueCode, debit: revenueReversal, credit: 0, description: "Revenue reversal for customer refund" }, { code: cashCode, debit: 0, credit: amount, description: "Refund paid to customer" }];
  // Check the condition (taxReversal > 0) and run the matching branch.
  if (taxReversal > 0) lines.splice(1, 0, { code: "2110", debit: taxReversal, credit: 0, description: "Output VAT reversal on customer refund" });
  // Return the result of postOnce() to the caller.
  return postOnce({ session, tenantId: payment.tenantId, sourceType: "payment_refund", sourceId, date: payment.refundedAt || new Date(), description: "Payment refund " + (payment.transactionReference || payment._id), reference, lines });
};
// Declare postExpenseToLedger for use by the surrounding module or function.
export const postExpenseToLedger = async (expense) => {
  // Check the condition (!expense || expense.status === "draft" || expense.status === "cancelle) and run the matching branch.
  if (!expense || expense.status === "draft" || expense.status === "cancelled") return null;
  // Declare gross for use by the surrounding module or function.
  const gross = round(Number(expense.amount || 0) + Number(expense.taxAmount || 0));
  // Declare inputTax for use by the surrounding module or function.
  const inputTax = round(Number(expense.taxAmount || 0));
  // Declare net for use by the surrounding module or function.
  const net = round(Number(expense.amount || 0));
  // Check the condition (gross <= 0) and run the matching branch.
  if (gross <= 0) return null;
  // Declare expenseCode for use by the surrounding module or function.
  const expenseCode = ["hotel", "accommodation"].includes(String(expense.category || "").toLowerCase()) ? "5010" : ["transport", "fuel"].includes(String(expense.category || "").toLowerCase()) ? "5020" : ["commission", "commissions"].includes(String(expense.category || "").toLowerCase()) ? "5100" : "5000";
  // Declare lines for use by the surrounding module or function.
  const lines = [{ code: expenseCode, debit: net, credit: 0, description: expense.description }];
  // Check the condition (inputTax > 0) and run the matching branch.
  if (inputTax > 0) lines.push({ code: "2120", debit: inputTax, credit: 0, description: "Input VAT" });
  // Check the condition (expense.supplier) and run the matching branch.
  if (expense.supplier) lines.push({ code: "2000", debit: 0, credit: gross, description: "Supplier payable" });
  else {
    // Declare method for use by the surrounding module or function.
    const method = String(expense.paymentMethod || "").toUpperCase();
    // Declare cashCode for use by the surrounding module or function.
    const cashCode = method === "MPESA" ? "1020" : method === "CARD" ? "1030" : method === "CASH" ? "1000" : "1010";
    // Perform the side effect or state update expressed on the following line.
    lines.push({ code: cashCode, debit: 0, credit: gross, description: "Expense settlement" });
  }
  // Return the result of postOnce() to the caller.
  return postOnce({ tenantId: expense.tenantId, sourceType: "expense_accrual", sourceId: expense._id, date: expense.expenseDate, description: `Expense ${expense.expenseNumber}: ${expense.description}`, reference: expense.expenseNumber, lines });
};

// Declare postExpensePaymentToLedger for use by the surrounding module or function.
export const postExpensePaymentToLedger = async (expense) => {
  // Check the condition (!expense || expense.status !== "paid" || !expense.supplier) and run the matching branch.
  if (!expense || expense.status !== "paid" || !expense.supplier) return null;
  // Declare amount for use by the surrounding module or function.
  const amount = round(Number(expense.amount || 0) + Number(expense.taxAmount || 0));
  // Check the condition (amount <= 0) and run the matching branch.
  if (amount <= 0) return null;
  // Declare method for use by the surrounding module or function.
  const method = String(expense.paymentMethod || "").toUpperCase();
  // Declare cashCode for use by the surrounding module or function.
  const cashCode = method === "MPESA" ? "1020" : method === "CARD" ? "1030" : method === "CASH" ? "1000" : "1010";
  // Return the result of postOnce() to the caller.
  return postOnce({ tenantId: expense.tenantId, sourceType: "expense_payment", sourceId: expense._id, date: expense.paidAt || expense.expenseDate, description: `Expense payment ${expense.expenseNumber}`, reference: expense.paymentReference || expense.expenseNumber, lines: [{ code: "2000", debit: amount, credit: 0, description: "Accounts payable settlement" }, { code: cashCode, debit: 0, credit: amount, description: "Expense payment" }] });
};

// Declare postSupplierPayableToLedger for use by the surrounding module or function.
export const postSupplierPayableToLedger = async (payable) => {
  // Check the condition (!payable || !payable.tenantId || payable.status === "cancelled") and run the matching branch.
  if (!payable || !payable.tenantId || payable.status === "cancelled") return null;
  // Declare amount for use by the surrounding module or function.
  const amount = round(payable.amount);
  // Check the condition (amount <= 0) and run the matching branch.
  if (amount <= 0) return null;
  // Return the result of postOnce() to the caller.
  return postOnce({ tenantId: payable.tenantId, sourceType: "supplier_payable", sourceId: payable._id, date: payable.createdAt, description: `Supplier payable ${payable.payableNumber || payable._id}`, reference: payable.payableNumber || "", lines: [{ code: "5000", debit: amount, credit: 0, description: "Supplier cost accrued" }, { code: "2000", debit: 0, credit: amount, description: "Accounts payable" }] });
};

// Declare postSupplierPaymentToLedger for use by the surrounding module or function.
export const postSupplierPaymentToLedger = async (payable, amount = null, paymentReference = "", paymentMethod = "BANK_TRANSFER") => {
  // Check the condition (!payable || !payable.tenantId) and run the matching branch.
  if (!payable || !payable.tenantId) return null;
  // Declare paid for use by the surrounding module or function.
  const paid = round(amount ?? payable.amountPaid ?? 0);
  // Check the condition (paid <= 0) and run the matching branch.
  if (paid <= 0) return null;
  // Check the condition (paid > round(payable.amount)) and run the matching branch.
  if (paid > round(payable.amount)) throw new Error("Supplier settlement cannot exceed the payable amount.");
  // Declare method for use by the surrounding module or function.
  const method = String(paymentMethod || "BANK_TRANSFER").toUpperCase();
  // Declare cashCode for use by the surrounding module or function.
  const cashCode = method === "MPESA" ? "1020" : method === "CARD" ? "1030" : method === "CASH" ? "1000" : "1010";
  // Declare reference for use by the surrounding module or function.
  const reference = safeReference(paymentReference, payable.paymentReference, `SUPPLIER-${payable._id}-${paid}`);
  // Declare sourceId for use by the surrounding module or function.
  const sourceId = crypto.createHash("sha256").update(`${payable._id}:${reference}:${paid}`).digest("hex").slice(0, 24);
  // Return the result of postOnce() to the caller.
  return postOnce({ tenantId: payable.tenantId, sourceType: "supplier_payable_payment", sourceId, description: `Supplier payable settlement ${payable.payableNumber || payable._id}`, reference, date: new Date(), lines: [{ code: "2000", debit: paid, credit: 0, description: "Accounts payable settlement" }, { code: cashCode, debit: 0, credit: paid, description: "Supplier payment" }] });
};

// Expose the selected declarations or re-exported members to other parts of the application.
export { invalidateAccountCache };
