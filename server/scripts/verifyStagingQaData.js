/**
 * Purpose: verify Staging Qa Data operational script. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../models/Organization.js so this module can use its exported dependencies.
import Organization from "../models/Organization.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Customer.js so this module can use its exported dependencies.
import Customer from "../models/Customer.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Load ./stagingQaSeedCore.js so this module can use its exported dependencies.
import { validateStagingQaEnvironment, verifyStagingQaData } from "./stagingQaSeedCore.js";

// Declare connected for use by the surrounding module or function.
let connected = false;
// Run this operation with a dedicated error-handling path for failures.
try {
  // Perform the side effect or state update expressed on the following line.
  validateStagingQaEnvironment(process.env);
  // Perform the side effect or state update expressed on the following line.
  await mongoose.connect(process.env.MONGODB_URI);
  // Perform the side effect or state update expressed on the following line.
  connected = true;
  // Declare result for use by the surrounding module or function.
  const result = await verifyStagingQaData({ environment: process.env, dbName: mongoose.connection.db?.databaseName, models: { Organization, User, Customer, Tour, Booking, Payment } });
  // Perform the side effect or state update expressed on the following line.
  console.log(JSON.stringify(result));
} catch {
  // Perform the side effect or state update expressed on the following line.
  console.error("Staging QA verification failed. Check staging environment configuration and QA records.");
  // Perform the side effect or state update expressed on the following line.
  process.exitCode = 1;
} finally {
  // Check the condition (connected) and run the matching branch.
  if (connected) await mongoose.disconnect().catch(() => {});
}
