/**
 * Purpose: operations Copilot Calculations.test automated test. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import test from "node:test";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load ../services/operationsCopilotCalculations.js so this module can use its exported dependencies.
import { buildTripOperations, buildPaymentFollowUp, buildAssetAlerts, buildQuoteDraft, toMoney } from "../services/operationsCopilotCalculations.js";

// Perform the side effect or state update expressed on the following line.
test("trip summary reports margins and assignment gaps from recorded data", () => {
  // Declare trip for use by the surrounding module or function.
  const trip = buildTripOperations(
    { _id: "tour-1", title: "Maasai Mara", assignedGuide: "guide-1", assignedDriver: null, assignedVehicle: "vehicle-1" },
    { bookings: 2, guests: 5, bookedValue: 125000, collectedValue: 100000 },
    { estimatedCost: 65000, actualCost: 60000, costItems: 3, actualCostItems: 2 },
  );
  // Perform the side effect or state update expressed on the following line.
  assert.equal(trip.bookedValue, 125000);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(trip.estimatedMargin, 60000);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(trip.actualMargin, 65000);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(trip.assignment.guideAssigned, true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(trip.assignment.driverAssigned, false);
  // Perform the side effect or state update expressed on the following line.
  assert.ok(trip.alerts.includes("Driver not assigned"));
  // Perform the side effect or state update expressed on the following line.
  assert.ok(trip.alerts.includes("Booking balances may remain outstanding"));
});

// Perform the side effect or state update expressed on the following line.
test("trip summary does not claim actual margin when actual costs are missing", () => {
  // Declare trip for use by the surrounding module or function.
  const trip = buildTripOperations({ _id: "tour-2", title: "Nairobi city tour" }, { bookedValue: 0 }, {});
  // Perform the side effect or state update expressed on the following line.
  assert.equal(trip.actualMargin, null);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(trip.estimatedMargin, 0);
  // Perform the side effect or state update expressed on the following line.
  assert.ok(trip.alerts.includes("Guide not assigned"));
  // Perform the side effect or state update expressed on the following line.
  assert.ok(trip.alerts.includes("Driver not assigned"));
  // Perform the side effect or state update expressed on the following line.
  assert.ok(trip.alerts.includes("Vehicle not assigned"));
  // Perform the side effect or state update expressed on the following line.
  assert.ok(!trip.alerts.includes("No tour costs entered; margin is incomplete"));
});

// Perform the side effect or state update expressed on the following line.
test("payment follow-up computes remaining balance and marks near travel dates urgent", () => {
  // Declare now for use by the surrounding module or function.
  const now = new Date("2026-10-12T10:00:00.000Z");
  // Declare item for use by the surrounding module or function.
  const item = buildPaymentFollowUp({
    _id: "booking-1",
    bookingNumber: "HM-1001",
    contact: { name: "Guest", email: "guest@example.com", phone: "+254700000000" },
    travelDate: "2026-10-14T10:00:00.000Z",
    totalAmount: 50000,
    amountPaid: 12500,
    status: "confirmed",
    paymentStatus: "partial",
  }, now);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(item.balance, 37500);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(item.priority, "urgent");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(item.daysUntilTravel, 2);
});

// Perform the side effect or state update expressed on the following line.
test("payment follow-up omits fully paid and cancelled bookings", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.equal(buildPaymentFollowUp({ _id: "paid", totalAmount: 100, amountPaid: 100, status: "confirmed" }), null);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(buildPaymentFollowUp({ _id: "cancelled", totalAmount: 100, amountPaid: 0, status: "cancelled" }), null);
});

// Perform the side effect or state update expressed on the following line.
test("money values are rounded to cents and malformed travel dates remain non-urgent", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.equal(toMoney(10.126), 10.13);
  // Declare item for use by the surrounding module or function.
  const item = buildPaymentFollowUp({ _id: "bad-date", totalAmount: 10, amountPaid: 2, travelDate: "not-a-date" }, new Date());
  // Perform the side effect or state update expressed on the following line.
  assert.equal(item.priority, "normal");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(item.daysUntilTravel, null);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(item.travelDate, null);
});

// Perform the side effect or state update expressed on the following line.
test("asset alerting identifies overdue and upcoming document and maintenance dates", () => {
  // Declare now for use by the surrounding module or function.
  const now = new Date("2026-10-12T00:00:00.000Z");
  // Declare result for use by the surrounding module or function.
  const result = buildAssetAlerts({
    _id: "asset-1",
    type: "vehicle",
    name: "Safari Land Cruiser",
    status: "active",
    metadata: {
      licenseExpiry: "2026-10-10T00:00:00.000Z",
      nextMaintenanceAt: "2026-10-20T00:00:00.000Z",
    },
  }, now);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(result.alerts.length, 2);
  // Perform the side effect or state update expressed on the following line.
  assert.ok(result.alerts.some((alert) => alert.severity === "urgent" && alert.kind === "document"));
  // Perform the side effect or state update expressed on the following line.
  assert.ok(result.alerts.some((alert) => alert.severity === "warning" && alert.kind === "maintenance"));
});

// Perform the side effect or state update expressed on the following line.
test("asset alerting ignores malformed or distant metadata dates", () => {
  // Declare result for use by the surrounding module or function.
  const result = buildAssetAlerts({
    _id: "asset-2",
    type: "guide",
    name: "Guide",
    status: "active",
    metadata: { expiryDate: "not-a-date", maintenanceDueAt: "2027-12-01T00:00:00.000Z" },
  }, new Date("2026-10-12T00:00:00.000Z"));
  // Perform the side effect or state update expressed on the following line.
  assert.equal(result, null);
});

// Perform the side effect or state update expressed on the following line.
test("quote draft uses catalogue price and computes discount and tax transparently", () => {
  // Declare quote for use by the surrounding module or function.
  const quote = buildQuoteDraft({
    _id: "tour-quote",
    title: "Amboseli Safari",
    price: 20000,
    discountPrice: null,
    destination: { name: "Amboseli" },
    inclusions: ["Park fees"],
    exclusions: ["Flights"],
    itinerary: [{ day: 1, title: "Game drive" }],
  }, 3, 10, 16);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(quote.subtotal, 60000);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(quote.discountAmount, 6000);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(quote.taxAmount, 8640);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(quote.total, 62640);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(quote.currency, "KES");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(quote.requiresReview, true);
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(quote.inclusions, ["Park fees"]);
});

// Perform the side effect or state update expressed on the following line.
test("quote draft rejects invalid guest counts, discount and tax rates", () => {
  // Declare tour for use by the surrounding module or function.
  const tour = { _id: "tour", title: "Safari", price: 1000 };
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => buildQuoteDraft(tour, 0), /Travellers must/);
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => buildQuoteDraft(tour, 101), /Travellers must/);
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => buildQuoteDraft(tour, 2, 101), /Discount must/);
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => buildQuoteDraft(tour, 2, 0, -1), /Tax rate must/);
});
