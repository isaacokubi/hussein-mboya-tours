import crypto from "node:crypto";
import FixedAsset from "../models/FixedAsset.js";
import FinanceBudget from "../models/FinanceBudget.js";
import AccountingPeriod from "../models/AccountingPeriod.js";
import ChartOfAccount from "../models/ChartOfAccount.js";
import JournalEntry from "../models/JournalEntry.js";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import { postFinanceEntry } from "../services/financeLifecycleService.js";

const money = (n) => Math.round(Number(n || 0) * 100) / 100;
const actor = (req) => req.user?._id || req.user?.id || null;
const currentPeriod = () => new Date().toISOString().slice(0, 7);

export async function listAssets(req, res, next) { try { return res.json({ success: true, data: await FixedAsset.find(mergeTenantFilter(req, {})).sort({ acquisitionDate: -1 }).lean() }); } catch (e) { next(e); } }

export async function createAsset(req, res, next) {
  try {
    const tenantId = requireTenantId(); const b = req.body || {}; const cost = money(b.acquisitionCost); const residual = money(b.residualValue);
    if (!b.assetNumber || !b.name || !b.acquisitionDate || cost <= 0 || Number(b.usefulLifeMonths) <= 0 || residual > cost) return res.status(400).json({ success: false, message: "Asset number, name, acquisition date, positive cost and useful life are required; residual value cannot exceed cost." });
    const data = await FixedAsset.create({ ...b, tenantId, acquisitionCost: cost, residualValue: residual, usefulLifeMonths: Number(b.usefulLifeMonths), createdBy: actor(req) });
    try {
      const entry = await postFinanceEntry({ tenantId, sourceType: "fixed_asset_acquisition", sourceId: data._id, description: `Fixed asset acquisition ${data.assetNumber}`, reference: data.assetNumber, date: data.acquisitionDate, lines: [{ code: "1400", debit: cost, credit: 0, description: "Fixed asset acquisition" }, { code: String(b.paymentAccountCode || "1010"), debit: 0, credit: cost, description: "Asset acquisition funding" }] });
      return res.status(201).json({ success: true, data, entry });
    } catch (error) { await FixedAsset.deleteOne({ _id: data._id, tenantId }); throw error; }
  } catch (e) { next(e); }
}

export async function disposeAsset(req, res, next) {
  try {
    const tenantId = requireTenantId(); const asset = await FixedAsset.findOne(mergeTenantFilter(req, { _id: req.params.id })); if (!asset) return res.status(404).json({ success: false, message: "Fixed asset not found." }); if (asset.status !== "active" && asset.status !== "fully_depreciated") return res.status(409).json({ success: false, message: "Asset has already been disposed." });
    const proceeds = money(req.body?.proceeds); const date = req.body?.disposalDate || new Date(); const netBook = money(asset.acquisitionCost - asset.accumulatedDepreciation); const gain = money(proceeds - netBook); const loss = money(netBook - proceeds);
    const lines = [{ code: "1490", debit: money(asset.accumulatedDepreciation), credit: 0, description: "Remove accumulated depreciation" }, { code: "1010", debit: proceeds, credit: 0, description: "Disposal proceeds" }, { code: "1400", debit: 0, credit: money(asset.acquisitionCost), description: "Remove fixed asset cost" }];
    if (gain > 0) lines.push({ code: "4100", debit: 0, credit: gain, description: "Gain on disposal" }); else if (loss > 0) lines.push({ code: "5200", debit: loss, credit: 0, description: "Loss on disposal" });
    const entry = await postFinanceEntry({ tenantId, sourceType: "fixed_asset_disposal", sourceId: asset._id, description: `Fixed asset disposal ${asset.assetNumber}`, reference: String(req.body?.reference || `DISP-${asset.assetNumber}`).trim(), date, lines });
    asset.status = "disposed"; asset.disposalDate = date; asset.disposalProceeds = proceeds; await asset.save(); return res.json({ success: true, data: asset, entry, gain, loss });
  } catch (e) { next(e); }
}

export async function postAssetDepreciation(req, res, next) {
  try {
    const tenantId = requireTenantId(); const asset = await FixedAsset.findOne(mergeTenantFilter(req, { _id: req.params.id })); if (!asset) return res.status(404).json({ success: false, message: "Fixed asset not found." }); if (asset.status !== "active") return res.status(409).json({ success: false, message: "Only active assets can be depreciated." });
    const months = Math.max(1, Number(req.body?.months || 1)); const p = String(req.body?.period || currentPeriod()); if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(p)) return res.status(400).json({ success: false, message: "Depreciation period must be YYYY-MM." });
    const remaining = Math.max(0, money(asset.acquisitionCost - asset.residualValue - asset.accumulatedDepreciation)); const monthly = money((asset.acquisitionCost - asset.residualValue) / asset.usefulLifeMonths); const amount = money(Math.min(remaining, monthly * months));
    if (amount <= 0) { asset.status = "fully_depreciated"; await asset.save(); return res.json({ success: true, data: asset, posted: false }); }
    const sourceId = crypto.createHash("sha256").update(`${asset._id}:${p}:${months}`).digest("hex").slice(0, 24); const entry = await postFinanceEntry({ tenantId, sourceType: "fixed_asset_depreciation", sourceId, description: `Depreciation ${asset.assetNumber} ${p}`, reference: `DEP-${asset.assetNumber}-${p}`, date: new Date(`${p}-01T12:00:00.000Z`), lines: [{ code: "5270", debit: amount, credit: 0, description: "Depreciation expense" }, { code: "1490", debit: 0, credit: amount, description: "Accumulated depreciation" }] });
    if (entry) { asset.accumulatedDepreciation = money(Math.min(asset.acquisitionCost - asset.residualValue, asset.accumulatedDepreciation + amount)); if (asset.accumulatedDepreciation >= asset.acquisitionCost - asset.residualValue - 0.01) asset.status = "fully_depreciated"; await asset.save(); }
    return res.json({ success: true, data: asset, entry });
  } catch (e) { next(e); }
}

export async function listBudgets(req, res, next) { try { const filter = {}; if (req.query.fiscalYear) filter.fiscalYear = Number(req.query.fiscalYear); if (req.query.accountCode) filter.accountCode = String(req.query.accountCode); return res.json({ success: true, data: await FinanceBudget.find(mergeTenantFilter(req, filter)).sort({ fiscalYear: -1, month: 1, accountCode: 1 }).lean() }); } catch (e) { next(e); } }
export async function upsertBudget(req, res, next) { try { const tenantId = requireTenantId(); const b = req.body || {}; const fiscalYear = Number(b.fiscalYear); const month = b.month == null || b.month === "" ? null : Number(b.month); const amount = money(b.amount); if (!b.name || !b.accountCode || !Number.isInteger(fiscalYear) || amount < 0 || (month !== null && (!Number.isInteger(month) || month < 1 || month > 12))) return res.status(400).json({ success: false, message: "Budget name, account, fiscal year, valid month and non-negative amount are required." }); const data = await FinanceBudget.findOneAndUpdate({ tenantId, fiscalYear, accountCode: b.accountCode, month, costCenter: b.costCenter || "" }, { ...b, tenantId, fiscalYear, month, amount, createdBy: actor(req) }, { upsert: true, new: true, setDefaultsOnInsert: true }); return res.json({ success: true, data }); } catch (e) { next(e); } }
export async function approveBudget(req, res, next) { try { const data = await FinanceBudget.findOne(mergeTenantFilter(req, { _id: req.params.id })); if (!data) return res.status(404).json({ success: false, message: "Budget not found." }); if (data.status !== "draft") return res.status(409).json({ success: false, message: "Only draft budgets can be approved." }); data.status = "approved"; data.approvedBy = actor(req); data.approvedAt = new Date(); await data.save(); return res.json({ success: true, data }); } catch (e) { next(e); } }
export async function budgetVsActual(req, res, next) { try { requireTenantId(); const fiscalYear = Number(req.query.fiscalYear || new Date().getFullYear()); const budgets = await FinanceBudget.find(mergeTenantFilter(req, { fiscalYear, status: "approved" })).lean(); const accounts = await ChartOfAccount.find(mergeTenantFilter(req, { code: { $in: [...new Set(budgets.map((b) => b.accountCode))] } })).select("_id code type").lean(); const codes = new Map(accounts.map((a) => [String(a._id), a])); const entries = await JournalEntry.find(mergeTenantFilter(req, { status: "posted", entryDate: { $gte: new Date(`${fiscalYear}-01-01`), $lt: new Date(`${fiscalYear + 1}-01-01`) } })).select("lines entryDate").lean(); const actual = new Map(); for (const e of entries) for (const l of e.lines || []) { const a = codes.get(String(l.account)); if (!a) continue; const value = ["asset", "expense"].includes(a.type) ? Number(l.debit || 0) - Number(l.credit || 0) : Number(l.credit || 0) - Number(l.debit || 0); const key = `${a.code}:${new Date(e.entryDate).getMonth() + 1}`; actual.set(key, money((actual.get(key) || 0) + value)); } const rows = budgets.map((b) => { const actualAmount = b.month ? actual.get(`${b.accountCode}:${b.month}`) || 0 : [...Array(12)].reduce((s, _, i) => s + (actual.get(`${b.accountCode}:${i + 1}`) || 0), 0); return { ...b, actual: money(actualAmount), variance: money(b.amount - actualAmount), utilizationPercent: b.amount ? money(actualAmount / b.amount * 100) : null }; }); return res.json({ success: true, data: { fiscalYear, rows } }); } catch (e) { next(e); } }
export async function listPeriods(req, res, next) { try { return res.json({ success: true, data: await AccountingPeriod.find(mergeTenantFilter(req, {})).sort({ period: -1 }).lean() }); } catch (e) { next(e); } }
export async function closePeriod(req, res, next) { try { const tenantId = requireTenantId(); const p = String(req.params.period); if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(p)) return res.status(400).json({ success: false, message: "Period must be YYYY-MM." }); const existing = await AccountingPeriod.findOne({ tenantId, period: p }); if (existing?.status === "closed") return res.status(409).json({ success: false, message: "Accounting period is already closed." }); const from = new Date(`${p}-01T00:00:00.000Z`); const to = new Date(from); to.setUTCMonth(to.getUTCMonth() + 1); const unposted = await JournalEntry.countDocuments({ tenantId, status: "draft", entryDate: { $gte: from, $lt: to } }); if (unposted) return res.status(409).json({ success: false, message: `Cannot close ${p}: ${unposted} draft journal entries remain.` }); const data = await AccountingPeriod.findOneAndUpdate({ tenantId, period: p }, { status: "closed", closedBy: actor(req), closedAt: new Date(), note: String(req.body?.note || "") }, { upsert: true, new: true, setDefaultsOnInsert: true }); return res.json({ success: true, data }); } catch (e) { next(e); } }
export async function reopenPeriod(req, res, next) { try { const data = await AccountingPeriod.findOne(mergeTenantFilter(req, { period: String(req.params.period) })); if (!data) return res.status(404).json({ success: false, message: "Accounting period not found." }); data.status = "open"; data.reopenedBy = actor(req); data.reopenedAt = new Date(); await data.save(); return res.json({ success: true, data }); } catch (e) { next(e); } }

export async function closeFinancialYear(req, res, next) {
  try {
    const tenantId = requireTenantId(); const year = Number(req.params.year); if (!Number.isInteger(year) || year < 2000 || year > 2100) return res.status(400).json({ success: false, message: "A valid fiscal year is required." });
    const periods = await AccountingPeriod.find({ tenantId, period: { $gte: `${year}-01`, $lte: `${year}-12` } }).lean(); if (periods.some((p) => p.status !== "closed")) return res.status(409).json({ success: false, message: "All twelve accounting periods must be closed before year-end transfer." });
    const already = await JournalEntry.findOne({ tenantId, sourceType: "year_end_close", sourceId: String(year) }).lean(); if (already) return res.status(409).json({ success: false, message: `Financial year ${year} is already closed.` });
    const from = new Date(`${year}-01-01T00:00:00.000Z`); const to = new Date(`${year + 1}-01-01T00:00:00.000Z`); const entries = await JournalEntry.find({ tenantId, status: "posted", entryDate: { $gte: from, $lt: to } }).select("lines").lean(); const accounts = await ChartOfAccount.find({ tenantId, active: true, type: { $in: ["revenue", "expense"] } }).select("_id code type").lean(); const accountMap = new Map(accounts.map((a) => [String(a._id), a])); let revenue = 0; let expenses = 0; for (const e of entries) for (const l of e.lines || []) { const a = accountMap.get(String(l.account)); if (!a) continue; if (a.type === "revenue") revenue += Number(l.credit || 0) - Number(l.debit || 0); if (a.type === "expense") expenses += Number(l.debit || 0) - Number(l.credit || 0); }
    const net = money(revenue - expenses); if (Math.abs(net) < 0.01) return res.status(409).json({ success: false, message: "There is no current-year profit or loss to transfer." });
    const lines = net > 0 ? [{ code: "3010", debit: net, credit: 0, description: "Transfer prior-year profit to retained earnings" }, { code: "3020", debit: 0, credit: net, description: "Close current-year earnings" }] : [{ code: "3020", debit: -net, credit: 0, description: "Close current-year loss" }, { code: "3010", debit: 0, credit: -net, description: "Transfer prior-year loss to retained earnings" }];
    const entry = await postFinanceEntry({ tenantId, sourceType: "year_end_close", sourceId: String(year), description: `Year-end close ${year}`, reference: `YE-${year}`, date: to, lines });
    return res.json({ success: true, data: { year, revenue: money(revenue), expenses: money(expenses), netProfit: net, retainedEarningsEntry: entry } });
  } catch (e) { next(e); }
}
