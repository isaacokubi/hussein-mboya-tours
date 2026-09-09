import TaxRule from "../models/TaxRule.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";
import { ensureDefaultTaxRules, calculateTenantTax } from "../services/taxEngineService.js";

const actorId = (req) => req.user?._id || req.user?.id || null;

export const listTaxRules = async (req, res, next) => {
  try { return res.json({ success: true, data: await TaxRule.find(tenantFilter(req)).sort({ code: 1 }).lean() }); }
  catch (error) { return next(error); }
};

export const initializeTaxRules = async (req, res, next) => {
  try { return res.status(201).json({ success: true, data: await ensureDefaultTaxRules(req) }); }
  catch (error) { return next(error); }
};

export const upsertTaxRule = async (req, res, next) => {
  try {
    const body = req.body || {};
    const code = String(body.code || "").trim().toUpperCase();
    const name = String(body.name || "").trim();
    const rate = Number(body.rate);
    if (!code || !name || !Number.isFinite(rate) || rate < 0 || rate > 100) return res.status(400).json({ success: false, message: "Valid code, name and rate are required." });
    const data = await TaxRule.findOneAndUpdate(
      { ...tenantFilter(req), code },
      { $set: { name, taxType: body.taxType || "VAT", rate, inclusive: Boolean(body.inclusive), appliesTo: Array.isArray(body.appliesTo) ? body.appliesTo : [], effectiveFrom: body.effectiveFrom || new Date(), effectiveTo: body.effectiveTo || null, isActive: body.isActive !== false, notes: body.notes || "", updatedBy: actorId(req) }, $setOnInsert: { tenantId: req.tenantId, createdBy: actorId(req) } },
      { new: true, upsert: true, runValidators: true }
    ).lean();
    return res.status(200).json({ success: true, data });
  } catch (error) { return next(error); }
};

export const calculateTaxQuote = async (req, res, next) => {
  try { return res.json({ success: true, data: await calculateTenantTax(req.body || {}) }); }
  catch (error) { return next(error); }
};
