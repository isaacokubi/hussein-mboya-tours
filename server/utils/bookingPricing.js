/*
 * Canonical server-authoritative tour pricing.
 * Precedence:
 * 1. matching pricingRule discount (highest matching traveler band)
 * 2. tour.discount
 * 3. discountPrice is an explicit unit-price override when present.
 * Deposit configuration is separate from money actually paid.
 */
const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export const calculateBookingAmounts = (tour, travelerCount) => {
  if (!tour) throw new Error("Tour is required.");
  if (!Number.isInteger(travelerCount) || travelerCount <= 0) throw new Error("Invalid traveler count.");

  const rawPrice = Number(tour.price);
  if (!Number.isFinite(rawPrice) || rawPrice < 0) throw new Error("Invalid tour price.");

  const overridePrice = Number(tour.discountPrice);
  const unitPrice = Number.isFinite(overridePrice) && overridePrice >= 0 ? overridePrice : rawPrice;
  const subtotal = roundMoney(unitPrice * travelerCount);

  const rules = Array.isArray(tour.pricingRules) ? tour.pricingRules : [];
  const matchingRules = rules.filter((rule) => {
    const min = Number(rule?.minTravelers);
    const max = Number(rule?.maxTravelers);
    return (!Number.isFinite(min) || travelerCount >= min) && (!Number.isFinite(max) || travelerCount <= max);
  });
  const matchingRule = matchingRules.sort((a, b) => Number(b?.discount || 0) - Number(a?.discount || 0))[0];
  const configuredDiscount = matchingRule ? Number(matchingRule.discount || 0) : Number(tour.discount || 0);
  const discountPercentage = Math.min(Math.max(Number.isFinite(configuredDiscount) ? configuredDiscount : 0, 0), 100);
  const discountAmount = roundMoney(Math.min(subtotal, subtotal * (discountPercentage / 100)));
  const totalAmount = roundMoney(Math.max(subtotal - discountAmount, 0));

  const depositConfigured = Number(tour.depositRequired || 0);
  if (!Number.isFinite(depositConfigured) || depositConfigured < 0) throw new Error("Invalid deposit configuration.");
  const depositType = String(tour.depositType || "fixed").toLowerCase();
  if (!["fixed", "percentage"].includes(depositType)) throw new Error("Invalid deposit type.");
  const depositAmount = depositType === "percentage"
    ? roundMoney(Math.min(totalAmount, totalAmount * (depositConfigured / 100)))
    : roundMoney(Math.min(totalAmount, depositConfigured));

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
