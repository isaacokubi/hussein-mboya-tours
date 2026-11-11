/**
 * Purpose: booking Pricing server application module. Main declarations: roundMoney, calculateBookingAmounts.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
/*
 * Canonical server-authoritative tour pricing.
 * Precedence:
 * 1. matching pricingRule discount (highest matching traveler band)
 * 2. tour.discount
 * 3. discountPrice is an explicit unit-price override when present.
 * Deposit configuration is separate from money actually paid.
 */
// Declare roundMoney for use by the surrounding module or function.
const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

// Declare calculateBookingAmounts for use by the surrounding module or function.
export const calculateBookingAmounts = (tour, travelerCount) => {
  // Check the condition (!tour) and run the matching branch.
  if (!tour) throw new Error("Tour is required.");
  // Check the condition (!Number.isInteger(travelerCount) || travelerCount <= 0) and run the matching branch.
  if (!Number.isInteger(travelerCount) || travelerCount <= 0) throw new Error("Invalid traveler count.");

  // Declare rawPrice for use by the surrounding module or function.
  const rawPrice = Number(tour.price);
  // Check the condition (!Number.isFinite(rawPrice) || rawPrice < 0) and run the matching branch.
  if (!Number.isFinite(rawPrice) || rawPrice < 0) throw new Error("Invalid tour price.");

  // Older tours may store discountPrice as 0 to mean "not configured".
  // Treat only a positive discountPrice as a legacy/unit-price override so a
  // real tour price such as KES 1 is still billable.
  // Declare overridePrice for use by the surrounding module or function.
  const overridePrice = Number(tour.discountPrice);
  // Declare unitPrice for use by the surrounding module or function.
  const unitPrice = Number.isFinite(overridePrice) && overridePrice > 0 ? overridePrice : rawPrice;
  // Declare subtotal for use by the surrounding module or function.
  const subtotal = roundMoney(unitPrice * travelerCount);

  // Declare rules for use by the surrounding module or function.
  const rules = Array.isArray(tour.pricingRules) ? tour.pricingRules : [];
  // Declare matchingRules for use by the surrounding module or function.
  const matchingRules = rules.filter((rule) => {
    // Declare min for use by the surrounding module or function.
    const min = Number(rule?.minTravelers);
    // Declare max for use by the surrounding module or function.
    const max = Number(rule?.maxTravelers);
    // Return the expression shown below to the caller.
    return (!Number.isFinite(min) || travelerCount >= min) && (!Number.isFinite(max) || travelerCount <= max);
  });
  // Declare matchingRule for use by the surrounding module or function.
  const matchingRule = matchingRules.sort((a, b) => Number(b?.discount || 0) - Number(a?.discount || 0))[0];
  // Declare configuredDiscount for use by the surrounding module or function.
  const configuredDiscount = matchingRule ? Number(matchingRule.discount || 0) : Number(tour.discount || 0);
  // Declare discountPercentage for use by the surrounding module or function.
  const discountPercentage = Math.min(Math.max(Number.isFinite(configuredDiscount) ? configuredDiscount : 0, 0), 100);
  // Declare discountAmount for use by the surrounding module or function.
  const discountAmount = roundMoney(Math.min(subtotal, subtotal * (discountPercentage / 100)));
  // Declare totalAmount for use by the surrounding module or function.
  const totalAmount = roundMoney(Math.max(subtotal - discountAmount, 0));

  // Declare depositConfigured for use by the surrounding module or function.
  const depositConfigured = Number(tour.depositRequired || 0);
  // Check the condition (!Number.isFinite(depositConfigured) || depositConfigured < 0) and run the matching branch.
  if (!Number.isFinite(depositConfigured) || depositConfigured < 0) throw new Error("Invalid deposit configuration.");
  // Declare depositType for use by the surrounding module or function.
  const depositType = String(tour.depositType || "fixed").toLowerCase();
  // Check the condition (!["fixed", "percentage"].includes(depositType)) and run the matching branch.
  if (!["fixed", "percentage"].includes(depositType)) throw new Error("Invalid deposit type.");
  // Declare depositAmount for use by the surrounding module or function.
  const depositAmount = depositType === "percentage"
    ? roundMoney(Math.min(totalAmount, totalAmount * (depositConfigured / 100)))
    : roundMoney(Math.min(totalAmount, depositConfigured));

  // Return the object assembled below to the caller.
  return {
    travelerCount,
    pricePerTraveler: roundMoney(unitPrice),
    subtotal,
    discountPercentage,
    discountAmount,
    totalAmount,
    depositAmount,
    amountPaid: 0,
    balanceAmount: totalAmount,
    depositType,
  };
};

export default calculateBookingAmounts;
