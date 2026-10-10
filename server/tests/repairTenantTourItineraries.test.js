import test from "node:test";
import assert from "node:assert/strict";
import { assertItineraryRepairTarget, buildCorrectedItinerary, EXPECTED_TENANTS, getEffectiveTourDuration, TOUR_DURATION_OVERRIDES } from "../scripts/repairTenantTourItineraries.js";

const approvedUri = "mongodb+srv://repair-user:unused-password@cluster0.cdtxzts.mongodb.net/husseindb?retryWrites=true&w=majority";
const confirm = { CONFIRM_TENANT_ITINERARY_REPAIR: "YES", NODE_ENV: "maintenance" };

test("only explicitly confirmed husseindb Atlas target is accepted", () => {
  assert.deepEqual(assertItineraryRepairTarget(approvedUri, confirm), { host: "cluster0.cdtxzts.mongodb.net", database: "husseindb" });
  assert.throws(() => assertItineraryRepairTarget(approvedUri, {}), /CONFIRM_TENANT_ITINERARY_REPAIR/);
  assert.throws(() => assertItineraryRepairTarget(approvedUri.replace("/husseindb?", "/global_tours_test?"), confirm), /Refusing to write outside husseindb/);
  assert.throws(() => assertItineraryRepairTarget(approvedUri.replace("cluster0.cdtxzts.mongodb.net", "other.mongodb.net"), confirm), /Refusing to write outside husseindb/);
});

test("corrected itinerary follows the tour duration and has ordered complete days", () => {
  const tour = { _id: "tour-1", title: "Mara Big Five Expedition", durationDays: 3, highlights: ["Game drives", "Big-five viewing"] };
  const destination = { name: "Maasai Mara Conservancy", description: "Open savannah and seasonal migration.", activities: ["Guided game drives", "Wildlife photography"] };
  const itinerary = buildCorrectedItinerary(tour, destination, "tenant-1");
  assert.equal(itinerary.length, 3);
  assert.deepEqual(itinerary.map((day) => day.day), [1, 2, 3]);
  assert.ok(itinerary.every((day) => day.tenantId === "tenant-1" && day.title && day.description && day.activities.length));
  assert.match(itinerary[0].title, /Arrival/);
  assert.match(itinerary[2].title, /departure/i);
});

test("explicit Thomson Falls day-trip override changes only that tour", () => {
  const destination = { name: "Thomson Falls Highlands", description: "Waterfall and highland viewpoints.", activities: ["Waterfall visit", "Highland walks", "Photography"] };
  const dayTrip = { title: "Thomson Falls Highland Day Trip", durationDays: 3, durationDetails: { days: 3, nights: 2 }, duration: "3" };
  assert.equal(getEffectiveTourDuration(dayTrip), 1);
  assert.deepEqual(TOUR_DURATION_OVERRIDES.get(dayTrip.title), { days: 1 });
  const itinerary = buildCorrectedItinerary(dayTrip, destination, "demo-tenant");
  assert.equal(itinerary.length, 1);
  assert.equal(itinerary[0].day, 1);
  assert.match(itinerary[0].title, /Day Trip/);
  assert.match(itinerary[0].description, /returning the same day/i);
  assert.deepEqual(itinerary[0].activities, destination.activities);
  assert.equal(getEffectiveTourDuration({ title: "Mara Big Five Expedition", durationDays: 3 }), 3);
});

test("one-day tours stay one day and invalid durations fail closed", () => {
  const destination = { name: "Diani Coral Shores", description: "Beach escape", activities: ["Beach activities"] };
  assert.equal(buildCorrectedItinerary({ title: "Diani escape", durationDays: 1 }, destination, "tenant-2").length, 1);
  assert.throws(() => buildCorrectedItinerary({ title: "Bad tour", durationDays: 0 }, destination, "tenant-2"), /Invalid duration/);
  assert.equal(EXPECTED_TENANTS.length, 3);
});
