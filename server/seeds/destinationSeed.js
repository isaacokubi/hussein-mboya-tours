/**
 * Purpose: destination Seed database seed module. Main declarations: seedDestinations.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// scripts/seedDestinations.js

// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load dotenv so this module can use its exported dependencies.
import dotenv from "dotenv";

// Load ../models/Destination.js so this module can use its exported dependencies.
import Destination from "../models/Destination.js";

// Perform the side effect or state update expressed on the following line.
dotenv.config();

// Check the condition (!process.env.MONGODB_URI) and run the matching branch.
if (!process.env.MONGODB_URI) {
  // Perform the side effect or state update expressed on the following line.
  console.error("❌ MONGODB_URI is not defined in the environment.");
  // Perform the side effect or state update expressed on the following line.
  process.exit(1);
}

// Declare destinations for use by the surrounding module or function.
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

// Declare seedDestinations for use by the surrounding module or function.
const seedDestinations = async () => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    await mongoose.connect(process.env.MONGODB_URI);

    // debug removed

    // Perform the side effect or state update expressed on the following line.
    await Destination.deleteMany({});

    // debug removed

    // Perform the side effect or state update expressed on the following line.
    await Destination.insertMany(destinations);

    // debug removed
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("❌ Destination seeding failed:");
    // Perform the side effect or state update expressed on the following line.
    console.error(error);
    // Perform the side effect or state update expressed on the following line.
    process.exitCode = 1;
  } finally {
    // Perform the side effect or state update expressed on the following line.
    await mongoose.connection.close().catch(() => {});
    // debug removed
  }
};

// Perform the side effect or state update expressed on the following line.
seedDestinations();
