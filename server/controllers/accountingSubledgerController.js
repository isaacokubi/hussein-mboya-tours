import AccountingSubledger from "../models/AccountingSubledger.js";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";

const money = (n) => Math.round(Number(n || 0) * 100) / 100;
const allowed = new Set(["inventory", "payroll", "accrual", "prepayment", "fx"]);

export const listSubledger = async (req, res, next) => {
  try { requireTenantId(); const q = mergeTenantFilter(req, { type: String(req.query.type || "") }); if (!allowed.has(q.type)) delete q.type; const rows = await AccountingSubledger.find(q).sort({ transactionDate: -1, createdAt: -1 }).limit(500).lean(); return res.json({ success: true, data: rows }); } catch (e) { next(e); }
};

export const createSubledger = async (req, res, next) => {
  try {
    const tenantId = requireTenantId(); const b = req.body || {}; const type = String(b.type || "").trim().toLowerCase(); const amount = money(b.amount); const rate = Number(b.exchangeRate || 1); const quantity = Number(b.quantity || 0);
    if (!allowed.has(type)) return res.status(400).json({ success: false, message: "Unsupported accounting subledger type." });
    if (!b.reference || !b.description || amount <= 0 || !Number.isFinite(rate) || rate <= 0) return res.status(400).json({ success: false, message: "Reference, description, positive amount and exchange rate are required." });
    const baseAmount = money(amount * rate);
    const row = await AccountingSubledger.create({ tenantId, type, reference: String(b.reference).trim(), transactionDate: b.transactionDate || new Date(), description: String(b.description).trim(), amount, currency: String(b.currency || "KES").toUpperCase(), exchangeRate: rate, baseAmount, quantity, unitCost: money(b.unitCost), accountCode: String(b.accountCode || "").trim(), contraAccountCode: String(b.contraAccountCode || "").trim(), metadata: b.metadata || {}, createdBy: req.user?._id || null });
    return res.status(201).json({ success: true, data: row });
  } catch (e) { if (e?.code === 11000) return res.status(409).json({ success: false, message: "This subledger reference already exists for the tenant." }); next(e); }
};
