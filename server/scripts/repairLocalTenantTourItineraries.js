/**
 * Purpose: repair Local Tenant Tour Itineraries operational script. Main declarations: assertSafeLocalTourRepairTarget, main.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import "dotenv/config";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load node:url so this module can use its exported dependencies.
import { pathToFileURL } from "node:url";
// Load ./repairHusseindbTenantCatalogues.js so this module can use its exported dependencies.
import { buildCatalogueItinerary, resolveTourDurationDays } from "./repairHusseindbTenantCatalogues.js";

// Declare LOCAL_TENANT_SLUGS for use by the surrounding module or function.
export const LOCAL_TENANT_SLUGS = ["hussein-mboya", "amani-trails", "demo-safari"];

// Define assertSafeLocalTourRepairTarget; its parameters and body implement this operation.
export function assertSafeLocalTourRepairTarget(rawUri, env = process.env) {
  // Check the condition (env.CONFIRM_LOCAL_TOUR_ITINERARY_REPAIR !== "YES") and run the matching branch.
  if (env.CONFIRM_LOCAL_TOUR_ITINERARY_REPAIR !== "YES") {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Set CONFIRM_LOCAL_TOUR_ITINERARY_REPAIR=YES to confirm a local, non-destructive itinerary repair.");
  }
  // Check the condition (!rawUri) and run the matching branch.
  if (!rawUri) throw new Error("MONGODB_URI is required.");
  // Check the condition (String(env.NODE_ENV || "").toLowerCase() === "production") and run the matching branch.
  if (String(env.NODE_ENV || "").toLowerCase() === "production") {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Refusing local itinerary repair while NODE_ENV=production.");
  }
  // Declare target for use by the surrounding module or function.
  const target = new URL(rawUri);
  // Declare host for use by the surrounding module or function.
  const host = target.hostname.toLowerCase();
  // Declare database for use by the surrounding module or function.
  const database = decodeURIComponent(target.pathname.replace(/^\//, "").split("/")[0] || "");
  // Declare localHosts for use by the surrounding module or function.
  const localHosts = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);
  // Check the condition (!localHosts.has(host)) and run the matching branch.
  if (!localHosts.has(host)) throw new Error("Refusing itinerary repair: MongoDB host must be localhost or loopback.");
  // Check the condition (!database || database.toLowerCase() === "husseindb" || !/(local|test|t) and run the matching branch.
  if (!database || database.toLowerCase() === "husseindb" || !/(local|test|testing|demo|dev|disposable|seed|ci)/i.test(database)) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Refusing itinerary repair: use an explicitly named local/test/demo database, never husseindb.");
  }
  // Return the object assembled below to the caller.
  return { host, database };
}

// Define main; its parameters and body implement this operation.
async function main() {
  // Declare target for use by the surrounding module or function.
  const target = assertSafeLocalTourRepairTarget(process.env.MONGODB_URI);
  // Perform the side effect or state update expressed on the following line.
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000, appName: "local-tenant-tour-itinerary-repair" });
  // Declare db for use by the surrounding module or function.
  const db = mongoose.connection.db;
  // Declare organizations for use by the surrounding module or function.
  const organizations = await db.collection("organizations").find(
    { slug: { $in: LOCAL_TENANT_SLUGS } },
    { projection: { _id: 1, slug: 1, name: 1 } },
  ).toArray();
  // Declare missingTenants for use by the surrounding module or function.
  const missingTenants = LOCAL_TENANT_SLUGS.filter((slug) => !organizations.some((tenant) => tenant.slug === slug));
  // Check the condition (missingTenants.length) and run the matching branch.
  if (missingTenants.length) throw new Error(`Preflight failed; missing tenant(s): ${missingTenants.join(", ")}. No records were changed.`);

  // Declare plans for use by the surrounding module or function.
  const plans = [];
  // Repeat the enclosed work for each required iteration.
  for (const tenant of organizations) {
    // Declare scope for use by the surrounding module or function.
    const scope = { tenantId: tenant._id, isDeleted: { $ne: true } };
    // Declare tours for use by the surrounding module or function.
    const tours = await db.collection("tours").find(scope).toArray();
    // Check the condition (!tours.length) and run the matching branch.
    if (!tours.length) throw new Error(`Preflight failed; no active catalogue tours found for ${tenant.slug}. No records were changed.`);
    // Declare destinationIds for use by the surrounding module or function.
    const destinationIds = [...new Set(tours.map((tour) => tour.destination).filter(Boolean).map(String))];
    // Declare destinations for use by the surrounding module or function.
    const destinations = await db.collection("destinations").find({
      tenantId: tenant._id,
      _id: { $in: destinationIds.map((id) => new mongoose.Types.ObjectId(id)) },
      isDeleted: { $ne: true },
    }).toArray();
    // Declare destinationById for use by the surrounding module or function.
    const destinationById = new Map(destinations.map((destination) => [String(destination._id), destination]));
    // Repeat the enclosed work for each required iteration.
    for (const tour of tours) {
      // Declare destination for use by the surrounding module or function.
      const destination = destinationById.get(String(tour.destination));
      // Check the condition (!destination) and run the matching branch.
      if (!destination) throw new Error(`Preflight failed; tour ${tour.title || tour._id} has no destination owned by ${tenant.slug}. No records were changed.`);
      // Declare durationDays for use by the surrounding module or function.
      const durationDays = resolveTourDurationDays(tour);
      // Perform the side effect or state update expressed on the following line.
      plans.push({
        tenant,
        tour,
        itinerary: buildCatalogueItinerary({
          tenantSlug: tenant.slug,
          tourTitle: tour.title,
          destinationName: destination.name,
          destinationDescription: destination.description || destination.shortDescription,
          activities: destination.activities || destination.attractions || [],
          durationDays,
        }),
      });
    }
  }

  // Declare summary for use by the surrounding module or function.
  const summary = LOCAL_TENANT_SLUGS.map((slug) => {
    // Declare items for use by the surrounding module or function.
    const items = plans.filter((plan) => plan.tenant.slug === slug);
    // Return the object assembled below to the caller.
    return { tenant: slug, tours: items.length, itineraryDays: items.reduce((sum, item) => sum + item.itinerary.length, 0) };
  });
  // Perform the side effect or state update expressed on the following line.
  console.log(JSON.stringify({ mode: "LOCAL_NON_DESTRUCTIVE_REPAIR", target, summary }, null, 2));

  // Declare writes for use by the surrounding module or function.
  const writes = plans.map(({ tenant, tour, itinerary }) => ({
    updateOne: {
      filter: { _id: tour._id, tenantId: tenant._id, isDeleted: { $ne: true } },
      update: { $set: { itinerary, updatedAt: new Date() } },
    },
  }));
  // Check the condition (writes.length) and run the matching branch.
  if (writes.length) await db.collection("tours").bulkWrite(writes, { ordered: true });

  // Declare verification for use by the surrounding module or function.
  const verification = [];
  // Repeat the enclosed work for each required iteration.
  for (const tenant of organizations) {
    // Declare rows for use by the surrounding module or function.
    const rows = await db.collection("tours").find({ tenantId: tenant._id, isDeleted: { $ne: true } }).toArray();
    // Declare invalid for use by the surrounding module or function.
    const invalid = rows.filter((tour) => !Array.isArray(tour.itinerary) || tour.itinerary.length !== resolveTourDurationDays(tour) || tour.itinerary.some((day, index) => Number(day.day) !== index + 1 || !day.title || !day.description || !Array.isArray(day.activities) || !day.activities.length));
    // Check the condition (invalid.length) and run the matching branch.
    if (invalid.length) throw new Error(`Post-write verification failed for ${tenant.slug}: ${invalid.length} tour(s) have incomplete or duration-mismatched itineraries.`);
    // Perform the side effect or state update expressed on the following line.
    verification.push({ tenant: tenant.slug, toursVerified: rows.length, invalidItineraries: 0 });
  }
  // Perform the side effect or state update expressed on the following line.
  console.log(JSON.stringify({ success: true, applied: true, database: target.database, verification }, null, 2));
}

// Check the condition (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).) and run the matching branch.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  // Perform the side effect or state update expressed on the following line.
  main().catch((error) => {
    // Perform the side effect or state update expressed on the following line.
    console.error("Local tour itinerary repair failed: " + String(error.message || error).replace(/mongodb\S*/gi, "[MongoDB URI redacted]"));
    // Perform the side effect or state update expressed on the following line.
    process.exitCode = 1;
  }).finally(() => mongoose.disconnect().catch(() => {}));
}
