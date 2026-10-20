/*
 * Canonical server-authoritative tour pricing.
 * Precedence:
 * 1. matching pricingRule discount (highest matching traveler band)
 * 2. tour.discount
 * 3. discountPrice is an explicit unit-price override when present.
 * Deposit configuration is separate from money actually paid.
 */
// Round currency amounts to two decimal places, reducing common floating-point rounding issues.
const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

// Calculate the amounts due for a tour booking on the server.
export const calculateBookingAmounts = (tour, travelerCount) => {
  // Require a tour record before reading its price settings.
  if (!tour) throw new Error("Tour is required.");
  // Require a positive integer traveler count.
  if (!Number.isInteger(travelerCount) || travelerCount <= 0) throw new Error("Invalid traveler count.");

  // Convert the standard tour price to a number.
  const rawPrice = Number(tour.price);
  // Reject invalid or negative standard prices.
  if (!Number.isFinite(rawPrice) || rawPrice < 0) throw new Error("Invalid tour price.");

  // Read the optional override price, which may be stored on legacy tour records.
  const overridePrice = Number(tour.discountPrice);
  // Use the configured override when it is finite and non-negative; otherwise use the standard price.
  const unitPrice = Number.isFinite(overridePrice) && overridePrice >= 0 ? overridePrice : rawPrice;
  // Calculate the pre-discount subtotal for all travelers.
  const subtotal = roundMoney(unitPrice * travelerCount);

  // Use pricing rules only when the field contains an array.
  const rules = Array.isArray(tour.pricingRules) ? tour.pricingRules : [];
  // Select rules whose traveler-count bounds include this booking.
  const matchingRules = rules.filter((rule) => {
    // Read the optional minimum traveler count.
    const min = Number(rule?.minTravelers);
    // Read the optional maximum traveler count.
    const max = Number(rule?.maxTravelers);
    // Treat non-finite bounds as open-ended; otherwise enforce the configured limits.
    return (!Number.isFinite(min) || travelerCount >= min) && (!Number.isFinite(max) || travelerCount <= max);
  });
  // Choose the matching pricing rule with the greatest discount percentage.
  const matchingRule = matchingRules.sort((a, b) => Number(b?.discount || 0) - Number(a?.discount || 0))[0];
  // Prefer the selected rule's discount and fall back to the tour-wide discount.
  const configuredDiscount = matchingRule ? Number(matchingRule.discount || 0) : Number(tour.discount || 0);
  // Clamp discount to a safe range from 0% through 100%.
  const discountPercentage = Math.min(Math.max(Number.isFinite(configuredDiscount) ? configuredDiscount : 0, 0), 100);
  // Calculate the discount amount and do not allow it to exceed the subtotal.
  const discountAmount = roundMoney(Math.min(subtotal, subtotal * (discountPercentage / 100)));
  // Calculate the final total and prevent a negative result.
  const totalAmount = roundMoney(Math.max(subtotal - discountAmount, 0));

  // Read the configured deposit, defaulting to zero when no deposit is required.
  const depositConfigured = Number(tour.depositRequired || 0);
  // Reject negative or non-numeric deposit values.
  if (!Number.isFinite(depositConfigured) || depositConfigured < 0) throw new Error("Invalid deposit configuration.");
  // Normalize the deposit mode, defaulting to a fixed amount.
  const depositType = String(tour.depositType || "fixed").toLowerCase();
  // Permit only the fixed-currency or percentage deposit modes.
  if (!["fixed", "percentage"].includes(depositType)) throw new Error("Invalid deposit type.");
  // Calculate the deposit as a percentage of total or as a fixed amount capped by the total.
  const depositAmount = depositType === "percentage"
    ? roundMoney(Math.min(totalAmount, totalAmount * (depositConfigured / 100)))
    : roundMoney(Math.min(totalAmount, depositConfigured));

  // Return a complete pricing snapshot for booking creation.
  return {
    travelerCount, // Number of travelers included in this calculation.
    pricePerTraveler: roundMoney(unitPrice), // Unit price after applying any override.
    subtotal, // Amount before discounts.
    discountPercentage, // Discount percentage selected from the pricing rules or tour.
    discountAmount, // Currency amount deducted from the subtotal.
    totalAmount, // Final amount due after discount.
    depositAmount, // Configured deposit due at the start.
    amountPaid: 0, // No payment has been recorded by the pricing calculator.
    balanceAmount: totalAmount, // Full balance remains due until payments are recorded.
    depositType, // Preserve the configured deposit mode for display and audit.
  };
};

// Export the calculator as the default import for existing callers.
export default calculateBookingAmounts;
