import mongoose from "mongoose";
import Organization from "../models/Organization.js";
import User from "../models/User.js";
import Customer from "../models/Customer.js";
import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import { validateStagingQaEnvironment, verifyStagingQaData } from "./stagingQaSeedCore.js";

let connected = false;
try {
  validateStagingQaEnvironment(process.env);
  await mongoose.connect(process.env.MONGODB_URI);
  connected = true;
  const result = await verifyStagingQaData({ environment: process.env, dbName: mongoose.connection.db?.databaseName, models: { Organization, User, Customer, Tour, Booking, Payment } });
  console.log(JSON.stringify(result));
} catch {
  console.error("Staging QA verification failed. Check staging environment configuration and QA records.");
  process.exitCode = 1;
} finally {
  if (connected) await mongoose.disconnect().catch(() => {});
}
