/**
 * Purpose: repair Global Tours Media operational script. Main declarations: slugify, hasUsableImage, repair.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load dotenv so this module can use its exported dependencies.
import dotenv from "dotenv";
// Load ../models/Destination.js so this module can use its exported dependencies.
import Destination from "../models/Destination.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant } from "../tenancy/context.js";

// Perform the side effect or state update expressed on the following line.
dotenv.config();

// Stable remote images used only as database fallback media. The pool intentionally
// contains more images than the destination catalogue so tours do not reuse the
// same photograph across cards.
// Declare IMAGE_POOL for use by the surrounding module or function.
const IMAGE_POOL = [
  "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1470214304380-aadaedcfff1b?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=85",
];

// Declare DESTINATIONS for use by the surrounding module or function.
const DESTINATIONS = [
  "Tsavo National Park",
  "Lake Naivasha",
  "Watamu",
  "Mount Kenya",
  "Samburu National Reserve",
];

// Declare TOUR_DESTINATIONS for use by the surrounding module or function.
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

// Declare slugify for use by the surrounding module or function.
const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
// Declare hasUsableImage for use by the surrounding module or function.
const hasUsableImage = (value) => {
  // Declare url for use by the surrounding module or function.
  const url = typeof value === "string" ? value.trim() : "";
  // Return the expression shown below to the caller.
  return /^https?:\/\//i.test(url) && !/image-placeholder|placeholder/i.test(url);
};

// Define repair; its parameters and body implement this operation.
async function repair() {
  // Check the condition (!process.env.MONGODB_URI) and run the matching branch.
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing in .env");
  // Perform the side effect or state update expressed on the following line.
  await mongoose.connect(process.env.MONGODB_URI);

  // Perform the side effect or state update expressed on the following line.
  await runWithTenant({ role: "super_admin", bypass: true }, async () => {
    // Declare destinations for use by the surrounding module or function.
    const destinations = await Destination.find({ name: { $in: DESTINATIONS }, isDeleted: false }).sort({ createdAt: 1 });
    // Declare destinationByName for use by the surrounding module or function.
    const destinationByName = new Map();

    // Repeat the enclosed work for each required iteration.
    for (const destination of destinations) {
      // Declare existing for use by the surrounding module or function.
      const existing = destinationByName.get(destination.name);
      // Check the condition (!existing) and run the matching branch.
      if (!existing) {
        // Perform the side effect or state update expressed on the following line.
        destinationByName.set(destination.name, destination);
        // Declare image for use by the surrounding module or function.
        const image = IMAGE_POOL[DESTINATIONS.indexOf(destination.name) % IMAGE_POOL.length];
        // Perform the side effect or state update expressed on the following line.
        destination.featuredImage = image;
        // Perform the side effect or state update expressed on the following line.
        destination.images = [{ url: image }];
        // Perform the side effect or state update expressed on the following line.
        destination.active = true;
        // Perform the side effect or state update expressed on the following line.
        destination.status = "active";
        // Perform the side effect or state update expressed on the following line.
        destination.isDeleted = false;
        // Perform the side effect or state update expressed on the following line.
        await destination.save();
      } else {
        // Perform the side effect or state update expressed on the following line.
        await Destination.deleteOne({ _id: destination._id });
      }
    }

    // Declare syntheticDestinations for use by the surrounding module or function.
    const syntheticDestinations = await Destination.find({
      $or: [
        { name: { $in: ["Coherent tours Test Destination", "Africa safaris Test Destination"] } },
        { name: /^Destination Test [a-f0-9]+ \d+$/i },
      ],
    }, { _id: 1 });
    // Check the condition (syntheticDestinations.length) and run the matching branch.
    if (syntheticDestinations.length) {
      // Perform the side effect or state update expressed on the following line.
      await Destination.deleteMany({ _id: { $in: syntheticDestinations.map((destination) => destination._id) } });
    }

    // Declare fixed for use by the surrounding module or function.
    let fixed = 0;
    // Declare removedDuplicates for use by the surrounding module or function.
    let removedDuplicates = 0;
    // Declare tourTitles for use by the surrounding module or function.
    const tourTitles = Object.keys(TOUR_DESTINATIONS);

    // Repeat the enclosed work for each required iteration.
    for (const [title, destinationName] of Object.entries(TOUR_DESTINATIONS)) {
      // Declare destination for use by the surrounding module or function.
      const destination = destinationByName.get(destinationName);
      // Check the condition (!destination) and run the matching branch.
      if (!destination) continue;

      // Declare matches for use by the surrounding module or function.
      const matches = await Tour.find({ title, isDeleted: false }).sort({ createdAt: 1 });
      // Check the condition (!matches.length) and run the matching branch.
      if (!matches.length) continue;

      // Declare canonical for use by the surrounding module or function.
      const canonical = matches.find((tour) => String(tour.destination || "") === String(destination._id)) || matches[0];
      // Declare index for use by the surrounding module or function.
      const index = tourTitles.indexOf(title);
      // Declare image for use by the surrounding module or function.
      const image = IMAGE_POOL[index % IMAGE_POOL.length];
      // Declare galleryImage for use by the surrounding module or function.
      const galleryImage = IMAGE_POOL[(index + 1) % IMAGE_POOL.length];

      // Perform the side effect or state update expressed on the following line.
      canonical.destination = destination._id;
      // Perform the side effect or state update expressed on the following line.
      canonical.country = "Kenya";
      // Perform the side effect or state update expressed on the following line.
      canonical.location = destination.region || destination.name;
      // Perform the side effect or state update expressed on the following line.
      canonical.featuredImage = { url: image };
      // Perform the side effect or state update expressed on the following line.
      canonical.gallery = [
        { url: image },
        { url: galleryImage },
      ];
      // Perform the side effect or state update expressed on the following line.
      canonical.published = true;
      // Perform the side effect or state update expressed on the following line.
      canonical.available = true;
      // Perform the side effect or state update expressed on the following line.
      canonical.isDeleted = false;
      // Perform the side effect or state update expressed on the following line.
      canonical.status = canonical.status === "draft" ? "upcoming" : canonical.status;
      // Perform the side effect or state update expressed on the following line.
      await canonical.save();
      // Perform the side effect or state update expressed on the following line.
      fixed += 1;

      // Declare duplicateIds for use by the surrounding module or function.
      const duplicateIds = matches.filter((tour) => String(tour._id) !== String(canonical._id)).map((tour) => tour._id);
      // Check the condition (duplicateIds.length) and run the matching branch.
      if (duplicateIds.length) {
        // Perform the side effect or state update expressed on the following line.
        await Tour.deleteMany({ _id: { $in: duplicateIds } });
        // Perform the side effect or state update expressed on the following line.
        removedDuplicates += duplicateIds.length;
      }
    }

    // Declare syntheticTours for use by the surrounding module or function.
    const syntheticTours = await Tour.find({
      $or: [
        { title: /^(Coherent tours|Africa safaris)/i },
        { title: /^Tenant [a-f0-9]+ Safari Tour \d+$/i },
      ],
    }, { _id: 1 });
    // Check the condition (syntheticTours.length) and run the matching branch.
    if (syntheticTours.length) {
      // Perform the side effect or state update expressed on the following line.
      await Tour.deleteMany({ _id: { $in: syntheticTours.map((tour) => tour._id) } });
      // Perform the side effect or state update expressed on the following line.
      removedDuplicates += syntheticTours.length;
    }

    // Declare allTours for use by the surrounding module or function.
    const allTours = await Tour.find({ isDeleted: false }).sort({ createdAt: 1 });
    // Repeat the enclosed work for each required iteration.
    for (const tour of allTours) {
      // Declare destination for use by the surrounding module or function.
      const destination = tour.destination ? await Destination.findById(tour.destination) : null;
      // Declare featuredUrl for use by the surrounding module or function.
      const featuredUrl = tour.featuredImage?.url;
      // Declare galleryUrl for use by the surrounding module or function.
      const galleryUrl = tour.gallery?.find((item) => hasUsableImage(item?.url))?.url;

      // Check the condition (hasUsableImage(featuredUrl) && hasUsableImage(galleryUrl)) and run the matching branch.
      if (hasUsableImage(featuredUrl) && hasUsableImage(galleryUrl)) continue;

      // Declare index for use by the surrounding module or function.
      const index = Math.abs(String(tour._id).split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)) % IMAGE_POOL.length;
      // Declare primary for use by the surrounding module or function.
      const primary = hasUsableImage(featuredUrl) ? featuredUrl : IMAGE_POOL[index];
      // Declare secondary for use by the surrounding module or function.
      const secondary = hasUsableImage(galleryUrl) && galleryUrl !== primary ? galleryUrl : IMAGE_POOL[(index + 1) % IMAGE_POOL.length];

      // Perform the side effect or state update expressed on the following line.
      tour.featuredImage = { url: primary };
      // Perform the side effect or state update expressed on the following line.
      tour.gallery = [{ url: primary }, { url: secondary }];

      // Check the condition (destination) and run the matching branch.
      if (destination) {
        // Perform the side effect or state update expressed on the following line.
        tour.destination = destination._id;
        // Perform the side effect or state update expressed on the following line.
        tour.country = tour.country || "Kenya";
        // Perform the side effect or state update expressed on the following line.
        tour.location = tour.location || destination.region || destination.name;
      }

      // Perform the side effect or state update expressed on the following line.
      tour.published = true;
      // Perform the side effect or state update expressed on the following line.
      tour.available = true;
      // Perform the side effect or state update expressed on the following line.
      tour.isDeleted = false;
      // Perform the side effect or state update expressed on the following line.
      await tour.save();
      // Perform the side effect or state update expressed on the following line.
      fixed += 1;
    }

    // Declare legacyTours for use by the surrounding module or function.
    const legacyTours = await Tour.find({
      $or: [
        { title: /^Coherent tours/i },
        { title: /^Africa safaris/i },
      ],
    }, { _id: 1 });
    // Check the condition (legacyTours.length) and run the matching branch.
    if (legacyTours.length) {
      // Perform the side effect or state update expressed on the following line.
      await Tour.deleteMany({ _id: { $in: legacyTours.map((tour) => tour._id) } });
      // Perform the side effect or state update expressed on the following line.
      removedDuplicates += legacyTours.length;
    }

    // Check the condition (syntheticDestinations.length) and run the matching branch.
    if (syntheticDestinations.length) {
      // Perform the side effect or state update expressed on the following line.
      removedDuplicates += syntheticDestinations.length;
    }

    // Perform the side effect or state update expressed on the following line.
    console.log(`Global Tours media/destination repair complete: ${fixed} tours repaired, ${removedDuplicates} duplicate/synthetic records removed.`);
  });
}

// Perform the side effect or state update expressed on the following line.
repair()
  .catch((error) => {
    // Perform the side effect or state update expressed on the following line.
    console.error("Global Tours repair failed:", error);
    // Perform the side effect or state update expressed on the following line.
    process.exitCode = 1;
  })
  .finally(async () => {
    // Perform the side effect or state update expressed on the following line.
    await mongoose.connection.close().catch(() => {});
  });
