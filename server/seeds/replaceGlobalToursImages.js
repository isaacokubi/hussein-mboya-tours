import mongoose from "mongoose";
import dotenv from "dotenv";
import Destination from "../models/Destination.js";
import Tour from "../models/Tour.js";
import Gallery from "../models/Gallery.js";
import { runWithTenant } from "../tenancy/context.js";

dotenv.config();

const image = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=85`;

// Fresh, stable Unsplash image set. No local placeholders are used.
const IMAGES = {
  safari: image("photo-1516426122078-c23e76319801"),
  elephant: image("photo-1557050543-4d5f4e07ef46"),
  lion: image("photo-1549366021-9f761d450615"),
  giraffe: image("photo-1547970810-dc1eac37d174"),
  zebra: image("photo-1504097051511-6a5b3b8e4b7c"),
  beach: image("photo-1507525428034-b723cf961d3e"),
  coast: image("photo-1510414842594-a61c69b5ae57"),
  ocean: image("photo-1500375592092-40eb2168fd21"),
  palm: image("photo-1473116763249-2faaef81ccda"),
  mountain: image("photo-1464822759023-fed622ff2c3b"),
  kenyaMountain: image("photo-1516026672322-bc52d61a55d5"),
  lake: image("photo-1501785888041-af3ef285b470"),
  lake2: image("photo-1516426122078-c23e76319801"),
  adventure: image("photo-1526772662000-3f88f10405ff"),
  travel: image("photo-1530789253388-582c481c54b0"),
  safari2: image("photo-1535338454770-8be927b5a00b"),
  safari3: image("photo-1547036967-23d11aacaee0"),
  safari4: image("photo-1534177616494-41f0b3d0d3b9"),
  coast2: image("photo-1548013146-72479768bada"),
  wildlife: image("photo-1518709268805-4e9042af9f23"),
};

const destinationMedia = {
  "samburu-national-reserve": [IMAGES.safari, IMAGES.giraffe],
  "mount-kenya": [IMAGES.mountain, IMAGES.kenyaMountain],
  "lake-naivasha": [IMAGES.lake, IMAGES.lake2],
  watamu: [IMAGES.beach, IMAGES.ocean],
  "tsavo-national-park": [IMAGES.elephant, IMAGES.wildlife],
  mombasa: [IMAGES.coast, IMAGES.palm],
};

const tourMedia = {
  "Malindi & Watamu Coastal Escape": [IMAGES.coast, IMAGES.beach],
  "Watamu Marine Discovery": [IMAGES.ocean, IMAGES.coast2],
  "Watamu Beach Retreat": [IMAGES.beach, IMAGES.palm],
  "Lake Naivasha & Crescent Island Safari": [IMAGES.lake, IMAGES.safari2],
  "Hell's Gate Cycling Adventure": [IMAGES.adventure, IMAGES.mountain],
  "Naivasha Lakeside Escape": [IMAGES.lake2, IMAGES.travel],
  "Tsavo East Wildlife Explorer": [IMAGES.elephant, IMAGES.safari3],
  "Tsavo West Rhino & Springs Safari": [IMAGES.wildlife, IMAGES.safari4],
  "Mount Kenya Highland Adventure": [IMAGES.mountain, IMAGES.kenyaMountain],
  "Mount Kenya Sirimon Trek": [IMAGES.kenyaMountain, IMAGES.adventure],
  "Mount Kenya Scenic Highlands": [IMAGES.mountain, IMAGES.travel],
  "Samburu Wildlife Discovery": [IMAGES.giraffe, IMAGES.safari],
  "Samburu Cultural Safari": [IMAGES.safari3, IMAGES.travel],
  "Northern Kenya Photography Safari": [IMAGES.safari4, IMAGES.giraffe],
  "Tsavo Family Safari": [IMAGES.elephant, IMAGES.safari],
  "Tsavo Luxury Wilderness Escape": [IMAGES.wildlife, IMAGES.safari2],
  "Naivasha Romantic Getaway": [IMAGES.lake, IMAGES.palm],
  "Watamu Honeymoon Paradise": [IMAGES.coast2, IMAGES.beach],
  "Mount Kenya Family Highlands": [IMAGES.mountain, IMAGES.kenyaMountain],
  "Samburu Luxury Wilderness Experience": [IMAGES.giraffe, IMAGES.wildlife],
};

const gallery = [
  ["Kenya Wildlife", IMAGES.elephant],
  ["Maasai Mara Safari", IMAGES.safari],
  ["Samburu Wilderness", IMAGES.giraffe],
  ["African Lion Safari", IMAGES.lion],
  ["Kenya Coast", IMAGES.coast],
  ["Watamu Beach", IMAGES.beach],
  ["Indian Ocean Escape", IMAGES.ocean],
  ["Mombasa Coast", IMAGES.palm],
  ["Mount Kenya", IMAGES.mountain],
  ["Kenya Highlands", IMAGES.kenyaMountain],
  ["Lake Naivasha", IMAGES.lake],
  ["Safari Adventure", IMAGES.adventure],
];

const run = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing in .env");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  await runWithTenant({ role: "super_admin", bypass: true }, async () => {
    let destinationsUpdated = 0;
    let toursUpdated = 0;

    for (const [slug, [featuredImage, secondImage]] of Object.entries(destinationMedia)) {
      const result = await Destination.updateOne(
        { slug },
        {
          $set: {
            featuredImage,
            images: [
              { url: featuredImage, publicId: "" },
              { url: secondImage, publicId: "" },
            ],
            active: true,
            status: "active",
            isDeleted: false,
          },
        }
      );
      destinationsUpdated += result.matchedCount;
    }

    for (const [title, [featuredImage, secondImage]] of Object.entries(tourMedia)) {
      const result = await Tour.updateMany(
        { title },
        {
          $set: {
            featuredImage: { url: featuredImage, publicId: "" },
            gallery: [
              { url: featuredImage, publicId: "" },
              { url: secondImage, publicId: "" },
            ],
            published: true,
            available: true,
            isDeleted: false,
            status: "upcoming",
          },
        }
      );
      toursUpdated += result.matchedCount;
    }

    // Remove only the old placeholder test gallery records, then replace them
    // with real gallery entries. Other gallery records are left untouched.
    await Gallery.deleteMany({ title: /^Gallery Test/i });

    await Gallery.deleteMany({ title: { $in: gallery.map(([title]) => title) } });
    await Gallery.insertMany(
      gallery.map(([title, url], index) => ({
        title,
        image: { url, publicId: "" },
        category: index % 3 === 0 ? "Safari" : index % 3 === 1 ? "Beach" : "Adventure",
        featured: true,
        active: true,
      }))
    );

    console.log(`Global Tours image seed complete: ${destinationsUpdated} destinations + ${toursUpdated} tours updated.`);
    console.log(`${gallery.length} real Safari Gallery images seeded.`);
    console.log("Placeholder Gallery Test records were removed; unrelated gallery records were preserved.");
  });
};

run()
  .catch((error) => {
    console.error("Global Tours image seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close().catch(() => {});
  });
