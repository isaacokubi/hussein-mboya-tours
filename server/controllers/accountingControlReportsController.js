import JournalEntry from "../models/JournalEntry.js";
import ChartOfAccount from "../models/ChartOfAccount.js";
import Payment from "../models/Payment.js";
import Invoice from "../models/Invoice.js";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";

const money = (n) => Math.round(Number(n || 0) * 100) / 100;
const accountCodes = ["1100", "1110", "2000", "2110", "2120", "2130", "2140", "2150", "2200"];

async function journalBalances(tenantId, from, to) {
  const accounts = await ChartOfAccount.find({ tenantId, code: { $in: accountCodes }, active: true }).lean();
  const ids = new Map(accounts.map(a => [String(a._id), a]));
  const filter = { tenantId, status: "posted" };
  if (from || to) filter.entryDate = { ...(from ? { $gte: new Date(`${from}T00:00:00.000Z`) } : {}), ...(to ? { $lt: new Date(`${to}T23:59:59.999Z`) } : {}) };
  const entries = await JournalEntry.find(filter).select("entryDate reference description lines").lean();
  const balances = new Map();
  for (const entry of entries) for (const line of entry.lines || []) {
    const account = ids.get(String(line.account)); if (!account) continue;
    const row = balances.get(account.code) || { code: account.code, name: account.name, type: account.type, debit: 0, credit: 0 };
    row.debit += Number(line.debit || 0); row.credit += Number(line.credit || 0); balances.set(account.code, row);
  }
  return [...balances.values()].map(r => ({ ...r, debit: money(r.debit), credit: money(r.credit), balance: money(["asset", "expense"].includes(r.type) ? r.debit - r.credit : r.credit - r.debit) }));
}

export const getTaxControlReport = async (req, res, next) => {
  try { const tenantId = requireTenantId(); const rows = await journalBalances(tenantId, req.query.from, req.query.to); const by = new Map(rows.map(r => [r.code, r])); const output = by.get("2110")?.balance || 0; const input = by.get("2120")?.balance || 0; const wht = by.get("2130")?.balance || 0; return res.json({ success: true, data: { period: { from: req.query.from || null, to: req.query.to || null }, rows, outputVat: money(output), inputVat: money(input), netVat: money(output - input), withholdingTaxPayable: money(wht) } }); } catch (e) { next(e); }
};

export const getCustomerLedgerReport = async (req, res, next) => {
  try { const tenantId = requireTenantId(); const account = await ChartOfAccount.findOne({ tenantId, code: "1100", active: true }).lean(); if (!account) return res.json({ success: true, data: { rows: [] } }); const rows = await JournalEntry.aggregate([{ $match: { tenantId, status: "posted", ...(req.query.from || req.query.to ? { entryDate: { ...(req.query.from ? { $gte: new Date(`${req.query.from}T00:00:00.000Z`) } : {}), ...(req.query.to ? { $lt: new Date(`${req.query.to}T23:59:59.999Z`) } : {}) } } : {}) } }, { $unwind: "$lines" }, { $match: { "lines.account": account._id } }, { $project: { entryDate: 1, entryNumber: 1, reference: 1, description: 1, debit: "$lines.debit", credit: "$lines.credit" } }, { $sort: { entryDate: 1 } }]); let balance = 0; const data = rows.map(r => { balance += Number(r.debit || 0) - Number(r.credit || 0); return { ...r, debit: money(r.debit), credit: money(r.credit), balance: money(balance) }; }); return res.json({ success: true, data: { account: "1100", rows: data, closingBalance: money(balance) } }); } catch (e) { next(e); }
};

export const getSupplierLedgerReport = async (req, res, next) => {
  try { const tenantId = requireTenantId(); const account = await ChartOfAccount.findOne({ tenantId, code: "2000", active: true }).lean(); if (!account) return res.json({ success: true, data: { rows: [] } }); const rows = await JournalEntry.aggregate([{ $match: { tenantId, status: "posted", ...(req.query.from || req.query.to ? { entryDate: { ...(req.query.from ? { $gte: new Date(`${req.query.from}T00:00:00.000Z`) } : {}), ...(req.query.to ? { $lt: new Date(`${req.query.to}T23:59:59.999Z`) } : {}) } } : {}) } }, { $unwind: "$lines" }, { $match: { "lines.account": account._id } }, { $project: { entryDate: 1, entryNumber: 1, reference: 1, description: 1, debit: "$lines.debit", credit: "$lines.credit" } }, { $sort: { entryDate: 1 } }]); let balance = 0; const data = rows.map(r => { balance += Number(r.credit || 0) - Number(r.debit || 0); return { ...r, debit: money(r.debit), credit: money(r.credit), balance: money(balance) }; }); return res.json({ success: true, data: { account: "2000", rows: data, closingBalance: money(balance) } }); } catch (e) { next(e); }
};

export const getProfitabilityReport = async (req, res, next) => {
  try { const tenantId = requireTenantId(); const match = mergeTenantFilter(req, { isDeleted: { $ne: true } }); const [invoices, payments] = await Promise.all([Invoice.find(match).select("booking hospitalityType totalAmount amountPaid status issueDate").lean(), Payment.find(mergeTenantFilter(req, {})).select("booking hospitalityType amount refundedAmount status paidAt").lean()]); const groups = new Map(); for (const invoice of invoices) { const key = invoice.hospitalityType || "tour"; const row = groups.get(key) || { serviceType: key, invoiced: 0, collected: 0, refunded: 0 }; row.invoiced += Number(invoice.totalAmount || 0); groups.set(key, row); } for (const payment of payments) { const key = payment.hospitalityType || "tour"; const row = groups.get(key) || { serviceType: key, invoiced: 0, collected: 0, refunded: 0 }; row.collected += Math.max(0, Number(payment.amount || 0) - Number(payment.refundedAmount || 0)); row.refunded += Number(payment.refundedAmount || 0); groups.set(key, row); } return res.json({ success: true, data: [...groups.values()].map(r => ({ ...r, invoiced: money(r.invoiced), collected: money(r.collected), refunded: money(r.refunded), collectionRate: r.invoiced ? money(r.collected / r.invoiced * 100) : null })) }); } catch (e) { next(e); }
};
