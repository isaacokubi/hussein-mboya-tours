import JournalEntry from "../models/JournalEntry.js";
import ChartOfAccount from "../models/ChartOfAccount.js";

const round = (n) => Math.round(Number(n || 0) * 100) / 100;
const account = async (tenantId, code) => ChartOfAccount.findOne({ tenantId, code, active: true }).lean();
const ensureAccounts = async (tenantId) => {
  const defaults = [
    ["1000", "Cash on Hand", "asset", "cash"], ["1010", "Bank Account", "asset", "bank"], ["1020", "M-Pesa", "asset", "mobile_money"], ["1030", "Card / Gateway Clearing", "asset", "payment_clearing"],
    ["1100", "Accounts Receivable", "asset", "receivable"], ["1110", "Corporate Receivables", "asset", "corporate_receivable"], ["1200", "Inventory", "asset", "inventory"], ["1300", "Prepayments", "asset", "prepayment"], ["1400", "Property, Plant & Equipment", "asset", "fixed_asset"], ["1490", "Accumulated Depreciation", "asset", "accumulated_depreciation"],
    ["2000", "Accounts Payable", "liability", "payable"], ["2100", "VAT / Tax Payable", "liability", "tax"], ["2110", "Output VAT", "liability", "vat_output"], ["2120", "Input VAT", "asset", "vat_input"], ["2130", "Withholding Tax Payable", "liability", "withholding_tax"], ["2140", "Payroll Liabilities", "liability", "payroll"], ["2150", "Customer Deposits", "liability", "customer_deposit"],
    ["4000", "Tour Revenue", "revenue", "sales"], ["4010", "Hotel Revenue", "revenue", "sales"], ["4020", "Airport Transfer Revenue", "revenue", "sales"], ["4030", "Excursion Revenue", "revenue", "sales"], ["4100", "Other Revenue", "revenue", "other_revenue"],
    ["5000", "Tour / Supplier Costs", "expense", "cost_of_sales"], ["5010", "Hotel Direct Costs", "expense", "cost_of_sales"], ["5020", "Transport Direct Costs", "expense", "cost_of_sales"], ["5100", "Commissions", "expense", "commission"], ["5200", "General Operating Expenses", "expense", "operating"], ["5260", "Bank & Payment Charges", "expense", "payment_charges"], ["6000", "Operating Expenses", "expense", "operating"], ["6100", "Interest Expense", "expense", "finance_cost"],
  ];
  for (const [code, name, type, subtype] of defaults) await ChartOfAccount.updateOne({ tenantId, code }, { $setOnInsert: { tenantId, code, name, type, subtype, currency: "KES", active: true, system: true } }, { upsert: true });
};
const postOnce = async ({ tenantId, sourceType, sourceId, date, description, reference, lines }) => {
  if (!tenantId || !sourceId || !lines?.length) return null;
  const existing = await JournalEntry.findOne({ tenantId, sourceType, sourceId }).lean();
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
    return await JournalEntry.create({ tenantId, entryDate: date || new Date(), description, reference: reference || "", sourceType, sourceId, status: "posted", lines: resolved, postedAt: new Date() });
  } catch (error) {
    if (error?.code === 11000) return JournalEntry.findOne({ tenantId, sourceType, sourceId }).lean();
    throw error;
  }
};

export const postInvoiceToLedger = async (invoice) => {
  if (!invoice || invoice.isDeleted || ["draft", "cancelled"].includes(invoice.status)) return null;
  const total = Math.max(0, round(invoice.totalAmount));
  const tax = Math.max(0, Math.min(total, round(invoice.tax)));
  const revenue = round(total - tax);
  const revenueCode = invoice.hospitalityType === "hotel" ? "4010" : invoice.hospitalityType === "airport_transfer" ? "4020" : "4000";
  const lines = [{ code: "1100", debit: total, credit: 0, description: "Accounts receivable" }, { code: revenueCode, debit: 0, credit: revenue, description: invoice.hospitalityType === "hotel" ? "Hotel revenue" : invoice.hospitalityType === "airport_transfer" ? "Airport transfer revenue" : "Tour revenue" }];
  if (tax > 0) lines.push({ code: "2110", debit: 0, credit: tax, description: "Output VAT" });
  return postOnce({ tenantId: invoice.tenantId, sourceType: "invoice", sourceId: invoice._id, date: invoice.issueDate, description: `Invoice ${invoice.invoiceNumber}`, reference: invoice.invoiceNumber, lines });
};

export const postPaymentToLedger = async (payment) => {
  if (!payment || payment.status !== "completed") return null;
  const provider = String(payment.provider || payment.paymentMethod || "").toUpperCase();
  const cashCode = provider === "MPESA" ? "1020" : provider === "CARD" ? "1030" : provider === "CASH" ? "1000" : "1010";
  const gross = round(payment.amount);
  const fee = round(payment.feeAmount ?? payment.paymentFee ?? payment.transactionFee ?? payment.gatewayFee ?? 0);
  const lines = [{ code: cashCode, debit: round(gross - fee), credit: 0, description: "Net payment settlement" }, { code: "1100", debit: 0, credit: gross, description: "Accounts receivable" }];
  if (fee > 0) lines.push({ code: "5260", debit: fee, credit: 0, description: "Payment provider fee" });
  return postOnce({ tenantId: payment.tenantId, sourceType: "payment", sourceId: payment._id, date: payment.paidAt || payment.updatedAt, description: `${payment.hospitalityType ? `${payment.hospitalityType} ` : ""}Payment ${payment.transactionReference || payment.transactionId || payment.mpesaReceiptNumber || payment._id}`, reference: payment.transactionReference || payment.transactionId || payment.mpesaReceiptNumber || "", lines });
};

export const postPaymentRefundToLedger = async (payment, refundAmount = null, refundReference = "") => {
  if (!payment || !payment.tenantId) return null;
  const amount = round(refundAmount ?? payment.refundedAmount ?? 0);
  if (amount <= 0) return null;
  const provider = String(payment.provider || payment.paymentMethod || "").toUpperCase();
  const cashCode = provider === "MPESA" ? "1020" : provider === "CARD" ? "1030" : provider === "CASH" ? "1000" : "1010";
  const reference = String(refundReference || payment.refundReference || `REFUND-${payment._id}`).trim();
  return postOnce({ tenantId: payment.tenantId, sourceType: "payment_refund", sourceId: payment._id, date: payment.refundedAt || new Date(), description: `Payment refund ${payment.transactionReference || payment._id}`, reference, lines: [{ code: "1100", debit: amount, credit: 0, description: "Refund reinstates customer receivable" }, { code: cashCode, debit: 0, credit: amount, description: "Refund paid to customer" }] });
};

export const postExpenseToLedger = async (expense) => {
  if (!expense || expense.status === "draft" || expense.status === "cancelled") return null;
  const gross = round(Number(expense.amount || 0) + Number(expense.taxAmount || 0));
  const inputTax = round(Number(expense.taxAmount || 0));
  const net = round(Number(expense.amount || 0));
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
  const method = String(expense.paymentMethod || "").toUpperCase();
  const cashCode = method === "MPESA" ? "1020" : method === "CARD" ? "1030" : method === "CASH" ? "1000" : "1010";
  return postOnce({ tenantId: expense.tenantId, sourceType: "expense_payment", sourceId: expense._id, date: expense.expenseDate, description: `Expense payment ${expense.expenseNumber}`, reference: expense.paymentReference || expense.expenseNumber, lines: [{ code: "2000", debit: amount, credit: 0, description: "Accounts payable settlement" }, { code: cashCode, debit: 0, credit: amount, description: "Expense payment" }] });
};
