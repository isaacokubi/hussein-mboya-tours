import mongoose from "mongoose";
import Organization from "../models/Organization.js";
import User from "../models/User.js";
import Customer from "../models/Customer.js";
import Destination from "../models/Destination.js";
import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";
import { seedStagingQaData, validateStagingQaEnvironment } from "./stagingQaSeedCore.js";

let connected = false;
try {
  validateStagingQaEnvironment(process.env);
  await mongoose.connect(process.env.MONGODB_URI);
  connected = true;
  const result = await seedStagingQaData({
    environment: process.env,
    dbName: mongoose.connection.db?.databaseName,
    models: { Organization, User, Customer, Destination, Tour, Booking },
  });
  console.log(JSON.stringify({ database: result.dbName, tenant: result.tenant, customer: result.customer ? "created" : "found", tour: result.tour ? "created" : "found", booking: result.booking ? "created" : "found" }));
} catch {
  console.error("Staging QA seed failed closed. Check staging environment configuration and record prerequisites.");
  process.exitCode = 1;
} finally {
  if (connected) await mongoose.disconnect().catch(() => {});
}
