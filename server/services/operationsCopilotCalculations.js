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
