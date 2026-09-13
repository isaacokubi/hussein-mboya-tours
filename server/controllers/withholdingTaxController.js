import WithholdingTax from "../models/WithholdingTax.js";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import { postFinanceEntry } from "../services/financeLifecycleService.js";

const money = (n) => Math.round(Number(n || 0) * 100) / 100;
const actor = (req) => req.user?._id || req.user?.id || null;
const currentPeriod = () => new Date().toISOString().slice(0, 7);

export const listWithholdingTax = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.taxPeriod) filter.taxPeriod = req.query.taxPeriod;
    if (req.query.payee) filter.payee = req.query.payee;
    const data = await WithholdingTax.find(mergeTenantFilter(req, filter)).populate("payee", "legalName supplierNumber pin").sort({ createdAt: -1 }).limit(Math.min(Number(req.query.limit) || 200, 500)).lean();
    return res.json({ success: true, data });
  } catch (error) { return next(error); }
};

export const createWithholdingTax = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const baseAmount = money(req.body?.baseAmount);
    const rate = Number(req.body?.rate);
    if (!req.body?.payeeName || !req.body?.reference || !Number.isFinite(baseAmount) || baseAmount <= 0 || !Number.isFinite(rate) || rate < 0 || rate > 100) return res.status(400).json({ success: false, message: "Payee, reference, positive base amount and a valid 0–100% rate are required." });
    const taxAmount = money(baseAmount * (rate / 100));
    const data = await WithholdingTax.create({
      ...req.body,
      tenantId,
      baseAmount,
      rate,
      taxAmount,
      taxPeriod: String(req.body?.taxPeriod || currentPeriod()),
      createdBy: actor(req),
      updatedBy: actor(req),
    });
    return res.status(201).json({ success: true, data });
  } catch (error) { return next(error); }
};

export const remitWithholdingTax = async (req, res, next) => {
  try {
    const record = await WithholdingTax.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    if (!record) return res.status(404).json({ success: false, message: "Withholding tax record not found." });
    if (record.status === "remitted") return res.json({ success: true, data: record, alreadyRemitted: true });
    if (record.status === "cancelled") return res.status(409).json({ success: false, message: "Cancelled withholding tax cannot be remitted." });
    const paymentReference = String(req.body?.paymentReference || "").trim();
    if (!paymentReference) return res.status(422).json({ success: false, message: "A remittance payment reference is required." });

    const sourceId = `${record._id}:remittance`;
    await postFinanceEntry({
      tenantId: record.tenantId,
      sourceType: "withholding_tax_remittance",
      sourceId,
      description: `WHT remittance ${record.reference}`,
      reference: paymentReference,
      date: new Date(),
      lines: [
        { code: "2130", debit: record.taxAmount, credit: 0, description: "Withholding tax payable settled" },
        { code: "1010", debit: 0, credit: record.taxAmount, description: "WHT remittance from bank" },
      ],
    });
    record.status = "remitted";
    record.paymentReference = paymentReference;
    record.certificateNumber = String(req.body?.certificateNumber || record.certificateNumber || "").trim();
    record.remittedAt = new Date();
    record.updatedBy = actor(req);
    await record.save();
    return res.json({ success: true, data: record });
  } catch (error) { return next(error); }
};

export const cancelWithholdingTax = async (req, res, next) => {
  try {
    const record = await WithholdingTax.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    if (!record) return res.status(404).json({ success: false, message: "Withholding tax record not found." });
    if (record.status === "remitted") return res.status(409).json({ success: false, message: "Remitted withholding tax cannot be cancelled." });
    record.status = "cancelled";
    record.updatedBy = actor(req);
    await record.save();
    return res.json({ success: true, data: record });
  } catch (error) { return next(error); }
};
