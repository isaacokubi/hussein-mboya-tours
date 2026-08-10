import mongoose from "mongoose";
import dotenv from "dotenv";
import TourCategory from "../models/TourCategory.js";

dotenv.config();

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

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    await TourCategory.deleteMany();

    await TourCategory.insertMany(categories);

    console.log("Categories seeded successfully");

    process.exit();
  } catch (error) {
    console.log(error);

    process.exit(1);
  }
};

seed();
