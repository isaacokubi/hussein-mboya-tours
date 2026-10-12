import test from "node:test";
import assert from "node:assert/strict";
import { buildTripOperations, buildPaymentFollowUp, buildAssetAlerts, buildQuoteDraft, toMoney } from "../services/operationsCopilotCalculations.js";

test("trip summary reports margins and assignment gaps from recorded data", () => {
  const trip = buildTripOperations(
    { _id: "tour-1", title: "Maasai Mara", assignedGuide: "guide-1", assignedDriver: null, assignedVehicle: "vehicle-1" },
    { bookings: 2, guests: 5, bookedValue: 125000, collectedValue: 100000 },
    { estimatedCost: 65000, actualCost: 60000, costItems: 3, actualCostItems: 2 },
  );
  assert.equal(trip.bookedValue, 125000);
  assert.equal(trip.estimatedMargin, 60000);
  assert.equal(trip.actualMargin, 65000);
  assert.equal(trip.assignment.guideAssigned, true);
  assert.equal(trip.assignment.driverAssigned, false);
  assert.ok(trip.alerts.includes("Driver not assigned"));
  assert.ok(trip.alerts.includes("Booking balances may remain outstanding"));
});

test("trip summary does not claim actual margin when actual costs are missing", () => {
  const trip = buildTripOperations({ _id: "tour-2", title: "Nairobi city tour" }, { bookedValue: 0 }, {});
  assert.equal(trip.actualMargin, null);
  assert.equal(trip.estimatedMargin, 0);
  assert.ok(trip.alerts.includes("Guide not assigned"));
  assert.ok(trip.alerts.includes("Driver not assigned"));
  assert.ok(trip.alerts.includes("Vehicle not assigned"));
  assert.ok(!trip.alerts.includes("No tour costs entered; margin is incomplete"));
});

test("payment follow-up computes remaining balance and marks near travel dates urgent", () => {
  const now = new Date("2026-10-12T10:00:00.000Z");
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
  assert.equal(item.balance, 37500);
  assert.equal(item.priority, "urgent");
  assert.equal(item.daysUntilTravel, 2);
});

test("payment follow-up omits fully paid and cancelled bookings", () => {
  assert.equal(buildPaymentFollowUp({ _id: "paid", totalAmount: 100, amountPaid: 100, status: "confirmed" }), null);
  assert.equal(buildPaymentFollowUp({ _id: "cancelled", totalAmount: 100, amountPaid: 0, status: "cancelled" }), null);
});

test("money values are rounded to cents and malformed travel dates remain non-urgent", () => {
  assert.equal(toMoney(10.126), 10.13);
  const item = buildPaymentFollowUp({ _id: "bad-date", totalAmount: 10, amountPaid: 2, travelDate: "not-a-date" }, new Date());
  assert.equal(item.priority, "normal");
  assert.equal(item.daysUntilTravel, null);
  assert.equal(item.travelDate, null);
});

test("asset alerting identifies overdue and upcoming document and maintenance dates", () => {
  const now = new Date("2026-10-12T00:00:00.000Z");
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
  assert.equal(result.alerts.length, 2);
  assert.ok(result.alerts.some((alert) => alert.severity === "urgent" && alert.kind === "document"));
  assert.ok(result.alerts.some((alert) => alert.severity === "warning" && alert.kind === "maintenance"));
});

test("asset alerting ignores malformed or distant metadata dates", () => {
  const result = buildAssetAlerts({
    _id: "asset-2",
    type: "guide",
    name: "Guide",
    status: "active",
    metadata: { expiryDate: "not-a-date", maintenanceDueAt: "2027-12-01T00:00:00.000Z" },
  }, new Date("2026-10-12T00:00:00.000Z"));
  assert.equal(result, null);
});

test("quote draft uses catalogue price and computes discount and tax transparently", () => {
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
  assert.equal(quote.subtotal, 60000);
  assert.equal(quote.discountAmount, 6000);
  assert.equal(quote.taxAmount, 8640);
  assert.equal(quote.total, 62640);
  assert.equal(quote.currency, "KES");
  assert.equal(quote.requiresReview, true);
  assert.deepEqual(quote.inclusions, ["Park fees"]);
});

test("quote draft rejects invalid guest counts, discount and tax rates", () => {
  const tour = { _id: "tour", title: "Safari", price: 1000 };
  assert.throws(() => buildQuoteDraft(tour, 0), /Travellers must/);
  assert.throws(() => buildQuoteDraft(tour, 101), /Travellers must/);
  assert.throws(() => buildQuoteDraft(tour, 2, 101), /Discount must/);
  assert.throws(() => buildQuoteDraft(tour, 2, 0, -1), /Tax rate must/);
});
