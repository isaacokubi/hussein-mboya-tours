/**
 * Purpose: tax Engine Service business-logic service. Main declarations: ROUND, normalizeCategory, validRate, resolveRate, calculateTax.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import TaxProfile from "../models/TaxProfile.js";
// Load ../models/TaxRule.js so this module can use its exported dependencies.
import TaxRule from "../models/TaxRule.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { requireTenantId } from "../tenancy/context.js";

// Declare ROUND for use by the surrounding module or function.
const ROUND = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
// Declare TAX_CATEGORIES for use by the surrounding module or function.
export const TAX_CATEGORIES = Object.freeze({ STANDARD: "STANDARD", ZERO_RATED: "ZERO_RATED", EXEMPT: "EXEMPT", NON_VAT: "NON_VAT" });
// Declare normalizeCategory for use by the surrounding module or function.
const normalizeCategory = (value) => { const category = String(value || "STANDARD").trim().toUpperCase(); return Object.prototype.hasOwnProperty.call(TAX_CATEGORIES, category) ? category : TAX_CATEGORIES.STANDARD; };
// Declare validRate for use by the surrounding module or function.
const validRate = (value) => { const n = Number(value); return Number.isFinite(n) && n >= 0 && n <= 100; };
// Declare resolveRate for use by the surrounding module or function.
const resolveRate = ({ category, rate, profile, rule }) => {
  // Declare normalized for use by the surrounding module or function.
  const normalized = normalizeCategory(category);
  // Check the condition (normalized !== TAX_CATEGORIES.STANDARD) and run the matching branch.
  if (normalized !== TAX_CATEGORIES.STANDARD) return 0;
  // Check the condition (rate !== undefined && rate !== null && rate !== "") and run the matching branch.
  if (rate !== undefined && rate !== null && rate !== "") { if (!validRate(rate)) throw new Error("Invalid VAT rate."); return Number(rate); }
  // Check the condition (rule?.rate !== undefined && rule?.rate !== null && rule?.rate !== "") and run the matching branch.
  if (rule?.rate !== undefined && rule?.rate !== null && rule?.rate !== "") { if (!validRate(rule.rate)) throw new Error("Invalid VAT rate."); return Number(rule.rate); }
  // Check the condition (profile?.defaultVatRate !== undefined && profile?.defaultVatRate !== n) and run the matching branch.
  if (profile?.defaultVatRate !== undefined && profile?.defaultVatRate !== null && profile?.defaultVatRate !== "") { if (!validRate(profile.defaultVatRate)) throw new Error("Invalid VAT rate."); return Number(profile.defaultVatRate); }
  // Return a numeric value to the caller.
  return 16;
};

// Declare calculateTax for use by the surrounding module or function.
export const calculateTax = ({ amount, category = TAX_CATEGORIES.STANDARD, rate, mode = "exclusive", discount = 0 } = {}, profile = null, rule = null) => {
  // Declare gross for use by the surrounding module or function.
  const gross = Number(amount || 0); const discountAmount = Number(discount || 0);
  // Check the condition (!Number.isFinite(gross) || gross < 0) and run the matching branch.
  if (!Number.isFinite(gross) || gross < 0) throw new Error("Invalid taxable amount.");
  // Check the condition (!Number.isFinite(discountAmount) || discountAmount < 0 || discountAmou) and run the matching branch.
  if (!Number.isFinite(discountAmount) || discountAmount < 0 || discountAmount > gross) throw new Error("Invalid discount amount.");
  // Declare taxableAmount for use by the surrounding module or function.
  const taxableAmount = ROUND(gross - discountAmount); const normalizedMode = String(mode || "exclusive").toLowerCase();
  // Check the condition (!["exclusive", "inclusive"].includes(normalizedMode)) and run the matching branch.
  if (!["exclusive", "inclusive"].includes(normalizedMode)) throw new Error("Invalid tax pricing mode.");
  // Declare normalizedCategory for use by the surrounding module or function.
  const normalizedCategory = normalizeCategory(category); const taxRate = resolveRate({ category: normalizedCategory, rate, profile, rule });
  // Declare taxAmount for use by the surrounding module or function.
  let taxAmount = 0; let netAmount = taxableAmount; let totalAmount = taxableAmount;
  // Check the condition (taxRate > 0 && normalizedMode === "inclusive") and run the matching branch.
  if (taxRate > 0 && normalizedMode === "inclusive") { netAmount = ROUND(taxableAmount / (1 + taxRate / 100)); taxAmount = ROUND(taxableAmount - netAmount); }
  else if (taxRate > 0) { taxAmount = ROUND(taxableAmount * (taxRate / 100)); totalAmount = ROUND(netAmount + taxAmount); }
  // Return the object assembled below to the caller.
  return { category: normalizedCategory, mode: normalizedMode, rate: taxRate, taxableAmount, netAmount, taxAmount, totalAmount, taxCode: rule?.code || null, currency: "KES" };
};

// Declare ensureDefaultTaxRules for use by the surrounding module or function.
export const ensureDefaultTaxRules = async () => {
  // Declare tenantId for use by the surrounding module or function.
  const tenantId = requireTenantId(); const profile = await TaxProfile.findOne({ tenantId }).lean(); const configuredVatRate = Number(profile?.defaultVatRate); const vatRate = Number.isFinite(configuredVatRate) && configuredVatRate >= 0 && configuredVatRate <= 100 ? configuredVatRate : 16;
  // Declare defaults for use by the surrounding module or function.
  const defaults = [{ code: "VAT_STANDARD", name: "VAT standard rate", taxType: "VAT", rate: vatRate, appliesTo: ["tour", "accommodation", "transport", "activity", "restaurant", "service"] }, { code: "VAT_ZERO", name: "VAT zero rated", taxType: "ZERO_RATED", rate: 0, appliesTo: ["zero_rated"] }, { code: "VAT_EXEMPT", name: "VAT exempt", taxType: "EXEMPT", rate: 0, appliesTo: ["exempt"] }, { code: "NON_VAT", name: "Non-VAT supply", taxType: "NON_VAT", rate: 0, appliesTo: ["non_vat"] }];
  // Repeat the enclosed work for each required iteration.
  for (const rule of defaults) { const existing = await TaxRule.findOne({ tenantId, code: rule.code }).lean(); const missingRate = existing && (existing.rate === null || existing.rate === undefined || existing.rate === "" || !Number.isFinite(Number(existing.rate))); if (!existing) await TaxRule.create({ ...rule, tenantId }); else if (missingRate) await TaxRule.updateOne({ tenantId, code: rule.code }, { $set: { rate: rule.rate, name: rule.name, taxType: rule.taxType, appliesTo: rule.appliesTo } }); }
  // Return the result of TaxRule.find({ tenantId }).sort({ code: 1 }).lean() to the caller.
  return TaxRule.find({ tenantId }).sort({ code: 1 }).lean();
};
// Declare listTaxRules for use by the surrounding module or function.
export const listTaxRules = async () => TaxRule.find({ tenantId: requireTenantId() }).sort({ code: 1 }).lean();
// Declare calculateTenantTax for use by the surrounding module or function.
export const calculateTenantTax = async (input = {}) => { const tenantId = requireTenantId(); const profile = await TaxProfile.findOne({ tenantId }).lean(); const category = normalizeCategory(input.category || (profile?.taxRegime === "ZERO_RATED" ? "ZERO_RATED" : profile?.taxRegime === "EXEMPT" ? "EXEMPT" : profile?.taxRegime === "NON_VAT" ? "NON_VAT" : "STANDARD")); const code = String(input.taxCode || (category === "ZERO_RATED" ? "VAT_ZERO" : category === "EXEMPT" ? "VAT_EXEMPT" : category === "NON_VAT" ? "NON_VAT" : "VAT_STANDARD")).toUpperCase(); const rule = await TaxRule.findOne({ tenantId, code, isActive: true }).lean(); return calculateTax({ ...input, category, rate: input.rate ?? rule?.rate ?? profile?.defaultVatRate }, profile, rule); };
