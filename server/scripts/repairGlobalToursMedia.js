import mongoose from "mongoose";
import dotenv from "dotenv";
import Destination from "../models/Destination.js";
import Tour from "../models/Tour.js";
import { runWithTenant } from "../tenancy/context.js";

dotenv.config();

const IMAGE_POOL = [
  "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1470214304380-aadaedcfff1b?auto=format&fit=crop&w=1200&q=85",
];

const DESTINATIONS = [
  "Tsavo National Park",
  "Lake Naivasha",
  "Watamu",
  "Mount Kenya",
  "Samburu National Reserve",
];

const TOUR_DESTINATIONS = {
  "Tsavo East Wildlife Explorer": "Tsavo National Park",
  "Tsavo West Rhino & Springs Safari": "Tsavo National Park",
  "Naivasha Lakeside Escape": "Lake Naivasha",
  "Hell's Gate Cycling Adventure": "Lake Naivasha",
  "Lake Naivasha & Crescent Island Safari": "Lake Naivasha",
  "Watamu Beach Retreat": "Watamu",
  "Watamu Marine Discovery": "Watamu",
  "Malindi & Watamu Coastal Escape": "Watamu",
  "Mount Kenya Highland Adventure": "Mount Kenya",
  "Mount Kenya Sirimon Trek": "Mount Kenya",
  "Mount Kenya Scenic Highlands": "Mount Kenya",
  "Samburu Wildlife Discovery": "Samburu National Reserve",
  "Samburu Cultural Safari": "Samburu National Reserve",
  "Northern Kenya Photography Safari": "Samburu National Reserve",
  "Tsavo Family Safari": "Tsavo National Park",
  "Tsavo Luxury Wilderness Escape": "Tsavo National Park",
  "Naivasha Romantic Getaway": "Lake Naivasha",
  "Watamu Honeymoon Paradise": "Watamu",
  "Mount Kenya Family Highlands": "Mount Kenya",
  "Samburu Luxury Wilderness Experience": "Samburu National Reserve",
};

const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function repair() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing in .env");
  await mongoose.connect(process.env.MONGODB_URI);

  await runWithTenant({ role: "super_admin", bypass: true }, async () => {
    const destinations = await Destination.find({ name: { $in: DESTINATIONS }, isDeleted: false }).sort({ createdAt: 1 });
    const destinationByName = new Map();

    for (const destination of destinations) {
      const existing = destinationByName.get(destination.name);
      if (!existing) {
        destinationByName.set(destination.name, destination);
        const image = IMAGE_POOL[DESTINATIONS.indexOf(destination.name) % IMAGE_POOL.length];
        destination.featuredImage = image;
        destination.images = [{ url: image }];
        destination.active = true;
        destination.status = "active";
        destination.isDeleted = false;
        await destination.save();
      } else {
        // Keep the first canonical destination and remove duplicate test copies only.
        await Destination.deleteOne({ _id: destination._id });
      }
    }

    // Remove the two old placeholder/test destinations that cannot be useful to Global Tours.
    await Destination.deleteMany({
      name: { $in: ["Coherent tours Test Destination", "Africa safaris Test Destination"] },
    });

    let fixed = 0;
    let removedDuplicates = 0;

    for (const [title, destinationName] of Object.entries(TOUR_DESTINATIONS)) {
      const destination = destinationByName.get(destinationName);
      if (!destination) continue;

      const matches = await Tour.find({ title, isDeleted: false }).sort({ createdAt: 1 });
      if (!matches.length) continue;

      const canonical = matches.find((tour) => String(tour.destination || "") === String(destination._id)) || matches[0];
      const index = Object.keys(TOUR_DESTINATIONS).indexOf(title);
      const image = IMAGE_POOL[(index + 2) % IMAGE_POOL.length];

      canonical.destination = destination._id;
      canonical.country = "Kenya";
      canonical.location = destination.region || destination.name;
      canonical.featuredImage = { url: image };
      canonical.gallery = [
        { url: image },
        { url: IMAGE_POOL[(index + 3) % IMAGE_POOL.length] },
      ];
      canonical.published = true;
      canonical.available = true;
      canonical.isDeleted = false;
      canonical.status = canonical.status === "draft" ? "upcoming" : canonical.status;
      await canonical.save();
      fixed += 1;

      const duplicateIds = matches.filter((tour) => String(tour._id) !== String(canonical._id)).map((tour) => tour._id);
      if (duplicateIds.length) {
        await Tour.deleteMany({ _id: { $in: duplicateIds } });
        removedDuplicates += duplicateIds.length;
      }
    }

    // Remove old placeholder/test tours that belong to previous branding and are not part of Global Tours test data.
    const oldTestTours = await Tour.find({ title: { $regex: /^(Coherent tours|Africa safaris)/i } }, { _id: 1 });
    if (oldTestTours.length) {
      await Tour.deleteMany({ _id: { $in: oldTestTours.map((tour) => tour._id) } });
      removedDuplicates += oldTestTours.length;
    }

    console.log(`Global Tours media/destination repair complete: ${fixed} tours fixed, ${removedDuplicates} duplicate/legacy records removed.`);
  });
}

repair()
  .catch((error) => {
    console.error("Global Tours repair failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close().catch(() => {});
  });
