import mongoose from "mongoose";
import dotenv from "dotenv";
import Destination from "../models/Destination.js";
import Tour from "../models/Tour.js";
import { runWithTenant } from "../tenancy/context.js";

dotenv.config();

const IMAGE_POOL = [
  "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1501785888041-af3ef285d3e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
];

const destinationSlugs = [
  "tsavo-national-park",
  "lake-naivasha",
  "watamu",
  "mount-kenya",
  "samburu-national-reserve",
];

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

const repair = async () => {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing in .env");
  await mongoose.connect(process.env.MONGODB_URI);

  await runWithTenant({ role: "super_admin", bypass: true }, async () => {
    const destinations = await Destination.find({
      slug: { $in: destinationSlugs },
    })
      .select("_id slug")
      .lean();

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
    const tours = await Tour.find({ title: { $in: tourTitles } })
      .select("_id title")
      .lean();

    const imageByTitle = new Map(
      tourTitles.map((title, index) => [
        title,
        {
          image: IMAGE_POOL[(index + 2) % IMAGE_POOL.length],
          galleryImage: IMAGE_POOL[(index + 3) % IMAGE_POOL.length],
        },
      ])
    );

    const tourUpdates = await Promise.all(
      tours.map((tour) => {
        const media = imageByTitle.get(tour.title);
        if (!media) return { matchedCount: 0 };

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

    const destinationMatched = destinationUpdates.reduce(
      (sum, result) => sum + result.matchedCount,
      0
    );
    const tourMatched = tourUpdates.reduce(
      (sum, result) => sum + result.matchedCount,
      0
    );

    console.log(
      `Global Tours media repair complete: ${destinationMatched} destinations + ${tourMatched} tours updated.`
    );
    console.log("Tour media is matched by title so duplicate slugs are repaired too.");
    console.log("No unrelated records were deleted.");
  });
};

repair()
  .catch((error) => {
    console.error("Global Tours media repair failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close().catch(() => {});
  });
