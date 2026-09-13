import WithholdingTax from "../models/WithholdingTax.js";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import { postFinanceEntry } from "../services/financeLifecycleService.js";

const money = (n) => Math.round(Number(n || 0) * 100) / 100;
const actor = (req) => req.user?._id || req.user?.id || null;
const currentPeriod = () => new Date().toISOString().slice(0, 7);
const validPeriod = (value) => /^\d{4}-(0[1-9]|1[0-2])$/.test(String(value || ""));

export const listWithholdingTax = async (req, res, next) => {
  try {
    requireTenantId();
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.taxPeriod) filter.taxPeriod = req.query.taxPeriod;
    if (req.query.payee) filter.payee = req.query.payee;
    const data = await WithholdingTax.find(mergeTenantFilter(req, filter)).populate("payee", "legalName supplierNumber pin").sort({ createdAt: -1 }).limit(Math.min(Number(req.query.limit) || 200, 500)).lean();
    const totals = data.reduce((a, row) => { a.baseAmount += Number(row.baseAmount || 0); a.taxAmount += Number(row.taxAmount || 0); if (row.status === "remitted") a.remitted += Number(row.taxAmount || 0); if (row.status === "accrued") a.accrued += Number(row.taxAmount || 0); return a; }, { baseAmount: 0, taxAmount: 0, remitted: 0, accrued: 0 });
    return res.json({ success: true, data, totals: Object.fromEntries(Object.entries(totals).map(([k, v]) => [k, money(v)])) });
  } catch (error) { return next(error); }
};

export const createWithholdingTax = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const baseAmount = money(req.body?.baseAmount);
    const rate = Number(req.body?.rate);
    const taxPeriod = String(req.body?.taxPeriod || currentPeriod());
    if (!String(req.body?.payeeName || "").trim() || !String(req.body?.reference || "").trim() || !Number.isFinite(baseAmount) || baseAmount <= 0 || !Number.isFinite(rate) || rate < 0 || rate > 100 || !validPeriod(taxPeriod)) return res.status(422).json({ success: false, message: "Payee, reference, positive base amount, valid 0–100% rate and YYYY-MM tax period are required." });
    const taxAmount = money(baseAmount * (rate / 100));
    const data = await WithholdingTax.create({ ...req.body, tenantId, baseAmount, rate, taxAmount, taxPeriod, currency: "KES", status: "accrued", createdBy: actor(req), updatedBy: actor(req) });
    if (data.sourceType === "supplier_payment" && taxAmount > 0) {
      await postFinanceEntry({ tenantId, sourceType: "withholding_tax_accrual", sourceId: data._id, description: `WHT withheld ${data.reference}`, reference: data.reference, lines: [{ code: "2000", debit: taxAmount, credit: 0, description: "Supplier payable withheld" }, { code: "2130", debit: 0, credit: taxAmount, description: "Withholding tax payable" }] });
    }
    return res.status(201).json({ success: true, data });
  } catch (error) { return next(error); }
};

export const remitWithholdingTax = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const record = await WithholdingTax.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    if (!record) return res.status(404).json({ success: false, message: "Withholding tax record not found." });
    if (record.status === "remitted") return res.json({ success: true, data: record, alreadyRemitted: true });
    if (record.status === "cancelled") return res.status(409).json({ success: false, message: "Cancelled withholding tax cannot be remitted." });
    const paymentReference = String(req.body?.paymentReference || "").trim();
    if (!paymentReference) return res.status(422).json({ success: false, message: "A remittance payment reference is required." });
    await postFinanceEntry({ tenantId, sourceType: "withholding_tax_remittance", sourceId: record._id, description: `WHT remittance ${record.reference}`, reference: paymentReference, date: new Date(), lines: [{ code: "2130", debit: record.taxAmount, credit: 0, description: "Withholding tax payable settled" }, { code: "1010", debit: 0, credit: record.taxAmount, description: "WHT remittance from bank" }] });
    record.status = "remitted"; record.paymentReference = paymentReference; record.certificateNumber = String(req.body?.certificateNumber || record.certificateNumber || "").trim(); record.remittedAt = new Date(); record.updatedBy = actor(req); await record.save();
    return res.json({ success: true, data: record });
  } catch (error) { return next(error); }
};

export const cancelWithholdingTax = async (req, res, next) => {
  try {
    requireTenantId();
    const record = await WithholdingTax.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    if (!record) return res.status(404).json({ success: false, message: "Withholding tax record not found." });
    if (record.status === "remitted") return res.status(409).json({ success: false, message: "Remitted withholding tax cannot be cancelled." });
    record.status = "cancelled"; record.updatedBy = actor(req); await record.save();
    return res.json({ success: true, data: record });
  } catch (error) { return next(error); }
};
