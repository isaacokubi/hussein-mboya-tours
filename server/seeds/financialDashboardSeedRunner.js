import mongoose from "mongoose";
import dotenv from "dotenv";
import Organization from "../models/Organization.js";
import JournalEntry from "../models/JournalEntry.js";

dotenv.config();

const run = async () => {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing.");
  await mongoose.connect(process.env.MONGODB_URI);
  const tenants = await Organization.find({ isDeleted: { $ne: true } }).select("_id name").sort({ createdAt: 1 }).lean();
  if (tenants.length !== 3) throw new Error(`SAFE STOP: expected exactly 3 active tenants, found ${tenants.length}. No data was changed.`);
  await JournalEntry.deleteMany({ tenantId: { $in: tenants.map((tenant) => tenant._id) } });
  console.log(`Cleared existing journal entries for ${tenants.length} tenants. Master data was not modified.`);
  await mongoose.disconnect();
  await import("./financialDashboardSeed.js");
};

run().catch(async (error) => {
  console.error("Financial dashboard seed runner failed:", error.message);
  await mongoose.connection.close().catch(() => {});
  process.exitCode = 1;
});
