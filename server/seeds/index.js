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

    // debug removed

    await mongoose.connect(process.env.MONGODB_URI);

    // debug removed

    await seedPermissions();
    await seedRoles();
    await seedDestinations();

    // debug removed
  } catch (error) {
    console.error("Seeder failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close().catch(() => {});
    // debug removed
  }
};

runSeeds();