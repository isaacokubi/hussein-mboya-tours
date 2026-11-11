/**
 * Purpose: staging Qa Startup Seed operational script. Main declarations: runStagingQaStartupSeed.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../models/Organization.js so this module can use its exported dependencies.
import Organization from "../models/Organization.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Customer.js so this module can use its exported dependencies.
import Customer from "../models/Customer.js";
// Load ../models/Destination.js so this module can use its exported dependencies.
import Destination from "../models/Destination.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Load ./stagingQaSeedCore.js so this module can use its exported dependencies.
import { QA_DATABASE_NAME, runStagingQaSeedOnce, validateStagingQaEnvironment } from "./stagingQaSeedCore.js";

// Declare models for use by the surrounding module or function.
const models = { Organization, User, Customer, Destination, Tour, Booking, Payment };

/** Fixed-purpose opt-in hook; never accepts a script or operation from environment. */
// Define runStagingQaStartupSeed; its parameters and body implement this operation.
export async function runStagingQaStartupSeed({
  environment = process.env,
  mongooseClient = mongoose,
  runOnce = runStagingQaSeedOnce,
} = {}) {
  // Declare enabled for use by the surrounding module or function.
  const enabled = environment.STAGING_QA_SEED_ON_STARTUP;
  // Check the condition (enabled !== "true") and run the matching branch.
  if (enabled !== "true") {
    // Check the condition (enabled && enabled !== "false") and run the matching branch.
    if (enabled && enabled !== "false") {
      // Stop the current operation by raising a new Error instance.
      throw new Error("STAGING_QA_SEED_ON_STARTUP must be exactly true or false.");
    }
    // Return the object assembled below to the caller.
    return { enabled: false, seeded: false };
  }

  // The application uses NODE_ENV=production for both deployed environments;
  // DEPLOYMENT_ENV is the boundary that makes this staging-only.
  // Check the condition (environment.NODE_ENV !== "production" || environment.DEPLOYMENT_ENV !=) and run the matching branch.
  if (environment.NODE_ENV !== "production" || environment.DEPLOYMENT_ENV !== "staging") {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Startup QA seed is available only on the production-mode staging deployment.");
  }
  // Check the condition (environment.STAGING_DATABASE_NAME !== QA_DATABASE_NAME) and run the matching branch.
  if (environment.STAGING_DATABASE_NAME !== QA_DATABASE_NAME) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Startup QA seed requires STAGING_DATABASE_NAME=global_tours_test.");
  }
  // Perform the side effect or state update expressed on the following line.
  validateStagingQaEnvironment(environment);

  // Declare result for use by the surrounding module or function.
  const result = await runOnce({ environment, mongooseClient, models });
  // Perform the side effect or state update expressed on the following line.
  console.log(result.alreadyComplete
    ? "Staging QA fixture seed already complete."
    : "Staging QA fixture seed completed and verified.");
  // Return the object assembled below to the caller.
  return { enabled: true, ...result };
}
