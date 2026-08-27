import "dotenv/config";
import mongoose from "mongoose";
import Tour from "../models/Tour.js";
import Destination from "../models/Destination.js";

const normalize = (value) => String(value || "").trim().toLowerCase();
const text = (tour) => normalize([tour.title, tour.slug, tour.location, tour.country].filter(Boolean).join(" "));

const run = async () => {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required");
  await mongoose.connect(process.env.MONGODB_URI);

  const destinations = await Destination.find({ isDeleted: { $ne: true } }).lean();
  const destinationById = new Map(destinations.map((destination) => [String(destination._id), destination]));
  const tours = await Tour.find({ isDeleted: { $ne: true } }).lean();

  let alreadyLinked = 0;
  let repaired = 0;
  const unresolved = [];

  for (const tour of tours) {
    if (tour.destination && destinationById.has(String(tour.destination))) {
      alreadyLinked += 1;
      continue;
    }

    const haystack = text(tour);
    const sameTenant = destinations.filter((destination) => String(destination.tenantId || "") === String(tour.tenantId || ""));
    const candidates = sameTenant.length ? sameTenant : destinations;
    const matches = candidates.filter((destination) => {
      const name = normalize(destination.name);
      const slug = normalize(destination.slug);
      return (name && haystack.includes(name)) || (slug && haystack.includes(slug));
    });

    let selected = matches.length === 1 ? matches[0] : null;
    if (!selected) {
      const countryMatches = candidates.filter((destination) => normalize(destination.country) === normalize(tour.country));
      if (countryMatches.length === 1) selected = countryMatches[0];
    }

    if (selected) {
      await Tour.updateOne({ _id: tour._id }, { $set: { destination: selected._id } });
      repaired += 1;
      console.log(`REPAIRED: ${tour.title} -> ${selected.name}`);
    } else {
      unresolved.push({ id: String(tour._id), title: tour.title, country: tour.country, location: tour.location });
    }
  }

  console.log(`\nTour relationship audit complete.`);
  console.log(`Already linked: ${alreadyLinked}`);
  console.log(`Repaired automatically: ${repaired}`);
  console.log(`Unresolved: ${unresolved.length}`);
  if (unresolved.length) {
    console.log("\nUnresolved tours (assign these manually in Admin > Tours):");
    console.table(unresolved);
  }
};

run()
  .catch((error) => {
    console.error("Tour relationship repair failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
