import mongoose from "mongoose";
import dotenv from "dotenv";
import Organization from "../models/Organization.js";

dotenv.config();

const run = async () => {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing.");
  await mongoose.connect(process.env.MONGODB_URI);
  const tenants = await Organization.find({ isDeleted: { $ne: true } }).select("_id name").sort({ createdAt: 1 }).lean();
  if (tenants.length !== 3) throw new Error(`SAFE STOP: expected exactly 3 active tenants, found ${tenants.length}. No data was changed.`);
  console.log(`Verified exactly ${tenants.length} active tenants. Master data will be preserved.`);
  await mongoose.disconnect();
  await import("./financialDashboardSeed.js");
};

run().catch(async (error) => {
  console.error("Financial dashboard seed runner failed:", error.message);
  await mongoose.connection.close().catch(() => {});
  process.exitCode = 1;
});
