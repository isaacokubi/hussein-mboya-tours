import JournalEntry from "../models/JournalEntry.js";
import ChartOfAccount from "../models/ChartOfAccount.js";

const round = (n) => Math.round(Number(n || 0) * 100) / 100;
const account = async (tenantId, code) => ChartOfAccount.findOne({ tenantId, code, isActive: true }).lean();

const ensureAccounts = async (tenantId) => {
  const defaults = [
    ["1000", "Cash", "asset"], ["1010", "Bank", "asset"], ["1020", "M-Pesa", "asset"], ["1100", "Accounts Receivable", "asset"],
    ["2000", "Accounts Payable", "liability"], ["2100", "Tax Payable", "liability"], ["4000", "Tour Revenue", "revenue"], ["5000", "Tour Direct Costs", "expense"],
  ];
  for (const [code, name, type] of defaults) await ChartOfAccount.updateOne({ tenantId, code }, { $setOnInsert: { tenantId, code, name, type, currency: "KES", isActive: true } }, { upsert: true });
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
  const totalDebit = round(resolved.reduce((s, l) => s + l.debit, 0)); const totalCredit = round(resolved.reduce((s, l) => s + l.credit, 0));
  if (totalDebit <= 0 || totalDebit !== totalCredit) throw new Error("Operational accounting entry must be balanced and non-zero.");
  const entry = await JournalEntry.create({ tenantId, date: date || new Date(), description, reference: reference || "", sourceType, sourceId, status: "posted", lines: resolved, totalDebit, totalCredit, postedAt: new Date() });
  return entry;
};

export const postInvoiceToLedger = async (invoice) => {
  if (!invoice || invoice.isDeleted || ["draft", "cancelled"].includes(invoice.status)) return null;
  const net = Math.max(0, round(invoice.subtotal - invoice.discount)); const tax = Math.max(0, round(invoice.tax));
  const lines = [{ code: "1100", debit: round(invoice.totalAmount), credit: 0, description: "Accounts receivable" }, { code: "4000", debit: 0, credit: net, description: "Tour revenue" }];
  if (tax > 0) lines.push({ code: "2100", debit: 0, credit: tax, description: "Tax payable" });
  return postOnce({ tenantId: invoice.tenantId, sourceType: "invoice", sourceId: invoice._id, date: invoice.issueDate, description: `Invoice ${invoice.invoiceNumber}`, reference: invoice.invoiceNumber, lines });
};

export const postPaymentToLedger = async (payment) => {
  if (!payment || payment.status !== "completed") return null;
  const provider = String(payment.provider || payment.paymentMethod || "").toUpperCase();
  const cashCode = provider === "MPESA" ? "1020" : provider === "BANK" || provider === "BANK_TRANSFER" ? "1010" : provider === "CASH" ? "1000" : "1010";
  return postOnce({ tenantId: payment.tenantId, sourceType: "payment", sourceId: payment._id, date: payment.paidAt || payment.updatedAt, description: `Payment ${payment.transactionReference || payment.transactionId || payment.mpesaReceiptNumber || payment._id}`, reference: payment.transactionReference || payment.transactionId || payment.mpesaReceiptNumber || "", lines: [{ code: cashCode, debit: round(payment.amount), credit: 0, description: "Payment received" }, { code: "1100", debit: 0, credit: round(payment.amount), description: "Accounts receivable" }] });
};
