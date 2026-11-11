/**
 * Purpose: repair Global Tour Media database seed module. Main declarations: repair.
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

// Declare IMAGE_POOL for use by the surrounding module or function.
const IMAGE_POOL = [
  "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
];

// Declare destinationSlugs for use by the surrounding module or function.
const destinationSlugs = [
  "tsavo-national-park",
  "lake-naivasha",
  "watamu",
  "mount-kenya",
  "samburu-national-reserve",
];

// Declare tourTitles for use by the surrounding module or function.
const tourTitles = [
  "Tsavo East Wildlife Explorer",
  "Tsavo West Rhino & Springs Safari",
  "Naivasha Lakeside Escape",
  "Hell's Gate Cycling Adventure",
  "Lake Naivasha & Crescent Island Safari",
  "Watamu Beach Retreat",
  "Watamu Marine Discovery",
  "Malindi & Watamu Coastal Escape",
  "Mount Kenya Highland Adventure",
  "Mount Kenya Sirimon Trek",
  "Mount Kenya Scenic Highlands",
  "Samburu Wildlife Discovery",
  "Samburu Cultural Safari",
  "Northern Kenya Photography Safari",
  "Tsavo Family Safari",
  "Tsavo Luxury Wilderness Escape",
  "Naivasha Romantic Getaway",
  "Watamu Honeymoon Paradise",
  "Mount Kenya Family Highlands",
  "Samburu Luxury Wilderness Experience",
];

// Declare repair for use by the surrounding module or function.
const repair = async () => {
  // Check the condition (!process.env.MONGODB_URI) and run the matching branch.
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing in .env");
  // Perform the side effect or state update expressed on the following line.
  await mongoose.connect(process.env.MONGODB_URI);

  // Perform the side effect or state update expressed on the following line.
  await runWithTenant({ role: "super_admin", bypass: true }, async () => {
    // Declare destinations for use by the surrounding module or function.
    const destinations = await Destination.find({
      slug: { $in: destinationSlugs },
    })
      .select("_id slug")
      .lean();

    // Declare destinationUpdates for use by the surrounding module or function.
    const destinationUpdates = await Promise.all(
      destinations.map((destination, index) =>
        Destination.updateOne(
          { _id: destination._id },
          {
            $set: {
              featuredImage: IMAGE_POOL[index % IMAGE_POOL.length],
              images: [{ url: IMAGE_POOL[index % IMAGE_POOL.length], publicId: "" }],
              active: true,
              status: "active",
              isDeleted: false,
            },
          }
        )
      )
    );

    // Match tours by their actual title instead of deriving a slug. This also
    // repairs duplicate-slug records such as `...-2`, which were previously
    // skipped by the slug-only lookup.
    // Declare tours for use by the surrounding module or function.
    const tours = await Tour.find({ title: { $in: tourTitles } })
      .select("_id title")
      .lean();

    // Declare imageByTitle for use by the surrounding module or function.
    const imageByTitle = new Map(
      tourTitles.map((title, index) => [
        title,
        {
          image: IMAGE_POOL[(index + 2) % IMAGE_POOL.length],
          galleryImage: IMAGE_POOL[(index + 3) % IMAGE_POOL.length],
        },
      ])
    );

    // Declare tourUpdates for use by the surrounding module or function.
    const tourUpdates = await Promise.all(
      tours.map((tour) => {
        // Declare media for use by the surrounding module or function.
        const media = imageByTitle.get(tour.title);
        // Check the condition (!media) and run the matching branch.
        if (!media) return { matchedCount: 0 };

        // Return the result of Tour.updateOne() to the caller.
        return Tour.updateOne(
          { _id: tour._id },
          {
            $set: {
              featuredImage: { url: media.image, publicId: "" },
              gallery: [
                { url: media.image, publicId: "" },
                { url: media.galleryImage, publicId: "" },
              ],
              published: true,
              available: true,
              isDeleted: false,
              status: "upcoming",
            },
          }
        );
      })
    );

    // Declare destinationMatched for use by the surrounding module or function.
    const destinationMatched = destinationUpdates.reduce(
      (sum, result) => sum + result.matchedCount,
      0
    );
    // Declare tourMatched for use by the surrounding module or function.
    const tourMatched = tourUpdates.reduce(
      (sum, result) => sum + result.matchedCount,
      0
    );

    // Perform the side effect or state update expressed on the following line.
    console.log(
      `Global Tours media repair complete: ${destinationMatched} destinations + ${tourMatched} tours updated.`
    );
    // Perform the side effect or state update expressed on the following line.
    console.log("Tour media is matched by title so duplicate slugs are repaired too.");
    // Perform the side effect or state update expressed on the following line.
    console.log("No unrelated records were deleted.");
  });
};

// Perform the side effect or state update expressed on the following line.
repair()
  .catch((error) => {
    // Perform the side effect or state update expressed on the following line.
    console.error("Global Tours media repair failed:", error.message);
    // Perform the side effect or state update expressed on the following line.
    process.exitCode = 1;
  })
  .finally(async () => {
    // Perform the side effect or state update expressed on the following line.
    await mongoose.connection.close().catch(() => {});
  });
