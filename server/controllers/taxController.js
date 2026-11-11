/**
 * Purpose: tax Controller HTTP controller. Main declarations: actorId, listTaxRules, initializeTaxRules, upsertTaxRule, calculateTaxQuote.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import TaxRule from "../models/TaxRule.js";
// Load ../tenancy/tenantQuery.js so this module can use its exported dependencies.
import { tenantFilter } from "../tenancy/tenantQuery.js";
// Load ../services/taxEngineService.js so this module can use its exported dependencies.
import { ensureDefaultTaxRules, calculateTenantTax } from "../services/taxEngineService.js";

// Declare actorId for use by the surrounding module or function.
const actorId = (req) => req.user?._id || req.user?.id || null;

// Declare listTaxRules for use by the surrounding module or function.
export const listTaxRules = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // A new tenant should receive the configurable Kenya tax baseline on first
    // visit. This is idempotent and keeps the UI production-ready without
    // requiring an administrator to remember a separate initialization step.
    // Declare rules for use by the surrounding module or function.
    const rules = await ensureDefaultTaxRules();
    // Return the result of res.json() to the caller.
    return res.json({ success: true, data: rules });
  } catch (error) { return next(error); }
};

// Declare initializeTaxRules for use by the surrounding module or function.
export const initializeTaxRules = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try { return res.status(201).json({ success: true, data: await ensureDefaultTaxRules(req) }); }
  // Handle the error raised by the preceding protected operation.
  catch (error) { return next(error); }
};

// Declare upsertTaxRule for use by the surrounding module or function.
export const upsertTaxRule = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare body for use by the surrounding module or function.
    const body = req.body || {};
    // Declare code for use by the surrounding module or function.
    const code = String(body.code || "").trim().toUpperCase();
    // Declare name for use by the surrounding module or function.
    const name = String(body.name || "").trim();
    // Declare rate for use by the surrounding module or function.
    const rate = Number(body.rate);
    // Check the condition (!code || !name || !Number.isFinite(rate) || rate < 0 || rate > 100) and run the matching branch.
    if (!code || !name || !Number.isFinite(rate) || rate < 0 || rate > 100) return res.status(400).json({ success: false, message: "Valid code, name and rate are required." });
    // Declare data for use by the surrounding module or function.
    const data = await TaxRule.findOneAndUpdate(
      { ...tenantFilter(req), code },
      { $set: { name, taxType: body.taxType || "VAT", rate, inclusive: Boolean(body.inclusive), appliesTo: Array.isArray(body.appliesTo) ? body.appliesTo : [], effectiveFrom: body.effectiveFrom || new Date(), effectiveTo: body.effectiveTo || null, isActive: body.isActive !== false, notes: body.notes || "", updatedBy: actorId(req) }, $setOnInsert: { tenantId: req.tenantId, createdBy: actorId(req) } },
      { new: true, upsert: true, runValidators: true }
    ).lean();
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, data });
  } catch (error) { return next(error); }
};

// Declare calculateTaxQuote for use by the surrounding module or function.
export const calculateTaxQuote = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try { return res.json({ success: true, data: await calculateTenantTax(req.body || {}) }); }
  // Handle the error raised by the preceding protected operation.
  catch (error) { return next(error); }
};
