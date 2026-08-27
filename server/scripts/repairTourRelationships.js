import "dotenv/config";
import mongoose from "mongoose";
import Tour from "../models/Tour.js";
import Destination from "../models/Destination.js";
import { runWithTenant } from "../tenancy/context.js";

const normalize = (value) => String(value || "").trim().toLowerCase();
const tokens = (value) => normalize(value)
  .split(/[^a-z0-9]+/i)
  .map((token) => token.trim())
  .filter((token) => token.length >= 3);

const tourText = (tour) => normalize([
  tour.title,
  tour.slug,
  tour.location,
  tour.country,
  tour.shortDescription,
  ...(Array.isArray(tour.tags) ? tour.tags : []),
].filter(Boolean).join(" "));

const destinationText = (destination) => normalize([
  destination.name,
  destination.slug,
  destination.city,
  destination.region,
  destination.country,
].filter(Boolean).join(" "));

const sameTenant = (tour, destination) => String(tour.tenantId || "") === String(destination.tenantId || "");

const scoreCandidate = (tour, destination) => {
  const haystack = tourText(tour);
  const name = normalize(destination.name);
  const slug = normalize(destination.slug);
  const city = normalize(destination.city);
  const region = normalize(destination.region);
  let score = 0;

  if (name && haystack.includes(name)) score += 100;
  if (slug && haystack.includes(slug)) score += 95;
  if (city && haystack.includes(city)) score += 80;
  if (region && haystack.includes(region)) score += 60;
  if (normalize(tour.location) === city || normalize(tour.location) === region) score += 40;
  if (normalize(tour.country) && normalize(tour.country) === normalize(destination.country)) score += 10;

  const tourTokens = new Set(tokens([
    tour.title,
    tour.slug,
    tour.location,
    tour.shortDescription,
    ...(Array.isArray(tour.tags) ? tour.tags : []),
  ].filter(Boolean).join(" ")));
  const destinationTokens = new Set(tokens(destinationText(destination)));
  for (const token of destinationTokens) {
    if (tourTokens.has(token)) score += 8;
  }

  return score;
};

const chooseDestination = (tour, destinations) => {
  const candidates = destinations.filter((destination) => sameTenant(tour, destination));
  if (!candidates.length) return null;

  const ranked = candidates
    .map((destination) => ({ destination, score: scoreCandidate(tour, destination) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  if (!ranked.length) return null;

  // Require a clear winner. This prevents an ambiguous tour from being
  // silently attached to the wrong destination.
  const [best, second] = ranked;
  if (best.score < 60) return null;
  if (second && best.score === second.score) return null;
  return best.destination;
};

const run = async () => {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required");
  await mongoose.connect(process.env.MONGODB_URI);

  // This is an explicit platform maintenance operation. The normal tenant
  // plugin must remain strict for application requests, but a repair script
  // needs to inspect every tenant in one controlled operation.
  await runWithTenant({ role: "super_admin", tenantId: null, tenant: null, bypass: true }, async () => {
    const destinations = await Destination.find({ isDeleted: { $ne: true } }).lean();
    const destinationById = new Map(destinations.map((destination) => [String(destination._id), destination]));
    const tours = await Tour.find({ isDeleted: { $ne: true } }).lean();

    let alreadyLinked = 0;
    let repaired = 0;
    let invalidReferences = 0;
    const unresolved = [];

    for (const tour of tours) {
      const currentDestination = tour.destination ? destinationById.get(String(tour.destination)) : null;
      if (currentDestination && sameTenant(tour, currentDestination)) {
        alreadyLinked += 1;
        continue;
      }

      if (tour.destination) invalidReferences += 1;

      const selected = chooseDestination(tour, destinations);
      if (selected) {
        // Use the model update while inside the explicit platform bypass.
        await Tour.updateOne(
          { _id: tour._id },
          { $set: { destination: selected._id } },
          { runValidators: true },
        );
        repaired += 1;
        console.log(`REPAIRED: ${tour.title} -> ${selected.name}`);
      } else {
        unresolved.push({
          id: String(tour._id),
          tenantId: String(tour.tenantId || ""),
          title: tour.title,
          country: tour.country,
          location: tour.location,
          currentDestination: currentDestination?.name || null,
        });
      }
    }

    console.log("\nTour relationship audit complete.");
    console.log(`Total active tours: ${tours.length}`);
    console.log(`Already correctly linked: ${alreadyLinked}`);
    console.log(`Repaired automatically: ${repaired}`);
    console.log(`Invalid/cross-tenant destination references found: ${invalidReferences}`);
    console.log(`Unresolved: ${unresolved.length}`);

    if (unresolved.length) {
      console.log("\nUnresolved tours (assign these manually in Admin > Tours):");
      console.table(unresolved);
    }
  });
};

run()
  .catch((error) => {
    console.error("Tour relationship repair failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
