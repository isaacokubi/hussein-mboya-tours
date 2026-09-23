import dotenv from "dotenv";
import * as firestore from "../config/firestore.js";

import seedRoles from "./roleSeed.js";
import seedPermissions from "./permissionSeed.js";
import seedDestinations from "./seedDestinations.js";

dotenv.config();

const runSeeds = async () => {
  try {
    if (!process.env.FIREBASE_PROJECT_ID) {
      throw new Error("FIREBASE_PROJECT_ID is missing.");
    }

    // debug removed

    await firestore.connectFirestore();

    // debug removed

    await seedPermissions();
    await seedRoles();
    await seedDestinations();

    // debug removed
  } catch (error) {
    console.error("Seeder failed:", error);
    process.exitCode = 1;
  } finally {
    await firestore.connection.close().catch(() => {});
    // debug removed
  }
};

runSeeds();
