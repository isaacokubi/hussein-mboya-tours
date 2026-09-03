import mongoose from "mongoose";
import dotenv from "dotenv";
import Destination from "../models/Destination.js";
import Tour from "../models/Tour.js";
import { runWithTenant } from "../tenancy/context.js";

dotenv.config();

// Stable remote images used only as database fallback media. Every repaired record
// receives both a featured image and gallery images so old records cannot fall back
// to the application's placeholder image.
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
const hasUsableImage = (value) => {
  const url = typeof value === "string" ? value.trim() : "";
  return /^https?:\/\//i.test(url) && !/image-placeholder|placeholder/i.test(url);
};

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
        await Destination.deleteOne({ _id: destination._id });
      }
    }

    await Destination.deleteMany({
      $or: [
        { name: { $in: ["Coherent tours Test Destination", "Africa safaris Test Destination"] } },
        { name: /^Destination Test ca1945cba0/i },
      ],
    });

    let fixed = 0;
    let removedDuplicates = 0;

    // First repair the canonical Global Tours catalogue and remove duplicate copies.
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

    // Remove synthetic tenant-isolation/test data that must never appear in the
    // public Global Tours catalogue. These records are identifiable by their
    // generated test naming and are unrelated to the real Global Tours catalogue.
    const syntheticTours = await Tour.find({
      $or: [
        { title: /^(Coherent tours|Africa safaris)/i },
        { title: /^Tenant ca1945cba0 Safari Tour \d+$/i },
      ],
    }, { _id: 1 });
    if (syntheticTours.length) {
      await Tour.deleteMany({ _id: { $in: syntheticTours.map((tour) => tour._id) } });
      removedDuplicates += syntheticTours.length;
    }

    // Repair every remaining active tour that has no usable image. This catches
    // older legitimate records that were created before the Global Tours media
    // repair, rather than relying only on the 20 seeded titles above.
    const allTours = await Tour.find({ isDeleted: false }).sort({ createdAt: 1 });
    for (const tour of allTours) {
      const destination = tour.destination ? await Destination.findById(tour.destination) : null;
      const featuredUrl = tour.featuredImage?.url;
      const galleryUrl = tour.gallery?.find((item) => hasUsableImage(item?.url))?.url;

      if (hasUsableImage(featuredUrl) && hasUsableImage(galleryUrl)) continue;

      const index = Math.abs(String(tour._id).split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)) % IMAGE_POOL.length;
      const primary = hasUsableImage(featuredUrl) ? featuredUrl : IMAGE_POOL[index];
      const secondary = hasUsableImage(galleryUrl) && galleryUrl !== primary ? galleryUrl : IMAGE_POOL[(index + 1) % IMAGE_POOL.length];

      tour.featuredImage = { url: primary };
      tour.gallery = [{ url: primary }, { url: secondary }];

      if (destination) {
        tour.destination = destination._id;
        tour.country = tour.country || "Kenya";
        tour.location = tour.location || destination.region || destination.name;
      }

      tour.published = true;
      tour.available = true;
      tour.isDeleted = false;
      await tour.save();
      fixed += 1;
    }

    // Remove legacy placeholder/test tours that are still visible under Global Tours.
    const legacyTours = await Tour.find({
      $or: [
        { title: /^Coherent tours/i },
        { title: /^Africa safaris/i },
      ],
    }, { _id: 1 });
    if (legacyTours.length) {
      await Tour.deleteMany({ _id: { $in: legacyTours.map((tour) => tour._id) } });
      removedDuplicates += legacyTours.length;
    }

    console.log(`Global Tours media/destination repair complete: ${fixed} tours repaired, ${removedDuplicates} duplicate/synthetic records removed.`);
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
