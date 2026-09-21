import crypto from "node:crypto";
import JournalEntry from "../models/JournalEntry.js";
import ChartOfAccount from "../models/ChartOfAccount.js";
import Invoice from "../models/Invoice.js";

const round = (n) => Math.round(Number(n || 0) * 100) / 100;
const safeReference = (...values) => values.map((value) => String(value ?? "").trim()).find((value) => value && !/^(undefined|null|nan)$/i.test(value)) || "";
const ACCOUNT_CACHE_TTL_MS = Math.max(5_000, Number(process.env.ACCOUNT_CACHE_TTL_MS || 60_000));
const accountCache = new Map();

const invalidateAccountCache = (tenantId = null) => {
  const prefix = tenantId ? `${String(tenantId)}:` : "";
  for (const key of accountCache.keys()) {
    if (!prefix || key === `__ready__:${String(tenantId)}` || key.startsWith(prefix)) {
      accountCache.delete(key);
    }
  }
};

const account = async (tenantId, code) => {
  const key = String(tenantId) + ":" + code;
  const cached = accountCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  accountCache.delete(key);
  const value = await ChartOfAccount.findOne({ tenantId, code, active: true }).lean();
  if (value) accountCache.set(key, { value, expiresAt: Date.now() + ACCOUNT_CACHE_TTL_MS });
  return value;
};
const ensureAccounts = async (tenantId) => {
  const tenantKey = String(tenantId);
  const readyKey = "__ready__:" + tenantKey;
  const readyAt = accountCache.get(readyKey);
  if (readyAt && readyAt > Date.now()) return;
  accountCache.delete(readyKey);
  const defaults = [
    ["1000", "Cash on Hand", "asset", "cash"], ["1010", "Bank Account", "asset", "bank"], ["1020", "M-Pesa", "asset", "mobile_money"], ["1030", "Card / Gateway Clearing", "asset", "payment_clearing"],
    ["1100", "Accounts Receivable", "asset", "receivable"], ["1110", "Corporate Receivables", "asset", "corporate_receivable"], ["1200", "Inventory", "asset", "inventory"], ["1300", "Prepayments", "asset", "prepayment"], ["1400", "Property, Plant & Equipment", "asset", "fixed_asset"], ["1490", "Accumulated Depreciation", "asset", "accumulated_depreciation"],
    ["2000", "Accounts Payable", "liability", "payable"], ["2100", "VAT / Tax Payable", "liability", "tax"], ["2110", "Output VAT", "liability", "vat_output"], ["2120", "Input VAT", "asset", "vat_input"], ["2130", "Withholding Tax Payable", "liability", "withholding_tax"], ["2140", "Payroll Liabilities", "liability", "payroll"], ["2150", "Customer Deposits", "liability", "customer_deposit"],
    ["3000", "Owner Equity", "equity", "capital"], ["3010", "Retained Earnings", "equity", "retained_earnings"], ["3020", "Current Year Earnings", "equity", "current_year_earnings"],
    ["4000", "Tour Revenue", "revenue", "sales"], ["4010", "Hotel Revenue", "revenue", "sales"], ["4020", "Airport Transfer Revenue", "revenue", "sales"], ["4030", "Excursion Revenue", "revenue", "sales"], ["4100", "Other Revenue", "revenue", "other_revenue"],
    ["5000", "Tour / Supplier Costs", "expense", "cost_of_sales"], ["5010", "Hotel Direct Costs", "expense", "cost_of_sales"], ["5020", "Transport Direct Costs", "expense", "cost_of_sales"], ["5100", "Commissions", "expense", "commission"], ["5200", "General Operating Expenses", "expense", "operating"], ["5260", "Bank & Payment Charges", "expense", "payment_charges"], ["5270", "Depreciation Expense", "expense", "depreciation"], ["6100", "Interest Expense", "expense", "finance_cost"], ["7000", "Foreign Exchange Gain", "revenue", "fx_gain"], ["7010", "Foreign Exchange Loss", "expense", "fx_loss"],
  ];
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
  accountCache.set(readyKey, Date.now() + ACCOUNT_CACHE_TTL_MS);
};

const postOnce = async ({ tenantId, sourceType, sourceId, date, description, reference, lines, session = null }) => {
  if (!tenantId || !sourceId || !lines?.length) return null;
  const existingQuery = JournalEntry.findOne({ tenantId, sourceType, sourceId });
  if (session) existingQuery.session(session);
  const existing = await existingQuery.lean();
  if (existing) return existing;
  await ensureAccounts(tenantId);
  const resolved = [];
  for (const line of lines) {
    const acc = await account(tenantId, line.code);
    if (!acc) throw new Error(`Accounting account ${line.code} is unavailable for tenant.`);
    resolved.push({ account: acc._id, description: line.description || description, debit: round(line.debit), credit: round(line.credit) });
  }
  const totalDebit = round(resolved.reduce((s, l) => s + l.debit, 0));
  const totalCredit = round(resolved.reduce((s, l) => s + l.credit, 0));
  if (totalDebit <= 0 || Math.abs(totalDebit - totalCredit) > 0.01) throw new Error("Operational accounting entry must be balanced and non-zero.");
  try {
    const entry = { tenantId, entryDate: date || new Date(), description, reference: reference || "", sourceType, sourceId, status: "posted", lines: resolved, postedAt: new Date() };
    if (session) return (await JournalEntry.create([entry], { session }))[0];
    return await JournalEntry.create(entry);
  } catch (error) {
    if (error?.code === 11000) {
      const retryQuery = JournalEntry.findOne({ tenantId, sourceType, sourceId });
      if (session) retryQuery.session(session);
      return retryQuery.lean();
    }
    throw error;
  }
};

export const reverseJournalOnce = async ({ tenantId, originalJournal, sourceType, sourceId, date, description, reference }) => {
  if (!tenantId || !originalJournal?._id || !sourceType || !sourceId) return null;
  const existing = await JournalEntry.findOne({ tenantId, sourceType, sourceId }).lean();
  if (existing) return existing;
  const lines = (originalJournal.lines || []).map((line) => ({
    account: line.account,
    description: description || `Reversal of ${originalJournal.reference || originalJournal._id}`,
    debit: round(line.credit),
    credit: round(line.debit),
  }));
  const totalDebit = round(lines.reduce((sum, line) => sum + line.debit, 0));
  const totalCredit = round(lines.reduce((sum, line) => sum + line.credit, 0));
  if (totalDebit <= 0 || Math.abs(totalDebit - totalCredit) > 0.01) throw new Error("Journal reversal must be balanced and non-zero.");
  try {
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
    if (error?.code === 11000) return JournalEntry.findOne({ tenantId, sourceType, sourceId }).lean();
    throw error;
  }
};

export const postInvoiceToLedger = async (invoice, { session = null } = {}) => {
  if (!invoice || invoice.isDeleted || ["draft", "cancelled"].includes(invoice.status)) return null;
  const total = Math.max(0, round(invoice.totalAmount));
  const tax = Math.max(0, Math.min(total, round(invoice.tax)));
  const revenue = round(total - tax);
  const revenueCode = invoice.hospitalityType === "hotel" ? "4010" : invoice.hospitalityType === "airport_transfer" ? "4020" : "4000";
  const lines = [{ code: "1100", debit: total, credit: 0, description: "Accounts receivable" }, { code: revenueCode, debit: 0, credit: revenue, description: invoice.hospitalityType === "hotel" ? "Hotel revenue" : invoice.hospitalityType === "airport_transfer" ? "Airport transfer revenue" : "Tour revenue" }];
  if (tax > 0) lines.push({ code: "2110", debit: 0, credit: tax, description: "Output VAT" });
  return postOnce({ session, tenantId: invoice.tenantId, sourceType: "invoice", sourceId: invoice._id, date: invoice.issueDate, description: `Invoice ${invoice.invoiceNumber}`, reference: invoice.invoiceNumber, lines });
};

export const postPaymentToLedger = async (payment, { session = null } = {}) => {
  // A refunded payment still represents an original completed settlement. The
  // refund is a separate journal that reverses the cash movement/revenue.
  if (!payment || !["completed", "refunded"].includes(String(payment.status || "").toLowerCase())) return null;
  const provider = String(payment.provider || payment.paymentMethod || "").toUpperCase();
  const cashCode = provider === "MPESA" ? "1020" : provider === "CARD" || provider === "STRIPE" || provider === "PAYPAL" || provider === "PESAPAL" ? "1030" : provider === "CASH" ? "1000" : "1010";
  const gross = round(payment.amount);
  const fee = round(payment.feeAmount || payment.paymentFee || payment.transactionFee || payment.gatewayFee || 0);
  if (gross <= 0) return null;
  if (fee > gross) throw new Error("Payment fee cannot exceed the payment amount.");
  const lines = [{ code: cashCode, debit: round(gross - fee), credit: 0, description: "Net payment settlement" }, { code: "1100", debit: 0, credit: gross, description: "Accounts receivable" }];
  if (fee > 0) lines.push({ code: "5260", debit: fee, credit: 0, description: "Payment provider fee" });
  return postOnce({ session, tenantId: payment.tenantId, sourceType: "payment", sourceId: payment._id, date: payment.paidAt || payment.updatedAt, description: `${payment.hospitalityType ? `${payment.hospitalityType} ` : ""}Payment ${safeReference(payment.transactionReference, payment.transactionId, payment.mpesaReceiptNumber, payment._id)}`, reference: safeReference(payment.transactionReference, payment.transactionId, payment.mpesaReceiptNumber), lines });
};

export const postPaymentRefundToLedger = async (payment, refundAmount = null, refundReference = "", { session = null } = {}) => {
  if (!payment || !payment.tenantId) return null;
  const amount = round(refundAmount ?? payment.refundedAmount ?? 0);
  if (amount <= 0) return null;
  const originalAmount = round(payment.amount);
  if (amount > originalAmount) throw new Error("Refund cannot exceed the original payment amount.");
  const provider = String(payment.provider || payment.paymentMethod || "").toUpperCase();
  const cashCode = provider === "MPESA" ? "1020" : provider === "CARD" || provider === "STRIPE" || provider === "PAYPAL" || provider === "PESAPAL" ? "1030" : provider === "CASH" ? "1000" : "1010";
  const reference = safeReference(refundReference, payment.refundReference, "REFUND-" + payment._id + "-" + amount);
  const sourceId = payment._id;

  const invoice = payment.invoiceNumber
    ? await Invoice.findOne({ tenantId: payment.tenantId, invoiceNumber: payment.invoiceNumber, isDeleted: { $ne: true } }).lean()
    : payment.booking
      ? await Invoice.findOne({ tenantId: payment.tenantId, booking: payment.booking, isDeleted: { $ne: true } }).lean()
      : payment.hospitalityBooking
        ? await Invoice.findOne({ tenantId: payment.tenantId, hospitalityBooking: payment.hospitalityBooking, isDeleted: { $ne: true } }).lean()
        : null;

  // Repair a legacy refund journal that incorrectly debited AR. Posted journals
  // are immutable, so reverse the old entry and post corrected accounting.
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
  if (existingRefund) {
    const lineAccounts = await ChartOfAccount.find({
      tenantId: payment.tenantId,
      _id: { $in: (existingRefund.lines || []).map((line) => line.account) },
      active: true,
    }).select("code").lean();
    const codeById = new Map(lineAccounts.map((item) => [String(item._id), item.code]));
    const arLine = (existingRefund.lines || []).find((line) => codeById.get(String(line.account)) === "1100" && Number(line.debit || 0) > 0);
    const existingCashLine = (existingRefund.lines || []).find((line) => ["1000", "1010", "1020", "1030"].includes(codeById.get(String(line.account))) && Number(line.credit || 0) > 0);
    if (!arLine || !existingCashLine) return existingRefund;

    if (!(await JournalEntry.findOne({ tenantId: payment.tenantId, sourceType: "payment_refund_reversal", sourceId: existingRefund._id }).lean())) {
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

    if (!(await JournalEntry.findOne({ tenantId: payment.tenantId, sourceType: "payment_refund_correction", sourceId: existingRefund._id }).lean())) {
      const invoiceTotal = Math.max(0, round(invoice?.totalAmount));
      const invoiceTax = Math.max(0, Math.min(invoiceTotal, round(invoice?.tax)));
      const ratio = invoiceTotal > 0 ? Math.min(1, amount / invoiceTotal) : 1;
      const taxReversal = round(invoiceTax * ratio);
      const revenueReversal = round(amount - taxReversal);
      const revenueCode = invoice?.hospitalityType === "hotel" ? "4010" : invoice?.hospitalityType === "airport_transfer" ? "4020" : "4000";
      const revenueAccount = await account(payment.tenantId, revenueCode);
      const cashAccount = await account(payment.tenantId, codeById.get(String(existingCashLine.account)));
      const correctionLines = [
        { account: revenueAccount._id, description: "Revenue reversal for customer refund", debit: revenueReversal, credit: 0 },
        { account: cashAccount._id, description: "Refund paid to customer", debit: 0, credit: amount },
      ];
      if (taxReversal > 0) correctionLines.splice(1, 0, { account: (await account(payment.tenantId, "2110"))._id, description: "Output VAT reversal on customer refund", debit: taxReversal, credit: 0 });
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
    return existingRefund;
  }

  // A refund reverses recognised revenue (and output VAT when present).
  // It must not debit AR because the original payment already cleared AR.
  const invoiceTotal = Math.max(0, round(invoice?.totalAmount));
  const invoiceTax = Math.max(0, Math.min(invoiceTotal, round(invoice?.tax)));
  const refundRatio = invoiceTotal > 0 ? Math.min(1, amount / invoiceTotal) : 1;
  const taxReversal = round(invoiceTax * refundRatio);
  const revenueReversal = round(amount - taxReversal);
  const revenueCode = invoice?.hospitalityType === "hotel" ? "4010" : invoice?.hospitalityType === "airport_transfer" ? "4020" : "4000";
  const lines = [{ code: revenueCode, debit: revenueReversal, credit: 0, description: "Revenue reversal for customer refund" }, { code: cashCode, debit: 0, credit: amount, description: "Refund paid to customer" }];
  if (taxReversal > 0) lines.splice(1, 0, { code: "2110", debit: taxReversal, credit: 0, description: "Output VAT reversal on customer refund" });
  return postOnce({ session, tenantId: payment.tenantId, sourceType: "payment_refund", sourceId, date: payment.refundedAt || new Date(), description: "Payment refund " + (payment.transactionReference || payment._id), reference, lines });
};
export const postExpenseToLedger = async (expense) => {
  if (!expense || expense.status === "draft" || expense.status === "cancelled") return null;
  const gross = round(Number(expense.amount || 0) + Number(expense.taxAmount || 0));
  const inputTax = round(Number(expense.taxAmount || 0));
  const net = round(Number(expense.amount || 0));
  if (gross <= 0) return null;
  const expenseCode = ["hotel", "accommodation"].includes(String(expense.category || "").toLowerCase()) ? "5010" : ["transport", "fuel"].includes(String(expense.category || "").toLowerCase()) ? "5020" : ["commission", "commissions"].includes(String(expense.category || "").toLowerCase()) ? "5100" : "5000";
  const lines = [{ code: expenseCode, debit: net, credit: 0, description: expense.description }];
  if (inputTax > 0) lines.push({ code: "2120", debit: inputTax, credit: 0, description: "Input VAT" });
  if (expense.supplier) lines.push({ code: "2000", debit: 0, credit: gross, description: "Supplier payable" });
  else {
    const method = String(expense.paymentMethod || "").toUpperCase();
    const cashCode = method === "MPESA" ? "1020" : method === "CARD" ? "1030" : method === "CASH" ? "1000" : "1010";
    lines.push({ code: cashCode, debit: 0, credit: gross, description: "Expense settlement" });
  }
  return postOnce({ tenantId: expense.tenantId, sourceType: "expense_accrual", sourceId: expense._id, date: expense.expenseDate, description: `Expense ${expense.expenseNumber}: ${expense.description}`, reference: expense.expenseNumber, lines });
};

export const postExpensePaymentToLedger = async (expense) => {
  if (!expense || expense.status !== "paid" || !expense.supplier) return null;
  const amount = round(Number(expense.amount || 0) + Number(expense.taxAmount || 0));
  if (amount <= 0) return null;
  const method = String(expense.paymentMethod || "").toUpperCase();
  const cashCode = method === "MPESA" ? "1020" : method === "CARD" ? "1030" : method === "CASH" ? "1000" : "1010";
  return postOnce({ tenantId: expense.tenantId, sourceType: "expense_payment", sourceId: expense._id, date: expense.paidAt || expense.expenseDate, description: `Expense payment ${expense.expenseNumber}`, reference: expense.paymentReference || expense.expenseNumber, lines: [{ code: "2000", debit: amount, credit: 0, description: "Accounts payable settlement" }, { code: cashCode, debit: 0, credit: amount, description: "Expense payment" }] });
};

export const postSupplierPayableToLedger = async (payable) => {
  if (!payable || !payable.tenantId || payable.status === "cancelled") return null;
  const amount = round(payable.amount);
  if (amount <= 0) return null;
  return postOnce({ tenantId: payable.tenantId, sourceType: "supplier_payable", sourceId: payable._id, date: payable.createdAt, description: `Supplier payable ${payable.payableNumber || payable._id}`, reference: payable.payableNumber || "", lines: [{ code: "5000", debit: amount, credit: 0, description: "Supplier cost accrued" }, { code: "2000", debit: 0, credit: amount, description: "Accounts payable" }] });
};

export const postSupplierPaymentToLedger = async (payable, amount = null, paymentReference = "", paymentMethod = "BANK_TRANSFER") => {
  if (!payable || !payable.tenantId) return null;
  const paid = round(amount ?? payable.amountPaid ?? 0);
  if (paid <= 0) return null;
  if (paid > round(payable.amount)) throw new Error("Supplier settlement cannot exceed the payable amount.");
  const method = String(paymentMethod || "BANK_TRANSFER").toUpperCase();
  const cashCode = method === "MPESA" ? "1020" : method === "CARD" ? "1030" : method === "CASH" ? "1000" : "1010";
  const reference = safeReference(paymentReference, payable.paymentReference, `SUPPLIER-${payable._id}-${paid}`);
  const sourceId = crypto.createHash("sha256").update(`${payable._id}:${reference}:${paid}`).digest("hex").slice(0, 24);
  return postOnce({ tenantId: payable.tenantId, sourceType: "supplier_payable_payment", sourceId, description: `Supplier payable settlement ${payable.payableNumber || payable._id}`, reference, date: new Date(), lines: [{ code: "2000", debit: paid, credit: 0, description: "Accounts payable settlement" }, { code: cashCode, debit: 0, credit: paid, description: "Supplier payment" }] });
};

export { invalidateAccountCache };
