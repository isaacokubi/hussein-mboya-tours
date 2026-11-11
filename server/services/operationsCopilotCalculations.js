/**
 * Purpose: operations Copilot Calculations business-logic service. Main declarations: toMoney, buildTripOperations, buildPaymentFollowUp, buildAssetAlerts, buildQuoteDraft.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
/**
 * Pure calculations for the Tour Manager operations copilot.
 * Keeping these functions independent of MongoDB makes the business rules
 * easy to test without touching production data or requiring credentials.
 */
// Declare toMoney for use by the surrounding module or function.
export const toMoney = (value) => Math.round(Number(value || 0) * 100) / 100;

// Define buildTripOperations; its parameters and body implement this operation.
export function buildTripOperations(tour, booking = {}, costs = {}) {
  // Declare bookedValue for use by the surrounding module or function.
  const bookedValue = toMoney(booking.bookedValue);
  // Declare collectedValue for use by the surrounding module or function.
  const collectedValue = toMoney(booking.collectedValue);
  // Declare estimatedCost for use by the surrounding module or function.
  const estimatedCost = toMoney(costs.estimatedCost);
  // Declare actualCost for use by the surrounding module or function.
  const actualCost = toMoney(costs.actualCost);
  // Declare hasActualCosts for use by the surrounding module or function.
  const hasActualCosts = toMoney(costs.actualCostItems) > 0;
  // Declare alerts for use by the surrounding module or function.
  const alerts = [];

  // Check the condition (!tour.assignedGuide) and run the matching branch.
  if (!tour.assignedGuide) alerts.push("Guide not assigned");
  // Check the condition (!tour.assignedDriver) and run the matching branch.
  if (!tour.assignedDriver) alerts.push("Driver not assigned");
  // Check the condition (!tour.assignedVehicle) and run the matching branch.
  if (!tour.assignedVehicle) alerts.push("Vehicle not assigned");
  // Check the condition (bookedValue > 0 && estimatedCost === 0) and run the matching branch.
  if (bookedValue > 0 && estimatedCost === 0) alerts.push("No tour costs entered; margin is incomplete");
  // Check the condition (collectedValue < bookedValue) and run the matching branch.
  if (collectedValue < bookedValue) alerts.push("Booking balances may remain outstanding");

  // Return the object assembled below to the caller.
  return {
    id: String(tour._id),
    title: tour.title || "Untitled tour",
    startDate: tour.startDate || tour.date || null,
    status: tour.status || "draft",
    bookings: Number(booking.bookings || 0),
    guests: Number(booking.guests || 0),
    bookedValue,
    collectedValue,
    estimatedCost,
    actualCost,
    estimatedMargin: toMoney(bookedValue - estimatedCost),
    actualMargin: hasActualCosts ? toMoney(bookedValue - actualCost) : null,
    costItems: Number(costs.costItems || 0),
    assignment: {
      guideAssigned: Boolean(tour.assignedGuide),
      driverAssigned: Boolean(tour.assignedDriver),
      vehicleAssigned: Boolean(tour.assignedVehicle),
    },
    alerts,
  };
}

// Define buildPaymentFollowUp; its parameters and body implement this operation.
export function buildPaymentFollowUp(booking, now = new Date()) {
  // Declare total for use by the surrounding module or function.
  const total = toMoney(booking.totalAmount);
  // Declare paid for use by the surrounding module or function.
  const paid = toMoney(booking.amountPaid);
  // Declare balance for use by the surrounding module or function.
  const balance = toMoney(Math.max(0, total - paid));
  // Check the condition (balance <= 0 || ["cancelled", "refunded"].includes(booking.status)) and run the matching branch.
  if (balance <= 0 || ["cancelled", "refunded"].includes(booking.status)) return null;

  // Declare travelDate for use by the surrounding module or function.
  const travelDate = booking.travelDate ? new Date(booking.travelDate) : null;
  // Declare daysUntilTravel for use by the surrounding module or function.
  const daysUntilTravel = travelDate && Number.isFinite(travelDate.getTime())
    ? Math.ceil((travelDate.getTime() - now.getTime()) / 86400000)
    : null;

  // Return the object assembled below to the caller.
  return {
    bookingId: String(booking._id),
    bookingNumber: booking.bookingNumber || "",
    customerName: booking.contact?.name || booking.customerSnapshot?.name || "",
    customerEmail: booking.contact?.email || booking.customerSnapshot?.email || "",
    customerPhone: booking.contact?.phone || booking.customerSnapshot?.phone || "",
    travelDate: travelDate && Number.isFinite(travelDate.getTime()) ? travelDate.toISOString() : null,
    totalAmount: total,
    amountPaid: paid,
    balance,
    paymentStatus: booking.paymentStatus || "pending",
    priority: daysUntilTravel !== null && daysUntilTravel <= 3 ? "urgent" : "normal",
    daysUntilTravel,
  };
}

/**
 * Convert optional dates on flexible operational-asset metadata into alerts.
 * Supported keys are deliberately explicit so the copilot never guesses at
 * undocumented metadata fields.
 */
// Define buildAssetAlerts; its parameters and body implement this operation.
export function buildAssetAlerts(asset, now = new Date(), horizonDays = 30) {
  // Declare metadata for use by the surrounding module or function.
  const metadata = asset.metadata && typeof asset.metadata === "object" ? asset.metadata : {};
  // Declare alerts for use by the surrounding module or function.
  const alerts = [];
  // Check the condition (asset.status === "expired") and run the matching branch.
  if (asset.status === "expired") {
    // Perform the side effect or state update expressed on the following line.
    alerts.push({ kind: "status", severity: "urgent", message: "Asset is marked expired", dueAt: null });
  }
  // Declare dateFields for use by the surrounding module or function.
  const dateFields = [
    ["expiryDate", "Expiry", "document"],
    ["documentExpiry", "Document expiry", "document"],
    ["licenseExpiry", "Licence expiry", "document"],
    ["maintenanceDueAt", "Maintenance", "maintenance"],
    ["nextMaintenanceAt", "Maintenance", "maintenance"],
  ];
  // Declare horizon for use by the surrounding module or function.
  const horizon = new Date(now.getTime() + horizonDays * 86400000);
  // Repeat the enclosed work for each required iteration.
  for (const [key, label, kind] of dateFields) {
    // Check the condition (!metadata[key]) and run the matching branch.
    if (!metadata[key]) continue;
    // Declare dueAt for use by the surrounding module or function.
    const dueAt = new Date(metadata[key]);
    // Check the condition (!Number.isFinite(dueAt.getTime())) and run the matching branch.
    if (!Number.isFinite(dueAt.getTime())) continue;
    // Check the condition (dueAt <= horizon) and run the matching branch.
    if (dueAt <= horizon) {
      // Perform the side effect or state update expressed on the following line.
      alerts.push({
        kind,
        severity: dueAt < now ? "urgent" : "warning",
        message: dueAt < now ? `${label} is overdue` : `${label} due within ${horizonDays} days`,
        dueAt: dueAt.toISOString(),
      });
    }
  }
  // Check the condition (!alerts.length) and run the matching branch.
  if (!alerts.length) return null;
  // Return the object assembled below to the caller.
  return {
    id: String(asset._id),
    type: asset.type,
    name: asset.name || "Unnamed operational asset",
    status: asset.status || "unknown",
    tourId: asset.tourId ? String(asset.tourId) : null,
    bookingId: asset.bookingId ? String(asset.bookingId) : null,
    alerts,
  };
}

/**
 * Build a transparent, non-persisted quotation estimate from tenant tour data.
 * The client may not supply or override the authoritative tour price.
 */
// Define buildQuoteDraft; its parameters and body implement this operation.
export function buildQuoteDraft(tour, travelerCount, discountPercent = 0, taxPercent = 0) {
  // Declare guests for use by the surrounding module or function.
  const guests = Number(travelerCount);
  // Declare discountRate for use by the surrounding module or function.
  const discountRate = Number(discountPercent);
  // Declare taxRate for use by the surrounding module or function.
  const taxRate = Number(taxPercent);
  // Check the condition (!Number.isInteger(guests) || guests < 1 || guests > 100) and run the matching branch.
  if (!Number.isInteger(guests) || guests < 1 || guests > 100) throw new Error("Travellers must be a whole number between 1 and 100.");
  // Check the condition (!Number.isFinite(discountRate) || discountRate < 0 || discountRate > 1) and run the matching branch.
  if (!Number.isFinite(discountRate) || discountRate < 0 || discountRate > 100) throw new Error("Discount must be between 0 and 100 percent.");
  // Check the condition (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) and run the matching branch.
  if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) throw new Error("Tax rate must be between 0 and 100 percent.");
  // Declare listedPrice for use by the surrounding module or function.
  const listedPrice = Number(tour.discountPrice ?? tour.price);
  // Check the condition (!Number.isFinite(listedPrice) || listedPrice < 0) and run the matching branch.
  if (!Number.isFinite(listedPrice) || listedPrice < 0) throw new Error("Tour has no valid price configured.");
  // Declare subtotal for use by the surrounding module or function.
  const subtotal = toMoney(listedPrice * guests);
  // Declare discountAmount for use by the surrounding module or function.
  const discountAmount = toMoney(subtotal * discountRate / 100);
  // Declare taxableAmount for use by the surrounding module or function.
  const taxableAmount = toMoney(Math.max(0, subtotal - discountAmount));
  // Declare taxAmount for use by the surrounding module or function.
  const taxAmount = toMoney(taxableAmount * taxRate / 100);
  // Return the object assembled below to the caller.
  return {
    tourId: String(tour._id),
    tourTitle: tour.title,
    destination: typeof tour.destination === "object" ? (tour.destination?.name || tour.destination?.title || "") : String(tour.destination || ""),
    travelerCount: guests,
    unitPrice: toMoney(listedPrice),
    currency: "KES",
    subtotal,
    discountPercent: discountRate,
    discountAmount,
    taxPercent: taxRate,
    taxAmount,
    total: toMoney(taxableAmount + taxAmount),
    inclusions: Array.isArray(tour.inclusions) ? tour.inclusions : [],
    exclusions: Array.isArray(tour.exclusions) ? tour.exclusions : [],
    itinerary: Array.isArray(tour.itinerary) ? tour.itinerary : [],
    cancellationPolicy: tour.cancellationPolicy || "",
    requiresReview: true,
    note: "Draft estimate based on the current tour catalogue price. Confirm dates, availability, taxes and any custom supplier costs before sending to the customer.",
  };
}
