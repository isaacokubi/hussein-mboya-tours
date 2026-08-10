// scripts/seedDestinations.js

import mongoose from "mongoose";
import dotenv from "dotenv";

import Destination from "../models/Destination.js";

dotenv.config();

if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined in the environment.");
  process.exit(1);
}

const destinations = [
  {
    name: "Maasai Mara",
    slug: "maasai-mara",
    country: "Kenya",
    location: "Narok County",
    description:
      "Experience the Great Migration, breathtaking wildlife, and unforgettable safari adventures in one of Africa's most famous reserves.",
    images: ["/destinations/maasai-mara.jpg"],
    attractions: [
      "Great Migration",
      "Big Five Wildlife",
      "Maasai Culture",
    ],
    activities: [
      "Game Drives",
      "Photography",
      "Hot Air Balloon Safari",
    ],
    featured: true,
  },

  {
    name: "Amboseli National Park",
    slug: "amboseli-national-park",
    country: "Kenya",
    location: "Kajiado County",
    description:
      "Discover large elephant herds and enjoy stunning views of Mount Kilimanjaro while exploring the wilderness.",
    images: ["/destinations/amboseli.jpg"],
    attractions: [
      "Mount Kilimanjaro Views",
      "Elephant Herds",
      "Wildlife Photography",
    ],
    activities: [
      "Safari Drives",
      "Bird Watching",
      "Nature Walks",
    ],
    featured: true,
  },

  {
    name: "Diani Beach",
    slug: "diani-beach",
    country: "Kenya",
    location: "Kwale County",
    description:
      "Relax on Kenya's most beautiful white sandy beaches with crystal clear waters and amazing coastal experiences.",
    images: ["/destinations/diani.jpg"],
    attractions: [
      "White Sandy Beaches",
      "Indian Ocean",
      "Marine Life",
    ],
    activities: [
      "Swimming",
      "Snorkeling",
      "Diving",
    ],
    featured: true,
  },
];

const seedDestinations = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB connected");

    await Destination.deleteMany({});

    console.log("🗑 Existing destinations removed");

    await Destination.insertMany(destinations);

    console.log(`✅ ${destinations.length} destinations seeded successfully`);
  } catch (error) {
    console.error("❌ Destination seeding failed:");
    console.error(error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close().catch(() => {});
    console.log("🔌 MongoDB connection closed");
  }
};

seedDestinations();