import mongoose from "mongoose";
import ChartOfAccount from "../models/ChartOfAccount.js";
import JournalEntry from "../models/JournalEntry.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";

const userId = (req) => req.user?._id || req.user?.id || null;
const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });
const DEFAULT_ACCOUNTS = [["1000", "Cash on Hand", "asset", "cash"], ["1010", "Bank Account", "asset", "bank"], ["1020", "M-Pesa", "asset", "mobile_money"], ["1100", "Accounts Receivable", "asset", "receivable"], ["2000", "Accounts Payable", "liability", "payable"], ["2100", "VAT / Tax Payable", "liability", "tax"], ["3000", "Owner Equity", "equity", "capital"], ["4000", "Tour Revenue", "revenue", "sales"], ["4100", "Other Revenue", "revenue", "other_revenue"], ["5000", "Tour / Supplier Costs", "expense", "cost_of_sales"], ["5100", "Commissions", "expense", "commission"], ["5200", "Operating Expenses", "expense", "operating"]];

// ChartOfAccount has the tenant plugin enabled. Keep the tenant out of the
// explicit upsert filter so the plugin can add it exactly once. Supplying
// tenantId both in the filter and plugin-generated $and filter causes Mongoose
// to reject the upsert with: "path 'tenantId' is matched twice".
async function ensureDefaults(tenantId) {
  for (const [code, name, type, subtype] of DEFAULT_ACCOUNTS) {
    await ChartOfAccount.updateOne(
      { code },
      { $setOnInsert: { tenantId, code, name, type, subtype, currency: "KES", system: true } },
      { upsert: true }
    );
  }
}

async function assertTenantAccounts(req, lines) {
  const ids = [...new Set((lines || []).map((line) => String(line.account || "")))];
  if (ids.length < 2 || ids.some((id) => !mongoose.isValidObjectId(id))) throw Object.assign(new Error("Each journal line must reference a valid account."), { statusCode: 422 });
  const accounts = await ChartOfAccount.find({ ...tenantFilter(req), _id: { $in: ids }, active: true }).select("_id").lean();
  if (accounts.length !== ids.length) throw Object.assign(new Error("One or more journal accounts do not belong to this tenant or are inactive."), { statusCode: 403 });
}

export const listAccounts = async (req, res, next) => { try { await ensureDefaults(req.tenantId); return ok(res, await ChartOfAccount.find(tenantFilter(req)).sort({ code: 1 }).lean()); } catch (e) { return next(e); } };
export const createAccount = async (req, res, next) => { try { const data = await ChartOfAccount.create({ ...req.body, tenantId: req.tenantId, system: false }); return ok(res, data, 201); } catch (e) { return next(e); } };
export const listJournalEntries = async (req, res, next) => { try { const filter = tenantFilter(req); if (req.query.status) filter.status = req.query.status; if (req.query.from || req.query.to) { filter.entryDate = {}; if (req.query.from) filter.entryDate.$gte = new Date(req.query.from); if (req.query.to) { const to = new Date(req.query.to); to.setHours(23, 59, 59, 999); filter.entryDate.$lte = to; } } return ok(res, await JournalEntry.find(filter).populate("lines.account", "code name type").sort({ entryDate: -1, createdAt: -1 }).limit(Math.min(Number(req.query.limit) || 200, 500)).lean()); } catch (e) { return next(e); } };
export const createJournalEntry = async (req, res, next) => { try { await assertTenantAccounts(req, req.body?.lines); const entry = await JournalEntry.create({ ...req.body, tenantId: req.tenantId, status: "draft", createdBy: userId(req) }); return ok(res, await entry.populate("lines.account", "code name type"), 201); } catch (e) { return next(e); } };
export const postJournalEntry = async (req, res, next) => { try { const entry = await JournalEntry.findOne({ ...tenantFilter(req), _id: req.params.id }); if (!entry) return res.status(404).json({ success: false, message: "Journal entry not found." }); if (entry.status === "posted") return ok(res, entry); if (entry.status === "void") return res.status(409).json({ success: false, message: "Void entries cannot be posted." }); await assertTenantAccounts(req, entry.lines); const debit = entry.lines.reduce((s, l) => s + Number(l.debit || 0), 0); const credit = entry.lines.reduce((s, l) => s + Number(l.credit || 0), 0); if (entry.lines.length < 2 || Math.abs(debit - credit) > 0.01 || debit <= 0) return res.status(422).json({ success: false, message: "Journal entry is not balanced." }); entry.status = "posted"; entry.postedAt = new Date(); entry.postedBy = userId(req); await entry.save(); return ok(res, await entry.populate("lines.account", "code name type")); } catch (e) { return next(e); } };
export const voidJournalEntry = async (req, res, next) => { try { const entry = await JournalEntry.findOne({ ...tenantFilter(req), _id: req.params.id }); if (!entry) return res.status(404).json({ success: false, message: "Journal entry not found." }); if (entry.status === "posted") return res.status(409).json({ success: false, message: "Posted entries must be reversed with a new journal entry; they cannot be edited or voided." }); entry.status = "void"; await entry.save(); return ok(res, entry); } catch (e) { return next(e); } };

export const getLedgerSummary = async (req, res, next) => {
  try {
    await ensureDefaults(req.tenantId); const accounts = await ChartOfAccount.find(tenantFilter(req)).sort({ code: 1 }).lean(); const entries = await JournalEntry.find({ ...tenantFilter(req), status: "posted" }).select("lines").lean();
    const balances = new Map(accounts.map((a) => [String(a._id), { account: a, debit: 0, credit: 0, balance: 0 }]));
    for (const entry of entries) for (const line of entry.lines || []) { const row = balances.get(String(line.account)); if (row) { row.debit += Number(line.debit || 0); row.credit += Number(line.credit || 0); } }
    for (const row of balances.values()) { row.debit = Math.round(row.debit * 100) / 100; row.credit = Math.round(row.credit * 100) / 100; row.balance = Math.round((["asset", "expense"].includes(row.account.type) ? row.debit - row.credit : row.credit - row.debit) * 100) / 100; }
    const rows = [...balances.values()]; const totals = rows.reduce((a, r) => ({ debit: a.debit + r.debit, credit: a.credit + r.credit }), { debit: 0, credit: 0 });
    const revenue = rows.filter((r) => r.account.type === "revenue").reduce((s, r) => s + r.balance, 0); const expenses = rows.filter((r) => r.account.type === "expense").reduce((s, r) => s + r.balance, 0);
    const assets = rows.filter((r) => r.account.type === "asset").reduce((s, r) => s + r.balance, 0); const liabilities = rows.filter((r) => r.account.type === "liability").reduce((s, r) => s + r.balance, 0); const equity = rows.filter((r) => r.account.type === "equity").reduce((s, r) => s + r.balance, 0);
    return ok(res, { accounts: rows, totals: { debit: Math.round(totals.debit * 100) / 100, credit: Math.round(totals.credit * 100) / 100 }, profitLoss: { revenue: Math.round(revenue * 100) / 100, expenses: Math.round(expenses * 100) / 100, netProfit: Math.round((revenue - expenses) * 100) / 100 }, balanceSheet: { assets: Math.round(assets * 100) / 100, liabilities: Math.round(liabilities * 100) / 100, equity: Math.round(equity * 100) / 100, retainedResult: Math.round((revenue - expenses) * 100) / 100, liabilitiesAndEquity: Math.round((liabilities + equity + revenue - expenses) * 100) / 100 } });
  } catch (e) { return next(e); }
};
