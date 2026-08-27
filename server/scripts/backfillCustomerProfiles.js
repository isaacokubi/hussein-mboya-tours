import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import { ensureCustomerProfile } from "../services/customerProfileService.js";

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await User.find({ role: "customer", tenantId: { $ne: null } }).select("_id name email phone role tenantId status loyaltyPoints").lean();
  let created = 0;
  for (const user of users) {
    const profile = await ensureCustomerProfile(user);
    if (profile?.createdAt?.getTime() === profile?.updatedAt?.getTime()) created += 1;
  }
  console.log(`Customer profile backfill complete. Accounts checked: ${users.length}; profiles created/ensured: ${created}.`);
};

run().catch((error) => {
  console.error("Customer profile backfill failed:", error);
  process.exitCode = 1;
}).finally(async () => {
  await mongoose.disconnect();
});
