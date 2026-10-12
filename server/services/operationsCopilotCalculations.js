/**
 * Pure calculations for the Tour Manager operations copilot.
 * Keeping these functions independent of MongoDB makes the business rules
 * easy to test without touching production data or requiring credentials.
 */
export const toMoney = (value) => Math.round(Number(value || 0) * 100) / 100;

export function buildTripOperations(tour, booking = {}, costs = {}) {
  const bookedValue = toMoney(booking.bookedValue);
  const collectedValue = toMoney(booking.collectedValue);
  const estimatedCost = toMoney(costs.estimatedCost);
  const actualCost = toMoney(costs.actualCost);
  const hasActualCosts = toMoney(costs.actualCostItems) > 0;
  const alerts = [];

  if (!tour.assignedGuide) alerts.push("Guide not assigned");
  if (!tour.assignedDriver) alerts.push("Driver not assigned");
  if (!tour.assignedVehicle) alerts.push("Vehicle not assigned");
  if (bookedValue > 0 && estimatedCost === 0) alerts.push("No tour costs entered; margin is incomplete");
  if (collectedValue < bookedValue) alerts.push("Booking balances may remain outstanding");

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

export function buildPaymentFollowUp(booking, now = new Date()) {
  const total = toMoney(booking.totalAmount);
  const paid = toMoney(booking.amountPaid);
  const balance = toMoney(Math.max(0, total - paid));
  if (balance <= 0 || ["cancelled", "refunded"].includes(booking.status)) return null;

  const travelDate = booking.travelDate ? new Date(booking.travelDate) : null;
  const daysUntilTravel = travelDate && Number.isFinite(travelDate.getTime())
    ? Math.ceil((travelDate.getTime() - now.getTime()) / 86400000)
    : null;

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
export function buildAssetAlerts(asset, now = new Date(), horizonDays = 30) {
  const metadata = asset.metadata && typeof asset.metadata === "object" ? asset.metadata : {};
  const alerts = [];
  if (asset.status === "expired") {
    alerts.push({ kind: "status", severity: "urgent", message: "Asset is marked expired", dueAt: null });
  }
  const dateFields = [
    ["expiryDate", "Expiry", "document"],
    ["documentExpiry", "Document expiry", "document"],
    ["licenseExpiry", "Licence expiry", "document"],
    ["maintenanceDueAt", "Maintenance", "maintenance"],
    ["nextMaintenanceAt", "Maintenance", "maintenance"],
  ];
  const horizon = new Date(now.getTime() + horizonDays * 86400000);
  for (const [key, label, kind] of dateFields) {
    if (!metadata[key]) continue;
    const dueAt = new Date(metadata[key]);
    if (!Number.isFinite(dueAt.getTime())) continue;
    if (dueAt <= horizon) {
      alerts.push({
        kind,
        severity: dueAt < now ? "urgent" : "warning",
        message: dueAt < now ? `${label} is overdue` : `${label} due within ${horizonDays} days`,
        dueAt: dueAt.toISOString(),
      });
    }
  }
  if (!alerts.length) return null;
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
export function buildQuoteDraft(tour, travelerCount, discountPercent = 0, taxPercent = 0) {
  const guests = Number(travelerCount);
  const discountRate = Number(discountPercent);
  const taxRate = Number(taxPercent);
  if (!Number.isInteger(guests) || guests < 1 || guests > 100) throw new Error("Travellers must be a whole number between 1 and 100.");
  if (!Number.isFinite(discountRate) || discountRate < 0 || discountRate > 100) throw new Error("Discount must be between 0 and 100 percent.");
  if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) throw new Error("Tax rate must be between 0 and 100 percent.");
  const listedPrice = Number(tour.discountPrice ?? tour.price);
  if (!Number.isFinite(listedPrice) || listedPrice < 0) throw new Error("Tour has no valid price configured.");
  const subtotal = toMoney(listedPrice * guests);
  const discountAmount = toMoney(subtotal * discountRate / 100);
  const taxableAmount = toMoney(Math.max(0, subtotal - discountAmount));
  const taxAmount = toMoney(taxableAmount * taxRate / 100);
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
