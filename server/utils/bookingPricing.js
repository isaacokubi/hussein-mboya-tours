/*
 * Canonical server-authoritative tour pricing.
 * Precedence:
 * 1. matching pricingRule discount (highest matching traveler band)
 * 2. tour.discount
 * 3. discountPrice is an explicit unit-price override when present.
 * Deposit configuration is separate from money actually paid.
 */
// Round a numeric amount to two decimal places using an epsilon to reduce floating-point edge cases.
const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

// Calculate the booking subtotal, discount, total and configured deposit on the server.
export const calculateBookingAmounts = (tour, travelerCount) => {
  // Require a tour record so pricing cannot be calculated from a missing selection.
  if (!tour) throw new Error("Tour is required.");
  // Require a positive whole-number traveler count.
  if (!Number.isInteger(travelerCount) || travelerCount <= 0) throw new Error("Invalid traveler count.");

  // Convert the stored tour price into a number before using it in calculations.
  const rawPrice = Number(tour.price);
  // Reject missing, non-numeric or negative prices.
  if (!Number.isFinite(rawPrice) || rawPrice < 0) throw new Error("Invalid tour price.");

  // Older tours may store discountPrice as 0 to mean "not configured".
  // Treat only a positive discountPrice as a legacy/unit-price override so a
  // real tour price such as KES 1 is still billable.
  // Read the optional legacy discounted unit price.
  const overridePrice = Number(tour.discountPrice);
  // Use the positive override when valid; otherwise use the standard tour price.
  const unitPrice = Number.isFinite(overridePrice) && overridePrice > 0 ? overridePrice : rawPrice;
  // Multiply the selected unit price by the number of travelers and round the result.
  const subtotal = roundMoney(unitPrice * travelerCount);

  // Read pricing rules only when the stored value is an array.
  const rules = Array.isArray(tour.pricingRules) ? tour.pricingRules : [];
  // Keep rules whose traveler-count bands include this booking's traveler count.
  const matchingRules = rules.filter((rule) => {
    // Convert the lower traveler-count boundary to a number.
    const min = Number(rule?.minTravelers);
    // Convert the upper traveler-count boundary to a number.
    const max = Number(rule?.maxTravelers);
    // Treat a missing/non-finite boundary as unbounded on that side.
    return (!Number.isFinite(min) || travelerCount >= min) && (!Number.isFinite(max) || travelerCount <= max);
  });
  // Select the matching rule with the largest discount percentage.
  const matchingRule = matchingRules.sort((a, b) => Number(b?.discount || 0) - Number(a?.discount || 0))[0];
  // Prefer the selected rule's discount; fall back to the tour-level discount.
  const configuredDiscount = matchingRule ? Number(matchingRule.discount || 0) : Number(tour.discount || 0);
  // Clamp the configured discount to the safe range from zero to one hundred percent.
  const discountPercentage = Math.min(Math.max(Number.isFinite(configuredDiscount) ? configuredDiscount : 0, 0), 100);
  // Calculate the discount without allowing it to exceed the subtotal.
  const discountAmount = roundMoney(Math.min(subtotal, subtotal * (discountPercentage / 100)));
  // Subtract the discount and ensure the final amount never becomes negative.
  const totalAmount = roundMoney(Math.max(subtotal - discountAmount, 0));

  // Read the configured deposit amount or percentage; absent configuration means zero.
  const depositConfigured = Number(tour.depositRequired || 0);
  // Reject negative or non-numeric deposit configuration.
  if (!Number.isFinite(depositConfigured) || depositConfigured < 0) throw new Error("Invalid deposit configuration.");
  // Normalize the deposit type, defaulting to a fixed currency amount.
  const depositType = String(tour.depositType || "fixed").toLowerCase();
  // Accept only the two deposit calculation modes supported by the application.
  if (!["fixed", "percentage"].includes(depositType)) throw new Error("Invalid deposit type.");
  // Calculate a percentage deposit against the total, or cap a fixed deposit at the total.
  const depositAmount = depositType === "percentage"
    ? roundMoney(Math.min(totalAmount, totalAmount * (depositConfigured / 100)))
    : roundMoney(Math.min(totalAmount, depositConfigured));

  // Return all calculated amounts for booking creation and payment workflows.
  return {
    travelerCount, // Number of travelers included in the calculation.
    pricePerTraveler: roundMoney(unitPrice), // Selected unit price after legacy override handling.
    subtotal, // Total before applying discounts.
    discountPercentage, // Percentage used to calculate the discount.
    discountAmount, // Currency amount removed by the discount.
    totalAmount, // Final amount due after the discount.
    depositAmount, // Configured initial deposit amount.
    amountPaid: 0, // New bookings begin with no recorded payment.
    balanceAmount: totalAmount, // Until a payment is recorded, the full total remains due.
    depositType, // Preserve the configured deposit mode for later display/audit.
  };
};

// Export the calculator as the default import for existing callers.
export default calculateBookingAmounts;
