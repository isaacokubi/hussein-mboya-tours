import dotenv from "dotenv";
import mongoose from "mongoose";

import seedRoles from "./roleSeed.js";
import seedPermissions from "./permissionSeed.js";
import seedDestinations from "./seedDestinations.js";

dotenv.config();

const runSeeds = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing.");
    }

    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Connected");

    await seedPermissions();
    await seedRoles();
    await seedDestinations();

    console.log("✅ Database seeding completed");
  } catch (error) {
    console.error("Seeder failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close().catch(() => {});
    console.log("MongoDB connection closed");
  }
};

runSeeds();