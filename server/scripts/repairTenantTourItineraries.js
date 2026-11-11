/**
 * Purpose: repair Tenant Tour Itineraries operational script. Main declarations: getTourDurationOverride, getEffectiveTourDuration, assertItineraryRepairTarget, cleanList, buildCorrectedItinerary.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import "dotenv/config";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load node:url so this module can use its exported dependencies.
import { pathToFileURL } from "node:url";

// Declare EXPECTED_HOST for use by the surrounding module or function.
export const EXPECTED_HOST = "cluster0.cdtxzts.mongodb.net";
// Declare EXPECTED_DATABASE for use by the surrounding module or function.
export const EXPECTED_DATABASE = "husseindb";
// Declare EXPECTED_TENANTS for use by the surrounding module or function.
export const EXPECTED_TENANTS = ["hussein-mboya", "amani-trails", "demo-safari"];

// Explicit, reviewed exception to the current three-day tenant catalogue.
// Declare TOUR_DURATION_OVERRIDES for use by the surrounding module or function.
export const TOUR_DURATION_OVERRIDES = new Map([
  ["demo-safari:Thomson Falls Highland Day Trip", { days: 1 }]
]);

// Define getTourDurationOverride; its parameters and body implement this operation.
export function getTourDurationOverride(tour, tenantSlug) {
  // Return the result of TOUR_DURATION_OVERRIDES.get() to the caller.
  return TOUR_DURATION_OVERRIDES.get(`${tenantSlug}:${String(tour.title || "").trim()}`);
}

// Define getEffectiveTourDuration; its parameters and body implement this operation.
export function getEffectiveTourDuration(tour, tenantSlug) {
  // Declare override for use by the surrounding module or function.
  const override = getTourDurationOverride(tour, tenantSlug);
  // Check the condition (override) and run the matching branch.
  if (override) return override.days;
  // Declare parsed for use by the surrounding module or function.
  const parsed = Number.parseInt(String(tour.duration || "").match(/\d+/)?.[0], 10);
  // Declare days for use by the surrounding module or function.
  const days = Number(tour.durationDays ?? tour.durationDetails?.days ?? parsed ?? 1);
  // Check the condition (!Number.isInteger(days) || days < 1 || days > 365) and run the matching branch.
  if (!Number.isInteger(days) || days < 1 || days > 365) throw new Error(`Invalid duration for tour ${tour.title || tour._id}: ${days}`);
  // Return the value of days to the caller.
  return days;
}

// Define assertItineraryRepairTarget; its parameters and body implement this operation.
export function assertItineraryRepairTarget(rawUri, env = process.env) {
  // Check the condition (env.CONFIRM_TENANT_ITINERARY_REPAIR !== "YES") and run the matching branch.
  if (env.CONFIRM_TENANT_ITINERARY_REPAIR !== "YES") {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Set CONFIRM_TENANT_ITINERARY_REPAIR=YES to confirm the targeted itinerary repair.");
  }
  // Check the condition (!rawUri) and run the matching branch.
  if (!rawUri) throw new Error("MONGODB_URI is required.");
  // Declare target for use by the surrounding module or function.
  const target = new URL(rawUri);
  // Declare database for use by the surrounding module or function.
  const database = decodeURIComponent(target.pathname.replace(/^\//, "").split("/")[0] || "");
  // Check the condition (target.hostname.toLowerCase() !== EXPECTED_HOST || database !== EXPECT) and run the matching branch.
  if (target.hostname.toLowerCase() !== EXPECTED_HOST || database !== EXPECTED_DATABASE) {
    // Stop the current operation by raising a new Error instance.
    throw new Error(`Refusing to write outside ${EXPECTED_DATABASE} on the approved Atlas cluster.`);
  }
  // Check the condition (String(env.NODE_ENV || "").toLowerCase() === "production") and run the matching branch.
  if (String(env.NODE_ENV || "").toLowerCase() === "production") {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Run the repair in an explicitly controlled maintenance session, not with NODE_ENV=production.");
  }
  // Return the object assembled below to the caller.
  return { host: target.hostname.toLowerCase(), database };
}

// Declare cleanList for use by the surrounding module or function.
const cleanList = (values) => (Array.isArray(values) ? values : []).map((value) => String(value || "").trim()).filter(Boolean);

// Define buildCorrectedItinerary; its parameters and body implement this operation.
export function buildCorrectedItinerary(tour, destination, tenantId, tenantSlug) {
  // Declare days for use by the surrounding module or function.
  const days = getEffectiveTourDuration(tour, tenantSlug);
  // Declare destinationName for use by the surrounding module or function.
  const destinationName = String(destination.name || tour.location || "the destination").trim();
  // Declare destinationDescription for use by the surrounding module or function.
  const destinationDescription = String(destination.description || tour.description || "").trim();
  // Declare activities for use by the surrounding module or function.
  const activities = cleanList(destination.activities);
  // Declare highlights for use by the surrounding module or function.
  const highlights = cleanList(tour.highlights);
  // Declare baseActivities for use by the surrounding module or function.
  const baseActivities = [...new Set([...highlights, ...activities])];
  // Declare safeActivities for use by the surrounding module or function.
  const safeActivities = baseActivities.length ? baseActivities : [`Guided experience in ${destinationName}`];
  // Return the result of Array.from() to the caller.
  return Array.from({ length: days }, (_, index) => {
    // Declare day for use by the surrounding module or function.
    const day = index + 1;
    // Declare isArrival for use by the surrounding module or function.
    const isArrival = day === 1;
    // Declare isDeparture for use by the surrounding module or function.
    const isDeparture = day === days;
    // Declare title for use by the surrounding module or function.
    const title = days === 1
      ? `Explore ${destinationName} — Day Trip`
      : isArrival
        ? `Arrival and introduction to ${destinationName}`
        : isDeparture
          ? `Final experiences and departure from ${destinationName}`
          : `Discover ${destinationName} — Day ${day}`;
    // Declare dayActivities for use by the surrounding module or function.
    const dayActivities = days === 1
      ? safeActivities.slice(0, 3)
      : isArrival
        ? [`Arrival briefing in ${destinationName}`, safeActivities[0]]
        : isDeparture
          ? [safeActivities[(day - 1) % safeActivities.length], "Return transfer and departure"]
          : [safeActivities[(day - 2) % safeActivities.length], safeActivities[(day - 1) % safeActivities.length]];
    // Declare description for use by the surrounding module or function.
    const description = days === 1
      ? `Enjoy a guided day trip to ${destinationName}, including ${dayActivities.join(" and ").toLowerCase()}, before returning the same day. ${destinationDescription}`.trim()
      : isArrival
        ? `Meet your guide, review the travel plan and begin your visit to ${destinationName}. ${destinationDescription}`.trim()
      : isDeparture
        ? `Enjoy a final planned activity in ${destinationName}, then begin the return transfer.`
        : `Spend day ${day} exploring ${destinationName} with a guided programme focused on ${dayActivities.join(" and ").toLowerCase()}.`;
    // Return the object assembled below to the caller.
    return {
      tenantId,
      day,
      title,
      description,
      activities: [...new Set(dayActivities)],
      meals: isArrival ? ["Breakfast"] : isDeparture ? ["Breakfast"] : ["Breakfast", "Lunch"],
      accommodation: isDeparture ? "" : (String(tour.accommodation || "").trim() || `Overnight stay arranged for the ${destinationName} itinerary`)
    };
  });
}

// Define main; its parameters and body implement this operation.
async function main() {
  // Perform the side effect or state update expressed on the following line.
  assertItineraryRepairTarget(process.env.MONGODB_URI);
  // Perform the side effect or state update expressed on the following line.
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000, appName: "tenant-tour-itinerary-repair" });
  // Declare db for use by the surrounding module or function.
  const db = mongoose.connection.db;
  // Declare tenants for use by the surrounding module or function.
  const tenants = await db.collection("organizations").find(
    { slug: { $in: EXPECTED_TENANTS } },
    { projection: { _id: 1, slug: 1, name: 1 } }
  ).toArray();
  // Check the condition (tenants.length !== EXPECTED_TENANTS.length) and run the matching branch.
  if (tenants.length !== EXPECTED_TENANTS.length) throw new Error("Expected all three known tenants. No records were changed.");

  // Declare plans for use by the surrounding module or function.
  const plans = [];
  // Repeat the enclosed work for each required iteration.
  for (const tenant of tenants) {
    // Declare [tours, destinations] for use by the surrounding module or function.
    const [tours, destinations] = await Promise.all([
      db.collection("tours").find({ tenantId: tenant._id, isDeleted: { $ne: true } }).toArray(),
      db.collection("destinations").find({ tenantId: tenant._id, isDeleted: { $ne: true } }).toArray()
    ]);
    // Check the condition (!tours.length || !destinations.length) and run the matching branch.
    if (!tours.length || !destinations.length) throw new Error(`Missing tours or destinations for ${tenant.slug}. No records were changed.`);
    // Declare destinationById for use by the surrounding module or function.
    const destinationById = new Map(destinations.map((item) => [String(item._id), item]));
    // Declare entries for use by the surrounding module or function.
    const entries = tours.map((tour) => {
      // Declare destination for use by the surrounding module or function.
      const destination = destinationById.get(String(tour.destination));
      // Check the condition (!destination) and run the matching branch.
      if (!destination) throw new Error(`Tour ${tour.title || tour._id} in ${tenant.slug} references a missing or cross-tenant destination. No records were changed.`);
      // Return the object assembled below to the caller.
      return { tour, destination, itinerary: buildCorrectedItinerary(tour, destination, tenant._id, tenant.slug) };
    });
    // Perform the side effect or state update expressed on the following line.
    plans.push({ tenant, tours: entries });
  }

  // Declare summary for use by the surrounding module or function.
  const summary = plans.map(({ tenant, tours }) => ({
    tenant: tenant.slug,
    tours: tours.length,
    toursToUpdate: tours.filter(({ tour, itinerary }) => JSON.stringify(tour.itinerary || []) !== JSON.stringify(itinerary) || getEffectiveTourDuration(tour, tenant.slug) !== Number(tour.durationDays ?? tour.durationDetails?.days ?? 1)).length,
    itineraryDayCounts: tours.map(({ tour, itinerary }) => ({ title: tour.title, currentDurationDays: Number(tour.durationDays ?? tour.durationDetails?.days ?? 1), plannedDurationDays: getEffectiveTourDuration(tour, tenant.slug), currentItineraryDays: Array.isArray(tour.itinerary) ? tour.itinerary.length : 0, plannedItineraryDays: itinerary.length }))
  }));
  // Perform the side effect or state update expressed on the following line.
  console.log(JSON.stringify({ mode: process.env.APPLY_TENANT_ITINERARY_REPAIR === "YES" ? "APPLY" : "DRY_RUN", database: EXPECTED_DATABASE, summary }, null, 2));
  // Check the condition (process.env.APPLY_TENANT_ITINERARY_REPAIR !== "YES") and run the matching branch.
  if (process.env.APPLY_TENANT_ITINERARY_REPAIR !== "YES") {
    // Perform the side effect or state update expressed on the following line.
    console.log("Dry run only: no database records were modified. Set APPLY_TENANT_ITINERARY_REPAIR=YES after reviewing the plan.");
    // Return the result to the caller.
    return;
  }

  // Declare updated for use by the surrounding module or function.
  let updated = 0;
  // Repeat the enclosed work for each required iteration.
  for (const { tenant, tours } of plans) {
    // Repeat the enclosed work for each required iteration.
    for (const { tour, itinerary } of tours) {
      // Declare durationOverride for use by the surrounding module or function.
      const durationOverride = getTourDurationOverride(tour, tenant.slug);
      // Declare set for use by the surrounding module or function.
      const set = { itinerary };
      // Check the condition (durationOverride) and run the matching branch.
      if (durationOverride) {
        // Perform the side effect or state update expressed on the following line.
        set.duration = String(durationOverride.days);
        // Perform the side effect or state update expressed on the following line.
        set.durationDays = durationOverride.days;
        // Perform the side effect or state update expressed on the following line.
        set.durationDetails = { days: durationOverride.days, nights: Math.max(0, durationOverride.days - 1) };
        // Declare start for use by the surrounding module or function.
        const start = tour.startDate || tour.date;
        // Check the condition (start && !Number.isNaN(new Date(start).getTime())) and run the matching branch.
        if (start && !Number.isNaN(new Date(start).getTime())) {
          // Declare endDate for use by the surrounding module or function.
          const endDate = new Date(start);
          // Perform the side effect or state update expressed on the following line.
          endDate.setDate(endDate.getDate() + durationOverride.days - 1);
          // Perform the side effect or state update expressed on the following line.
          set.endDate = endDate;
        }
      }
      // Declare result for use by the surrounding module or function.
      const result = await db.collection("tours").updateOne(
        { _id: tour._id, tenantId: tenant._id, destination: tour.destination, isDeleted: { $ne: true } },
        { $set: set }
      );
      // Perform the side effect or state update expressed on the following line.
      updated += result.modifiedCount;
    }
  }

  // Declare verification for use by the surrounding module or function.
  const verification = [];
  // Repeat the enclosed work for each required iteration.
  for (const { tenant } of plans) {
    // Declare tours for use by the surrounding module or function.
    const tours = await db.collection("tours").find({ tenantId: tenant._id, isDeleted: { $ne: true } }).toArray();
    // Declare destinations for use by the surrounding module or function.
    const destinations = await db.collection("destinations").find({ tenantId: tenant._id, isDeleted: { $ne: true } }).toArray();
    // Declare destinationIds for use by the surrounding module or function.
    const destinationIds = new Set(destinations.map((item) => String(item._id)));
    // Declare invalid for use by the surrounding module or function.
    const invalid = tours.filter((tour) => !destinationIds.has(String(tour.destination)) || !Array.isArray(tour.itinerary) || tour.itinerary.length !== getEffectiveTourDuration(tour, tenant.slug) || tour.itinerary.some((day, index) => day.day !== index + 1 || !day.title || !day.description));
    // Check the condition (invalid.length) and run the matching branch.
    if (invalid.length) throw new Error(`Post-write verification failed for ${tenant.slug}: ${invalid.length} invalid tours.`);
    // Perform the side effect or state update expressed on the following line.
    verification.push({ tenant: tenant.slug, tours: tours.length, invalidItineraries: invalid.length });
  }
  // Perform the side effect or state update expressed on the following line.
  console.log(JSON.stringify({ success: true, updated, verification }, null, 2));
}

// Check the condition (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).) and run the matching branch.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  // Perform the side effect or state update expressed on the following line.
  main().catch((error) => {
    // Perform the side effect or state update expressed on the following line.
    console.error(error.message);
    // Perform the side effect or state update expressed on the following line.
    process.exitCode = 1;
  }).finally(async () => {
    // Check the condition (mongoose.connection.readyState) and run the matching branch.
    if (mongoose.connection.readyState) await mongoose.disconnect();
  });
}
