/**
 * Purpose: bootstrap Staging Super Admin operational script. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import "../config/env.js";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../config/mongoConfig.js so this module can use its exported dependencies.
import {
  STAGING_SUPERADMIN_DATABASE_NAME,
  validateStagingSuperAdminBootstrapTarget,
} from "../config/mongoConfig.js";
// Load ../services/onboardingService.js so this module can use its exported dependencies.
import { bootstrapStagingSuperAdmin } from "../services/onboardingService.js";

// Declare environment for use by the surrounding module or function.
const environment = process.env;
// Declare connected for use by the surrounding module or function.
let connected = false;

// Run this operation with a dedicated error-handling path for failures.
try {
  // Recheck the fixed, command-specific target immediately before connecting.
  // Perform the side effect or state update expressed on the following line.
  validateStagingSuperAdminBootstrapTarget({
    nodeEnv: environment.NODE_ENV,
    deploymentEnv: environment.DEPLOYMENT_ENV,
    stagingDatabaseName: environment.STAGING_DATABASE_NAME,
    uri: environment.MONGODB_URI,
  });

  // Repeat the enclosed work for each required iteration.
  for (const key of [
    "BOOTSTRAP_STAGING_SUPERADMIN_NAME",
    "BOOTSTRAP_STAGING_SUPERADMIN_EMAIL",
    "BOOTSTRAP_STAGING_SUPERADMIN_PHONE",
    "BOOTSTRAP_STAGING_SUPERADMIN_PASSWORD",
  ]) {
    // Check the condition (!environment[key]) and run the matching branch.
    if (!environment[key]) throw new Error(`Missing required environment variable: ${key}`);
  }

  // Perform the side effect or state update expressed on the following line.
  await mongoose.connect(environment.MONGODB_URI);
  // Perform the side effect or state update expressed on the following line.
  connected = true;
  // Check the condition (mongoose.connection.db?.databaseName !== STAGING_SUPERADMIN_DATABASE_N) and run the matching branch.
  if (mongoose.connection.db?.databaseName !== STAGING_SUPERADMIN_DATABASE_NAME) {
    // Perform the side effect or state update expressed on the following line.
    await mongoose.disconnect();
    // Perform the side effect or state update expressed on the following line.
    connected = false;
    // Stop the current operation by raising a new Error instance.
    throw new Error("Connected database identity could not be verified as the approved staging database.");
  }

  // Declare result for use by the surrounding module or function.
  const result = await bootstrapStagingSuperAdmin({
    name: environment.BOOTSTRAP_STAGING_SUPERADMIN_NAME,
    email: environment.BOOTSTRAP_STAGING_SUPERADMIN_EMAIL,
    phone: environment.BOOTSTRAP_STAGING_SUPERADMIN_PHONE,
    password: environment.BOOTSTRAP_STAGING_SUPERADMIN_PASSWORD,
  });

  // Check the condition (result.created) and run the matching branch.
  if (result.created) {
    // Perform the side effect or state update expressed on the following line.
    console.log("Staging platform SuperAdmin created and verified with no tenant association.");
  } else {
    // Perform the side effect or state update expressed on the following line.
    console.log("A staging platform SuperAdmin already exists; no account was created.");
  }
} catch {
  // Driver and validation errors can include connection strings or submitted fields.
  // Perform the side effect or state update expressed on the following line.
  console.error("STAGING SUPERADMIN BOOTSTRAP FAILED. Review the command configuration without sharing secret values.");
  // Perform the side effect or state update expressed on the following line.
  process.exitCode = 1;
} finally {
  // Check the condition (connected) and run the matching branch.
  if (connected) await mongoose.disconnect().catch(() => {});
}
