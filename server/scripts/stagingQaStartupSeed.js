import mongoose from "mongoose";
import Organization from "../models/Organization.js";
import User from "../models/User.js";
import Customer from "../models/Customer.js";
import Destination from "../models/Destination.js";
import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import { QA_DATABASE_NAME, runStagingQaSeedOnce, validateStagingQaEnvironment } from "./stagingQaSeedCore.js";

const models = { Organization, User, Customer, Destination, Tour, Booking, Payment };

/** Fixed-purpose opt-in hook; never accepts a script or operation from environment. */
export async function runStagingQaStartupSeed({
  environment = process.env,
  mongooseClient = mongoose,
  runOnce = runStagingQaSeedOnce,
} = {}) {
  const enabled = environment.STAGING_QA_SEED_ON_STARTUP;
  if (enabled !== "true") {
    if (enabled && enabled !== "false") {
      throw new Error("STAGING_QA_SEED_ON_STARTUP must be exactly true or false.");
    }
    return { enabled: false, seeded: false };
  }

  // The application uses NODE_ENV=production for both deployed environments;
  // DEPLOYMENT_ENV is the boundary that makes this staging-only.
  if (environment.NODE_ENV !== "production" || environment.DEPLOYMENT_ENV !== "staging") {
    throw new Error("Startup QA seed is available only on the production-mode staging deployment.");
  }
  if (environment.STAGING_DATABASE_NAME !== QA_DATABASE_NAME) {
    throw new Error("Startup QA seed requires STAGING_DATABASE_NAME=global_tours_test.");
  }
  validateStagingQaEnvironment(environment);

  const result = await runOnce({ environment, mongooseClient, models });
  console.log(result.alreadyComplete
    ? "Staging QA fixture seed already complete."
    : "Staging QA fixture seed completed and verified.");
  return { enabled: true, ...result };
}
