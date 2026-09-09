import TaxProfile from "../models/TaxProfile.js";
import { requireTenantId } from "../tenancy/context.js";

const ROUND = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export const TAX_CATEGORIES = Object.freeze({
  STANDARD: "STANDARD",
  ZERO_RATED: "ZERO_RATED",
  EXEMPT: "EXEMPT",
  NON_VAT: "NON_VAT",
});

const normalizeCategory = (value) => {
  const category = String(value || "STANDARD").trim().toUpperCase();
  return Object.prototype.hasOwnProperty.call(TAX_CATEGORIES, category) ? category : TAX_CATEGORIES.STANDARD;
};

const resolveRate = ({ category, rate, profile }) => {
  const normalized = normalizeCategory(category);
  if (normalized !== TAX_CATEGORIES.STANDARD) return 0;

  const candidate = Number(rate ?? profile?.defaultVatRate ?? 16);
  if (!Number.isFinite(candidate) || candidate < 0 || candidate > 100) {
    throw new Error("Invalid VAT rate.");
  }
  return candidate;
};

/**
 * Calculate Kenyan VAT/tax without trusting a client supplied total.
 *
 * mode="exclusive": tax is added to the taxable base.
 * mode="inclusive": the supplied amount already contains VAT and the engine
 * extracts the tax portion from it.
 *
 * This is a calculation engine, not a KRA/eTIMS integration. Live eTIMS
 * submission must be handled by a separately certified provider/adapter.
 */
export const calculateTax = ({
  amount,
  category = TAX_CATEGORIES.STANDARD,
  rate,
  mode = "exclusive",
  discount = 0,
} = {}, profile = null) => {
  const gross = Number(amount || 0);
  const discountAmount = Number(discount || 0);
  if (!Number.isFinite(gross) || gross < 0) throw new Error("Invalid taxable amount.");
  if (!Number.isFinite(discountAmount) || discountAmount < 0 || discountAmount > gross) {
    throw new Error("Invalid discount amount.");
  }

  const taxableAmount = ROUND(gross - discountAmount);
  const normalizedMode = String(mode || "exclusive").toLowerCase();
  if (!["exclusive", "inclusive"].includes(normalizedMode)) throw new Error("Invalid tax pricing mode.");

  const taxRate = resolveRate({ category, rate, profile });
  const normalizedCategory = normalizeCategory(category);

  let taxAmount = 0;
  let netAmount = taxableAmount;
  let totalAmount = taxableAmount;

  if (taxRate > 0 && normalizedMode === "inclusive") {
    netAmount = ROUND(taxableAmount / (1 + taxRate / 100));
    taxAmount = ROUND(taxableAmount - netAmount);
    totalAmount = taxableAmount;
  } else if (taxRate > 0) {
    taxAmount = ROUND(taxableAmount * (taxRate / 100));
    totalAmount = ROUND(netAmount + taxAmount);
  }

  return {
    category: normalizedCategory,
    mode: normalizedMode,
    rate: taxRate,
    taxableAmount,
    netAmount,
    taxAmount,
    totalAmount,
    currency: "KES",
  };
};

export const calculateTenantTax = async (input = {}) => {
  const tenantId = requireTenantId();
  const profile = await TaxProfile.findOne({ tenantId }).lean();
  const category = normalizeCategory(input.category || (
    profile?.taxRegime === "ZERO_RATED" ? TAX_CATEGORIES.ZERO_RATED :
    profile?.taxRegime === "EXEMPT" ? TAX_CATEGORIES.EXEMPT :
    profile?.taxRegime === "NON_VAT" ? TAX_CATEGORIES.NON_VAT : TAX_CATEGORIES.STANDARD
  ));

  return calculateTax({
    ...input,
    category,
    rate: input.rate ?? profile?.defaultVatRate,
  }, profile);
};
