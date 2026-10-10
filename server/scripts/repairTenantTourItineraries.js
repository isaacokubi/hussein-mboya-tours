import "dotenv/config";
import mongoose from "mongoose";
import { pathToFileURL } from "node:url";

export const EXPECTED_HOST = "cluster0.cdtxzts.mongodb.net";
export const EXPECTED_DATABASE = "husseindb";
export const EXPECTED_TENANTS = ["hussein-mboya", "amani-trails", "demo-safari"];

export function assertItineraryRepairTarget(rawUri, env = process.env) {
  if (env.CONFIRM_TENANT_ITINERARY_REPAIR !== "YES") {
    throw new Error("Set CONFIRM_TENANT_ITINERARY_REPAIR=YES to confirm the targeted itinerary repair.");
  }
  if (!rawUri) throw new Error("MONGODB_URI is required.");
  const target = new URL(rawUri);
  const database = decodeURIComponent(target.pathname.replace(/^\//, "").split("/")[0] || "");
  if (target.hostname.toLowerCase() !== EXPECTED_HOST || database !== EXPECTED_DATABASE) {
    throw new Error(`Refusing to write outside ${EXPECTED_DATABASE} on the approved Atlas cluster.`);
  }
  if (String(env.NODE_ENV || "").toLowerCase() === "production") {
    throw new Error("Run the repair in an explicitly controlled maintenance session, not with NODE_ENV=production.");
  }
  return { host: target.hostname.toLowerCase(), database };
}

const cleanList = (values) => (Array.isArray(values) ? values : []).map((value) => String(value || "").trim()).filter(Boolean);

export function buildCorrectedItinerary(tour, destination, tenantId) {
  const days = Number(tour.durationDays ?? tour.durationDetails?.days ?? Number.parseInt(String(tour.duration || "").match(/\d+/)?.[0], 10) ?? 1);
  if (!Number.isInteger(days) || days < 1 || days > 365) throw new Error(`Invalid duration for tour ${tour.title || tour._id}: ${days}`);
  const destinationName = String(destination.name || tour.location || "the destination").trim();
  const destinationDescription = String(destination.description || tour.description || "").trim();
  const activities = cleanList(destination.activities);
  const highlights = cleanList(tour.highlights);
  const baseActivities = [...new Set([...highlights, ...activities])];
  const safeActivities = baseActivities.length ? baseActivities : [`Guided experience in ${destinationName}`];
  return Array.from({ length: days }, (_, index) => {
    const day = index + 1;
    const isArrival = day === 1;
    const isDeparture = day === days;
    const title = days === 1
      ? `Explore ${destinationName}`
      : isArrival
        ? `Arrival and introduction to ${destinationName}`
        : isDeparture
          ? `Final experiences and departure from ${destinationName}`
          : `Discover ${destinationName} — Day ${day}`;
    const dayActivities = isArrival
      ? [`Arrival briefing in ${destinationName}`, safeActivities[0]]
      : isDeparture
        ? [safeActivities[(day - 1) % safeActivities.length], "Return transfer and departure"]
        : [safeActivities[(day - 2) % safeActivities.length], safeActivities[(day - 1) % safeActivities.length]];
    const description = isArrival
      ? `Meet your guide, review the travel plan and begin your visit to ${destinationName}. ${destinationDescription}`.trim()
      : isDeparture
        ? `Enjoy a final planned activity in ${destinationName}, then begin the return transfer.`
        : `Spend day ${day} exploring ${destinationName} with a guided programme focused on ${dayActivities.join(" and ").toLowerCase()}.`;
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

async function main() {
  assertItineraryRepairTarget(process.env.MONGODB_URI);
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000, appName: "tenant-tour-itinerary-repair" });
  const db = mongoose.connection.db;
  const tenants = await db.collection("organizations").find(
    { slug: { $in: EXPECTED_TENANTS } },
    { projection: { _id: 1, slug: 1, name: 1 } }
  ).toArray();
  if (tenants.length !== EXPECTED_TENANTS.length) throw new Error("Expected all three known tenants. No records were changed.");

  const plans = [];
  for (const tenant of tenants) {
    const [tours, destinations] = await Promise.all([
      db.collection("tours").find({ tenantId: tenant._id, isDeleted: { $ne: true } }).toArray(),
      db.collection("destinations").find({ tenantId: tenant._id, isDeleted: { $ne: true } }).toArray()
    ]);
    if (!tours.length || !destinations.length) throw new Error(`Missing tours or destinations for ${tenant.slug}. No records were changed.`);
    const destinationById = new Map(destinations.map((item) => [String(item._id), item]));
    const entries = tours.map((tour) => {
      const destination = destinationById.get(String(tour.destination));
      if (!destination) throw new Error(`Tour ${tour.title || tour._id} in ${tenant.slug} references a missing or cross-tenant destination. No records were changed.`);
      return { tour, destination, itinerary: buildCorrectedItinerary(tour, destination, tenant._id) };
    });
    plans.push({ tenant, tours: entries });
  }

  const summary = plans.map(({ tenant, tours }) => ({
    tenant: tenant.slug,
    tours: tours.length,
    toursToUpdate: tours.filter(({ tour, itinerary }) => JSON.stringify(tour.itinerary || []) !== JSON.stringify(itinerary)).length,
    itineraryDayCounts: tours.map(({ tour, itinerary }) => ({ title: tour.title, durationDays: Number(tour.durationDays ?? tour.durationDetails?.days ?? itinerary.length), itineraryDays: itinerary.length }))
  }));
  console.log(JSON.stringify({ mode: process.env.APPLY_TENANT_ITINERARY_REPAIR === "YES" ? "APPLY" : "DRY_RUN", database: EXPECTED_DATABASE, summary }, null, 2));
  if (process.env.APPLY_TENANT_ITINERARY_REPAIR !== "YES") {
    console.log("Dry run only: no database records were modified. Set APPLY_TENANT_ITINERARY_REPAIR=YES after reviewing the plan.");
    return;
  }

  let updated = 0;
  for (const { tenant, tours } of plans) {
    for (const { tour, itinerary } of tours) {
      const result = await db.collection("tours").updateOne(
        { _id: tour._id, tenantId: tenant._id, destination: tour.destination, isDeleted: { $ne: true } },
        { $set: { itinerary } }
      );
      updated += result.modifiedCount;
    }
  }

  const verification = [];
  for (const { tenant } of plans) {
    const tours = await db.collection("tours").find({ tenantId: tenant._id, isDeleted: { $ne: true } }).toArray();
    const destinations = await db.collection("destinations").find({ tenantId: tenant._id, isDeleted: { $ne: true } }).toArray();
    const destinationIds = new Set(destinations.map((item) => String(item._id)));
    const invalid = tours.filter((tour) => !destinationIds.has(String(tour.destination)) || !Array.isArray(tour.itinerary) || tour.itinerary.length !== Number(tour.durationDays ?? tour.durationDetails?.days ?? 1) || tour.itinerary.some((day, index) => day.day !== index + 1 || !day.title || !day.description));
    if (invalid.length) throw new Error(`Post-write verification failed for ${tenant.slug}: ${invalid.length} invalid tours.`);
    verification.push({ tenant: tenant.slug, tours: tours.length, invalidItineraries: invalid.length });
  }
  console.log(JSON.stringify({ success: true, updated, verification }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  }).finally(async () => {
    if (mongoose.connection.readyState) await mongoose.disconnect();
  });
}
