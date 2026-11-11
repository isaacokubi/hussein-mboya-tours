/**
 * Purpose: index database seed module. Main declarations: runSeeds.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import dotenv from "dotenv";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";

// Load ./roleSeed.js so this module can use its exported dependencies.
import seedRoles from "./roleSeed.js";
// Load ./permissionSeed.js so this module can use its exported dependencies.
import seedPermissions from "./permissionSeed.js";
// Load ./seedDestinations.js so this module can use its exported dependencies.
import seedDestinations from "./seedDestinations.js";

// Perform the side effect or state update expressed on the following line.
dotenv.config();

// Declare runSeeds for use by the surrounding module or function.
const runSeeds = async () => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!process.env.MONGODB_URI) and run the matching branch.
    if (!process.env.MONGODB_URI) {
      // Stop the current operation by raising a new Error instance.
      throw new Error("MONGODB_URI is missing.");
    }

    // debug removed

    // Perform the side effect or state update expressed on the following line.
    await mongoose.connect(process.env.MONGODB_URI);

    // debug removed

    // Perform the side effect or state update expressed on the following line.
    await seedPermissions();
    // Perform the side effect or state update expressed on the following line.
    await seedRoles();
    // Perform the side effect or state update expressed on the following line.
    await seedDestinations();

    // debug removed
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("Seeder failed:", error);
    // Perform the side effect or state update expressed on the following line.
    process.exitCode = 1;
  } finally {
    // Perform the side effect or state update expressed on the following line.
    await mongoose.connection.close().catch(() => {});
    // debug removed
  }
};

// Perform the side effect or state update expressed on the following line.
runSeeds();
