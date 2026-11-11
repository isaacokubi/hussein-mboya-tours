/**
 * Purpose: category Seed database seed module. Main declarations: seed.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load dotenv so this module can use its exported dependencies.
import dotenv from "dotenv";
// Load ../models/TourCategory.js so this module can use its exported dependencies.
import TourCategory from "../models/TourCategory.js";

// Perform the side effect or state update expressed on the following line.
dotenv.config();

// Declare categories for use by the surrounding module or function.
const categories = [
  {
    name: "Wildlife Safari",
    slug: "wildlife-safari",
    description: "Experience Kenya's amazing wildlife and national parks.",
    icon: "Binoculars",
  },

  {
    name: "Beach Holidays",
    slug: "beach-holidays",
    description: "Relax on Kenya's beautiful beaches.",
    icon: "Beach",
  },

  {
    name: "Mountain Adventures",
    slug: "mountain-adventures",
    description: "Explore Kenya's mountains and hiking trails.",
    icon: "Mountain",
  },

  {
    name: "Group Tours",
    slug: "group-tours",
    description: "Enjoy unforgettable group travel experiences.",
    icon: "People",
  },
];

// Declare seed for use by the surrounding module or function.
const seed = async () => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    await mongoose.connect(process.env.MONGODB_URI);

    // Perform the side effect or state update expressed on the following line.
    await TourCategory.deleteMany();

    // Perform the side effect or state update expressed on the following line.
    await TourCategory.insertMany(categories);

    // debug removed

    // Perform the side effect or state update expressed on the following line.
    process.exit();
  } catch (error) {
    // debug removed

    // Perform the side effect or state update expressed on the following line.
    process.exit(1);
  }
};

// Perform the side effect or state update expressed on the following line.
seed();
