import JournalEntry from "../models/JournalEntry.js";
import ChartOfAccount from "../models/ChartOfAccount.js";

const round = (n) => Math.round(Number(n || 0) * 100) / 100;
const account = async (tenantId, code) => ChartOfAccount.findOne({ tenantId, code, active: true }).lean();
const ensureAccounts = async (tenantId) => {
  const defaults = [["1000", "Cash", "asset"], ["1010", "Bank", "asset"], ["1020", "M-Pesa", "asset"], ["1100", "Accounts Receivable", "asset"], ["2000", "Accounts Payable", "liability"], ["2100", "Tax Payable", "liability"], ["4000", "Tour Revenue", "revenue"], ["5000", "Tour Direct Costs", "expense"], ["6000", "Operating Expenses", "expense"]];
  for (const [code, name, type] of defaults) await ChartOfAccount.updateOne({ tenantId, code }, { $setOnInsert: { tenantId, code, name, type, currency: "KES", active: true } }, { upsert: true });
};
const postOnce = async ({ tenantId, sourceType, sourceId, date, description, reference, lines }) => {
  if (!tenantId || !sourceId || !lines?.length) return null;
  const existing = await JournalEntry.findOne({ tenantId, sourceType, sourceId }).lean(); if (existing) return existing;
  await ensureAccounts(tenantId); const resolved = [];
  for (const line of lines) { const acc = await account(tenantId, line.code); if (!acc) throw new Error(`Accounting account ${line.code} is unavailable for tenant.`); resolved.push({ account: acc._id, description: line.description || description, debit: round(line.debit), credit: round(line.credit) }); }
  const totalDebit = round(resolved.reduce((s, l) => s + l.debit, 0)); const totalCredit = round(resolved.reduce((s, l) => s + l.credit, 0));
  if (totalDebit <= 0 || Math.abs(totalDebit - totalCredit) > 0.01) throw new Error("Operational accounting entry must be balanced and non-zero.");
  return JournalEntry.create({ tenantId, entryDate: date || new Date(), description, reference: reference || "", sourceType, sourceId, status: "posted", lines: resolved, postedAt: new Date() });
};
export const postInvoiceToLedger = async (invoice) => {
  if (!invoice || invoice.isDeleted || ["draft", "cancelled"].includes(invoice.status)) return null;
  const net = Math.max(0, round(Number(invoice.subtotal || 0) - Number(invoice.discount || 0))); const tax = Math.max(0, round(invoice.tax)); const total = round(invoice.totalAmount);
  const lines = [{ code: "1100", debit: total, credit: 0, description: "Accounts receivable" }, { code: "4000", debit: 0, credit: net, description: "Tour revenue" }]; if (tax > 0) lines.push({ code: "2100", debit: 0, credit: tax, description: "Tax payable" });
  return postOnce({ tenantId: invoice.tenantId, sourceType: "invoice", sourceId: invoice._id, date: invoice.issueDate, description: `Invoice ${invoice.invoiceNumber}`, reference: invoice.invoiceNumber, lines });
};
export const postPaymentToLedger = async (payment) => {
  if (!payment || payment.status !== "completed") return null;
  const provider = String(payment.provider || payment.paymentMethod || "").toUpperCase(); const cashCode = provider === "MPESA" ? "1020" : provider === "CASH" ? "1000" : "1010";
  return postOnce({ tenantId: payment.tenantId, sourceType: "payment", sourceId: payment._id, date: payment.paidAt || payment.updatedAt, description: `Payment ${payment.transactionReference || payment.transactionId || payment.mpesaReceiptNumber || payment._id}`, reference: payment.transactionReference || payment.transactionId || payment.mpesaReceiptNumber || "", lines: [{ code: cashCode, debit: round(payment.amount), credit: 0, description: "Payment received" }, { code: "1100", debit: 0, credit: round(payment.amount), description: "Accounts receivable" }] });
};
export const postExpenseToLedger = async (expense) => {
  if (!expense || expense.status === "draft" || expense.status === "cancelled") return null;
  const amount = round(Number(expense.amount || 0) + Number(expense.taxAmount || 0)); const cashCode = String(expense.paymentMethod || "").toUpperCase() === "MPESA" ? "1020" : String(expense.paymentMethod || "").toUpperCase() === "CASH" ? "1000" : "1010";
  return postOnce({ tenantId: expense.tenantId, sourceType: "expense", sourceId: expense._id, date: expense.expenseDate, description: `Expense ${expense.expenseNumber}: ${expense.description}`, reference: expense.expenseNumber, lines: [{ code: "5000", debit: amount, credit: 0, description: expense.description }, { code: cashCode, debit: 0, credit: amount, description: "Expense settlement" }] });
};
