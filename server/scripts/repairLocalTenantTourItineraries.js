import "dotenv/config";
import mongoose from "mongoose";
import { pathToFileURL } from "node:url";
import { buildCatalogueItinerary, resolveTourDurationDays } from "./repairHusseindbTenantCatalogues.js";

export const LOCAL_TENANT_SLUGS = ["hussein-mboya", "amani-trails", "demo-safari"];

export function assertSafeLocalTourRepairTarget(rawUri, env = process.env) {
  if (env.CONFIRM_LOCAL_TOUR_ITINERARY_REPAIR !== "YES") {
    throw new Error("Set CONFIRM_LOCAL_TOUR_ITINERARY_REPAIR=YES to confirm a local, non-destructive itinerary repair.");
  }
  if (!rawUri) throw new Error("MONGODB_URI is required.");
  if (String(env.NODE_ENV || "").toLowerCase() === "production") {
    throw new Error("Refusing local itinerary repair while NODE_ENV=production.");
  }
  const target = new URL(rawUri);
  const host = target.hostname.toLowerCase();
  const database = decodeURIComponent(target.pathname.replace(/^\//, "").split("/")[0] || "");
  const localHosts = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);
  if (!localHosts.has(host)) throw new Error("Refusing itinerary repair: MongoDB host must be localhost or loopback.");
  if (!database || database.toLowerCase() === "husseindb" || !/(local|test|testing|demo|dev|disposable|seed|ci)/i.test(database)) {
    throw new Error("Refusing itinerary repair: use an explicitly named local/test/demo database, never husseindb.");
  }
  return { host, database };
}

async function main() {
  const target = assertSafeLocalTourRepairTarget(process.env.MONGODB_URI);
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000, appName: "local-tenant-tour-itinerary-repair" });
  const db = mongoose.connection.db;
  const organizations = await db.collection("organizations").find(
    { slug: { $in: LOCAL_TENANT_SLUGS } },
    { projection: { _id: 1, slug: 1, name: 1 } },
  ).toArray();
  const missingTenants = LOCAL_TENANT_SLUGS.filter((slug) => !organizations.some((tenant) => tenant.slug === slug));
  if (missingTenants.length) throw new Error(`Preflight failed; missing tenant(s): ${missingTenants.join(", ")}. No records were changed.`);

  const plans = [];
  for (const tenant of organizations) {
    const scope = { tenantId: tenant._id, isDeleted: { $ne: true } };
    const tours = await db.collection("tours").find(scope).toArray();
    if (!tours.length) throw new Error(`Preflight failed; no active catalogue tours found for ${tenant.slug}. No records were changed.`);
    const destinationIds = [...new Set(tours.map((tour) => tour.destination).filter(Boolean).map(String))];
    const destinations = await db.collection("destinations").find({
      tenantId: tenant._id,
      _id: { $in: destinationIds.map((id) => new mongoose.Types.ObjectId(id)) },
      isDeleted: { $ne: true },
    }).toArray();
    const destinationById = new Map(destinations.map((destination) => [String(destination._id), destination]));
    for (const tour of tours) {
      const destination = destinationById.get(String(tour.destination));
      if (!destination) throw new Error(`Preflight failed; tour ${tour.title || tour._id} has no destination owned by ${tenant.slug}. No records were changed.`);
      const durationDays = resolveTourDurationDays(tour);
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

  const summary = LOCAL_TENANT_SLUGS.map((slug) => {
    const items = plans.filter((plan) => plan.tenant.slug === slug);
    return { tenant: slug, tours: items.length, itineraryDays: items.reduce((sum, item) => sum + item.itinerary.length, 0) };
  });
  console.log(JSON.stringify({ mode: "LOCAL_NON_DESTRUCTIVE_REPAIR", target, summary }, null, 2));

  const writes = plans.map(({ tenant, tour, itinerary }) => ({
    updateOne: {
      filter: { _id: tour._id, tenantId: tenant._id, isDeleted: { $ne: true } },
      update: { $set: { itinerary, updatedAt: new Date() } },
    },
  }));
  if (writes.length) await db.collection("tours").bulkWrite(writes, { ordered: true });

  const verification = [];
  for (const tenant of organizations) {
    const rows = await db.collection("tours").find({ tenantId: tenant._id, isDeleted: { $ne: true } }).toArray();
    const invalid = rows.filter((tour) => !Array.isArray(tour.itinerary) || tour.itinerary.length !== resolveTourDurationDays(tour) || tour.itinerary.some((day, index) => Number(day.day) !== index + 1 || !day.title || !day.description || !Array.isArray(day.activities) || !day.activities.length));
    if (invalid.length) throw new Error(`Post-write verification failed for ${tenant.slug}: ${invalid.length} tour(s) have incomplete or duration-mismatched itineraries.`);
    verification.push({ tenant: tenant.slug, toursVerified: rows.length, invalidItineraries: 0 });
  }
  console.log(JSON.stringify({ success: true, applied: true, database: target.database, verification }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error("Local tour itinerary repair failed: " + String(error.message || error).replace(/mongodb\S*/gi, "[MongoDB URI redacted]"));
    process.exitCode = 1;
  }).finally(() => mongoose.disconnect().catch(() => {}));
}
