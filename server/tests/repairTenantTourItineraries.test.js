/**
 * Purpose: repair Tenant Tour Itineraries.test automated test. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import test from "node:test";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load ../scripts/repairTenantTourItineraries.js so this module can use its exported dependencies.
import { assertItineraryRepairTarget, buildCorrectedItinerary, EXPECTED_TENANTS, getEffectiveTourDuration, getTourDurationOverride } from "../scripts/repairTenantTourItineraries.js";

// Declare approvedUri for use by the surrounding module or function.
const approvedUri = "mongodb+srv://repair-user:unused-password@cluster0.cdtxzts.mongodb.net/husseindb?retryWrites=true&w=majority";
// Declare confirm for use by the surrounding module or function.
const confirm = { CONFIRM_TENANT_ITINERARY_REPAIR: "YES", NODE_ENV: "maintenance" };

// Perform the side effect or state update expressed on the following line.
test("only explicitly confirmed husseindb Atlas target is accepted", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(assertItineraryRepairTarget(approvedUri, confirm), { host: "cluster0.cdtxzts.mongodb.net", database: "husseindb" });
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => assertItineraryRepairTarget(approvedUri, {}), /CONFIRM_TENANT_ITINERARY_REPAIR/);
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => assertItineraryRepairTarget(approvedUri.replace("/husseindb?", "/global_tours_test?"), confirm), /Refusing to write outside husseindb/);
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => assertItineraryRepairTarget(approvedUri.replace("cluster0.cdtxzts.mongodb.net", "other.mongodb.net"), confirm), /Refusing to write outside husseindb/);
});

// Perform the side effect or state update expressed on the following line.
test("corrected itinerary follows the tour duration and has ordered complete days", () => {
  // Declare tour for use by the surrounding module or function.
  const tour = { _id: "tour-1", title: "Mara Big Five Expedition", durationDays: 3, highlights: ["Game drives", "Big-five viewing"] };
  // Declare destination for use by the surrounding module or function.
  const destination = { name: "Maasai Mara Conservancy", description: "Open savannah and seasonal migration.", activities: ["Guided game drives", "Wildlife photography"] };
  // Declare itinerary for use by the surrounding module or function.
  const itinerary = buildCorrectedItinerary(tour, destination, "tenant-1");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(itinerary.length, 3);
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(itinerary.map((day) => day.day), [1, 2, 3]);
  // Perform the side effect or state update expressed on the following line.
  assert.ok(itinerary.every((day) => day.tenantId === "tenant-1" && day.title && day.description && day.activities.length));
  // Perform the side effect or state update expressed on the following line.
  assert.match(itinerary[0].title, /Arrival/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(itinerary[2].title, /departure/i);
});

// Perform the side effect or state update expressed on the following line.
test("explicit Thomson Falls day-trip override changes only that tour", () => {
  // Declare destination for use by the surrounding module or function.
  const destination = { name: "Thomson Falls Highlands", description: "Waterfall and highland viewpoints.", activities: ["Waterfall visit", "Highland walks", "Photography"] };
  // Declare dayTrip for use by the surrounding module or function.
  const dayTrip = { title: "Thomson Falls Highland Day Trip", durationDays: 3, durationDetails: { days: 3, nights: 2 }, duration: "3" };
  // Perform the side effect or state update expressed on the following line.
  assert.equal(getEffectiveTourDuration(dayTrip, "demo-safari"), 1);
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(getTourDurationOverride(dayTrip, "demo-safari"), { days: 1 });
  // Perform the side effect or state update expressed on the following line.
  assert.equal(getTourDurationOverride(dayTrip, "hussein-mboya"), undefined);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(getEffectiveTourDuration(dayTrip, "hussein-mboya"), 3);
  // Declare itinerary for use by the surrounding module or function.
  const itinerary = buildCorrectedItinerary(dayTrip, destination, "demo-tenant", "demo-safari");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(itinerary.length, 1);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(itinerary[0].day, 1);
  // Perform the side effect or state update expressed on the following line.
  assert.match(itinerary[0].title, /Day Trip/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(itinerary[0].description, /returning the same day/i);
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(itinerary[0].activities, destination.activities);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(getEffectiveTourDuration({ title: "Mara Big Five Expedition", durationDays: 3 }), 3);
});

// Perform the side effect or state update expressed on the following line.
test("one-day tours stay one day and invalid durations fail closed", () => {
  // Declare destination for use by the surrounding module or function.
  const destination = { name: "Diani Coral Shores", description: "Beach escape", activities: ["Beach activities"] };
  // Perform the side effect or state update expressed on the following line.
  assert.equal(buildCorrectedItinerary({ title: "Diani escape", durationDays: 1 }, destination, "tenant-2").length, 1);
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => buildCorrectedItinerary({ title: "Bad tour", durationDays: 0 }, destination, "tenant-2"), /Invalid duration/);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(EXPECTED_TENANTS.length, 3);
});
