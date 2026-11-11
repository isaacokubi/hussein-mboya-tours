/**
 * Purpose: accounting Export Controller HTTP controller. Main declarations: esc, exportGeneralLedgerCSV, exportTaxControlCSV.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import JournalEntry from "../models/JournalEntry.js";
// Load ../models/ChartOfAccount.js so this module can use its exported dependencies.
import ChartOfAccount from "../models/ChartOfAccount.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { requireTenantId } from "../tenancy/context.js";

// Declare esc for use by the surrounding module or function.
const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
// Declare exportGeneralLedgerCSV for use by the surrounding module or function.
export const exportGeneralLedgerCSV = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try { const tenantId = requireTenantId(); const accounts = await ChartOfAccount.find({ tenantId }).select("_id code name type").lean(); const map = new Map(accounts.map(a => [String(a._id), a])); const filter = { tenantId, status: "posted" }; if (req.query.from || req.query.to) filter.entryDate = { ...(req.query.from ? { $gte: new Date(`${req.query.from}T00:00:00.000Z`) } : {}), ...(req.query.to ? { $lte: new Date(`${req.query.to}T23:59:59.999Z`) } : {}) }; const entries = await JournalEntry.find(filter).sort({ entryDate: 1, entryNumber: 1 }).lean(); const lines = ["Date,Entry,Reference,Description,Account Code,Account,Type,Line Description,Debit,Credit"]; for (const e of entries) for (const l of e.lines || []) { const a = map.get(String(l.account)); lines.push([new Date(e.entryDate).toISOString().slice(0,10),e.entryNumber,e.reference,e.description,a?.code || "",a?.name || "",a?.type || "",l.description,Number(l.debit||0).toFixed(2),Number(l.credit||0).toFixed(2)].map(esc).join(",")); } res.setHeader("Content-Type", "text/csv; charset=utf-8"); res.setHeader("Content-Disposition", `attachment; filename="general-ledger-${tenantId}.csv"`); return res.send(lines.join("\n")); } catch (e) { next(e); }
};

// Declare exportTaxControlCSV for use by the surrounding module or function.
export const exportTaxControlCSV = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try { const tenantId = requireTenantId(); const accounts = await ChartOfAccount.find({ tenantId, code: { $in: ["2110", "2120", "2130"] } }).select("_id code name").lean(); const map = new Map(accounts.map(a => [String(a._id), a])); const filter = { tenantId, status: "posted" }; if (req.query.from || req.query.to) filter.entryDate = { ...(req.query.from ? { $gte: new Date(`${req.query.from}T00:00:00.000Z`) } : {}), ...(req.query.to ? { $lte: new Date(`${req.query.to}T23:59:59.999Z`) } : {}) }; const entries = await JournalEntry.find(filter).sort({ entryDate: 1 }).lean(); const rows = ["Date,Entry,Reference,Account Code,Account,Debit,Credit"]; for (const e of entries) for (const l of e.lines || []) { const a = map.get(String(l.account)); if (!a) continue; rows.push([new Date(e.entryDate).toISOString().slice(0,10),e.entryNumber,e.reference,a.code,a.name,Number(l.debit||0).toFixed(2),Number(l.credit||0).toFixed(2)].map(esc).join(",")); } res.setHeader("Content-Type", "text/csv; charset=utf-8"); res.setHeader("Content-Disposition", `attachment; filename="tax-control-${tenantId}.csv"`); return res.send(rows.join("\n")); } catch (e) { next(e); }
};
