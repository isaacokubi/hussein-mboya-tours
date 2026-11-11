/**
 * Purpose: withholding Tax Controller HTTP controller. Main declarations: money, actor, currentPeriod, validPeriod, normaliseSourceType.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import WithholdingTax from "../models/WithholdingTax.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../services/financeLifecycleService.js so this module can use its exported dependencies.
import { postFinanceEntry } from "../services/financeLifecycleService.js";

// Declare money for use by the surrounding module or function.
const money = (n) => Math.round(Number(n || 0) * 100) / 100;
// Declare actor for use by the surrounding module or function.
const actor = (req) => req.user?._id || req.user?.id || null;
// Declare currentPeriod for use by the surrounding module or function.
const currentPeriod = () => new Date().toISOString().slice(0, 7);
// Declare validPeriod for use by the surrounding module or function.
const validPeriod = (value) => /^(\d{4})-(0[1-9]|1[0-2])$/.test(String(value || ""));
// Declare normaliseSourceType for use by the surrounding module or function.
const normaliseSourceType = (value) => ["supplier_payment", "expense", "commission", "other"].includes(value) ? value : "other";

// Declare listWithholdingTax for use by the surrounding module or function.
export const listWithholdingTax = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Declare filter for use by the surrounding module or function.
    const filter = {};
    // Check the condition (req.query.status) and run the matching branch.
    if (req.query.status) filter.status = req.query.status;
    // Check the condition (req.query.taxPeriod) and run the matching branch.
    if (req.query.taxPeriod) filter.taxPeriod = req.query.taxPeriod;
    // Check the condition (req.query.payee) and run the matching branch.
    if (req.query.payee) filter.payee = req.query.payee;
    // Declare data for use by the surrounding module or function.
    const data = await WithholdingTax.find(mergeTenantFilter(req, filter)).populate("payee", "legalName supplierNumber pin").sort({ createdAt: -1 }).limit(Math.min(Number(req.query.limit) || 200, 500)).lean();
    // Declare totals for use by the surrounding module or function.
    const totals = data.reduce((a, row) => { a.baseAmount += Number(row.baseAmount || 0); a.taxAmount += Number(row.taxAmount || 0); if (row.status === "remitted") a.remitted += Number(row.taxAmount || 0); if (row.status === "accrued") a.accrued += Number(row.taxAmount || 0); return a; }, { baseAmount: 0, taxAmount: 0, remitted: 0, accrued: 0 });
    // Declare sourceData for use by the surrounding module or function.
    const sourceData = data.map((row) => ({
      ...row,
      source: {
        type: row.sourceType || "other",
        id: row.sourceId || null,
        reference: row.reference || null,
        paymentReference: row.paymentReference || null,
        certificateNumber: row.certificateNumber || null,
      },
    }));
    // Return the result of res.json() to the caller.
    return res.json({ success: true, data: sourceData, totals: Object.fromEntries(Object.entries(totals).map(([k, v]) => [k, money(v)])) });
  } catch (error) { return next(error); }
};

// Declare createWithholdingTax for use by the surrounding module or function.
export const createWithholdingTax = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId();
    // Declare baseAmount for use by the surrounding module or function.
    const baseAmount = money(req.body?.baseAmount);
    // Declare rate for use by the surrounding module or function.
    const rate = Number(req.body?.rate);
    // Declare taxPeriod for use by the surrounding module or function.
    const taxPeriod = String(req.body?.taxPeriod || "").trim();
    // Declare payeeName for use by the surrounding module or function.
    const payeeName = String(req.body?.payeeName || "").trim();
    // Declare payeePin for use by the surrounding module or function.
    const payeePin = String(req.body?.payeePin || "").trim();
    // Declare reference for use by the surrounding module or function.
    const reference = String(req.body?.reference || "").trim();
    // Declare sourceType for use by the surrounding module or function.
    const sourceType = normaliseSourceType(req.body?.sourceType);
    // Declare sourceId for use by the surrounding module or function.
    const sourceId = req.body?.sourceId ? String(req.body.sourceId).trim() : undefined;
    // Check the condition (!payeeName || !reference || !Number.isFinite(baseAmount) || baseAmount) and run the matching branch.
    if (!payeeName || !reference || !Number.isFinite(baseAmount) || baseAmount <= 0 || !Number.isFinite(rate) || rate < 0 || rate > 100 || !validPeriod(taxPeriod)) return res.status(422).json({ success: false, message: "Payee, reference, positive base amount, valid 0–100% rate and YYYY-MM tax period are required." });
    // Check the condition (sourceId && !/^[a-f\d]{24}$/i.test(sourceId)) and run the matching branch.
    if (sourceId && !/^[a-f\d]{24}$/i.test(sourceId)) return res.status(422).json({ success: false, message: "Source ID must be a valid record identifier when supplied." });
    // Declare taxAmount for use by the surrounding module or function.
    const taxAmount = money(baseAmount * (rate / 100));
    // Declare data for use by the surrounding module or function.
    const data = await WithholdingTax.create({
      ...req.body,
      tenantId,
      payeeName,
      payeePin,
      reference,
      sourceType,
      ...(sourceId ? { sourceId } : {}),
      baseAmount,
      rate,
      taxAmount,
      taxPeriod,
      currency: "KES",
      status: "accrued",
      createdBy: actor(req),
      updatedBy: actor(req),
    });
    // Check the condition (data.sourceType === "supplier_payment" && taxAmount > 0) and run the matching branch.
    if (data.sourceType === "supplier_payment" && taxAmount > 0) {
      // Perform the side effect or state update expressed on the following line.
      await postFinanceEntry({ tenantId, sourceType: "withholding_tax_accrual", sourceId: data._id, description: `WHT withheld ${data.reference}`, reference: data.reference, lines: [{ code: "2000", debit: taxAmount, credit: 0, description: "Supplier payable withheld" }, { code: "2130", debit: 0, credit: taxAmount, description: "Withholding tax payable" }] });
    }
    // Return the result of res.status(201).json() to the caller.
    return res.status(201).json({ success: true, data });
  } catch (error) { return next(error); }
};

// Declare remitWithholdingTax for use by the surrounding module or function.
export const remitWithholdingTax = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId();
    // Declare record for use by the surrounding module or function.
    const record = await WithholdingTax.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    // Check the condition (!record) and run the matching branch.
    if (!record) return res.status(404).json({ success: false, message: "Withholding tax record not found." });
    // Check the condition (record.status === "remitted") and run the matching branch.
    if (record.status === "remitted") return res.json({ success: true, data: record, alreadyRemitted: true });
    // Check the condition (record.status === "cancelled") and run the matching branch.
    if (record.status === "cancelled") return res.status(409).json({ success: false, message: "Cancelled withholding tax cannot be remitted." });
    // Declare paymentReference for use by the surrounding module or function.
    const paymentReference = String(req.body?.paymentReference || "").trim();
    // Check the condition (!paymentReference) and run the matching branch.
    if (!paymentReference) return res.status(422).json({ success: false, message: "A remittance payment reference is required." });
    // Declare certificateNumber for use by the surrounding module or function.
    const certificateNumber = String(req.body?.certificateNumber || record.certificateNumber || "").trim();
    // Perform the side effect or state update expressed on the following line.
    await postFinanceEntry({ tenantId, sourceType: "withholding_tax_remittance", sourceId: record._id, description: `WHT remittance ${record.reference}`, reference: paymentReference, date: new Date(), lines: [{ code: "2130", debit: record.taxAmount, credit: 0, description: "Withholding tax payable settled" }, { code: "1010", debit: 0, credit: record.taxAmount, description: "WHT remittance from bank" }] });
    // Perform the side effect or state update expressed on the following line.
    record.status = "remitted";
    // Perform the side effect or state update expressed on the following line.
    record.paymentReference = paymentReference;
    // Perform the side effect or state update expressed on the following line.
    record.certificateNumber = certificateNumber;
    // Perform the side effect or state update expressed on the following line.
    record.remittedAt = new Date();
    // Perform the side effect or state update expressed on the following line.
    record.updatedBy = actor(req);
    // Perform the side effect or state update expressed on the following line.
    await record.save();
    // Return the result of res.json() to the caller.
    return res.json({ success: true, data: record });
  } catch (error) { return next(error); }
};

// Declare cancelWithholdingTax for use by the surrounding module or function.
export const cancelWithholdingTax = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Declare record for use by the surrounding module or function.
    const record = await WithholdingTax.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    // Check the condition (!record) and run the matching branch.
    if (!record) return res.status(404).json({ success: false, message: "Withholding tax record not found." });
    // Check the condition (record.status === "remitted") and run the matching branch.
    if (record.status === "remitted") return res.status(409).json({ success: false, message: "Remitted withholding tax cannot be cancelled." });
    // Perform the side effect or state update expressed on the following line.
    record.status = "cancelled"; record.updatedBy = actor(req); await record.save();
    // Return the result of res.json() to the caller.
    return res.json({ success: true, data: record });
  } catch (error) { return next(error); }
};
