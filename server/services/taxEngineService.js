import TaxProfile from "../models/TaxProfile.js";
import TaxRule from "../models/TaxRule.js";
import { requireTenantId } from "../tenancy/context.js";

const ROUND = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export const TAX_CATEGORIES = Object.freeze({ STANDARD: "STANDARD", ZERO_RATED: "ZERO_RATED", EXEMPT: "EXEMPT", NON_VAT: "NON_VAT" });
const normalizeCategory = (value) => { const category = String(value || "STANDARD").trim().toUpperCase(); return Object.prototype.hasOwnProperty.call(TAX_CATEGORIES, category) ? category : TAX_CATEGORIES.STANDARD; };

const resolveRate = ({ category, rate, profile, rule }) => {
  const normalized = normalizeCategory(category);
  if (normalized !== TAX_CATEGORIES.STANDARD) return 0;
  const candidate = Number(rate ?? rule?.rate ?? profile?.defaultVatRate ?? 16);
  if (!Number.isFinite(candidate) || candidate < 0 || candidate > 100) throw new Error("Invalid VAT rate.");
  return candidate;
};

export const calculateTax = ({ amount, category = TAX_CATEGORIES.STANDARD, rate, mode = "exclusive", discount = 0 } = {}, profile = null, rule = null) => {
  const gross = Number(amount || 0); const discountAmount = Number(discount || 0);
  if (!Number.isFinite(gross) || gross < 0) throw new Error("Invalid taxable amount.");
  if (!Number.isFinite(discountAmount) || discountAmount < 0 || discountAmount > gross) throw new Error("Invalid discount amount.");
  const taxableAmount = ROUND(gross - discountAmount); const normalizedMode = String(mode || "exclusive").toLowerCase();
  if (!["exclusive", "inclusive"].includes(normalizedMode)) throw new Error("Invalid tax pricing mode.");
  const normalizedCategory = normalizeCategory(category); const taxRate = resolveRate({ category: normalizedCategory, rate, profile, rule });
  let taxAmount = 0; let netAmount = taxableAmount; let totalAmount = taxableAmount;
  if (taxRate > 0 && normalizedMode === "inclusive") { netAmount = ROUND(taxableAmount / (1 + taxRate / 100)); taxAmount = ROUND(taxableAmount - netAmount); }
  else if (taxRate > 0) { taxAmount = ROUND(taxableAmount * (taxRate / 100)); totalAmount = ROUND(netAmount + taxAmount); }
  return { category: normalizedCategory, mode: normalizedMode, rate: taxRate, taxableAmount, netAmount, taxAmount, totalAmount, taxCode: rule?.code || null, currency: "KES" };
};

export const ensureDefaultTaxRules = async () => {
  const tenantId = requireTenantId(); const profile = await TaxProfile.findOne({ tenantId }).lean(); const vatRate = Number(profile?.defaultVatRate ?? 16);
  const defaults = [
    { code: "VAT_STANDARD", name: "VAT standard rate", taxType: "VAT", rate: vatRate, appliesTo: ["tour", "accommodation", "transport", "activity", "restaurant", "service"] },
    { code: "VAT_ZERO", name: "VAT zero rated", taxType: "ZERO_RATED", rate: 0, appliesTo: ["zero_rated"] },
    { code: "VAT_EXEMPT", name: "VAT exempt", taxType: "EXEMPT", rate: 0, appliesTo: ["exempt"] },
    { code: "NON_VAT", name: "Non-VAT supply", taxType: "NON_VAT", rate: 0, appliesTo: ["non_vat"] },
  ];
  for (const rule of defaults) await TaxRule.updateOne({ tenantId, code: rule.code }, { $setOnInsert: { ...rule, tenantId } }, { upsert: true });
  return TaxRule.find({ tenantId }).sort({ code: 1 }).lean();
};

export const listTaxRules = async () => TaxRule.find({ tenantId: requireTenantId() }).sort({ code: 1 }).lean();

export const calculateTenantTax = async (input = {}) => {
  const tenantId = requireTenantId(); const profile = await TaxProfile.findOne({ tenantId }).lean();
  const category = normalizeCategory(input.category || (profile?.taxRegime === "ZERO_RATED" ? "ZERO_RATED" : profile?.taxRegime === "EXEMPT" ? "EXEMPT" : profile?.taxRegime === "NON_VAT" ? "NON_VAT" : "STANDARD"));
  const code = String(input.taxCode || (category === "ZERO_RATED" ? "VAT_ZERO" : category === "EXEMPT" ? "VAT_EXEMPT" : category === "NON_VAT" ? "NON_VAT" : "VAT_STANDARD")).toUpperCase();
  const rule = await TaxRule.findOne({ tenantId, code, isActive: true }).lean();
  return calculateTax({ ...input, category, rate: input.rate ?? rule?.rate ?? profile?.defaultVatRate }, profile, rule);
};
