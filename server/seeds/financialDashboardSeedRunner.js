import * as firestore from "../config/firestore.js";
import dotenv from "dotenv";
import Organization from "../models/Organization.js";

dotenv.config();

const run = async () => {
  if (!process.env.FIREBASE_PROJECT_ID) throw new Error("FIREBASE_PROJECT_ID is missing.");
  await firestore.connectFirestore?.();
  const tenants = await Organization.find({ isDeleted: { $ne: true } }).select("_id name").sort({ createdAt: 1 }).lean();
  if (tenants.length !== 3) throw new Error(`SAFE STOP: expected exactly 3 active tenants, found ${tenants.length}. No data was changed.`);
  console.log(`Verified exactly ${tenants.length} active tenants. Master data will be preserved.`);
  await firestore.disconnect();
  await import("./financialDashboardSeed.js");
};

run().catch(async (error) => {
  console.error("Financial dashboard seed runner failed:", error.message);
  await firestore.connection.close().catch(() => {});
  process.exitCode = 1;
});
