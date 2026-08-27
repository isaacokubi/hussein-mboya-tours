import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import { ensureCustomerProfile } from "../services/customerProfileService.js";
import { runWithTenant } from "../tenancy/context.js";

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  // This is a platform maintenance script, so it must inspect customer
  // accounts across every tenant. The tenant plugin normally rejects queries
  // without a tenant context; run the backfill inside the platform bypass
  // instead of weakening tenant isolation globally.
  await runWithTenant({ role: "super_admin", bypass: true }, async () => {
    const users = await User.find({
      role: "customer",
      tenantId: { $ne: null },
    })
      .select("_id name email phone role tenantId status loyaltyPoints")
      .lean();

    let created = 0;
    let existing = 0;

    for (const user of users) {
      const profile = await ensureCustomerProfile(user);
      if (!profile) continue;

      const profileCreatedAt = profile.createdAt?.getTime?.();
      const profileUpdatedAt = profile.updatedAt?.getTime?.();
      if (profileCreatedAt && profileUpdatedAt && profileCreatedAt === profileUpdatedAt) {
        created += 1;
      } else {
        existing += 1;
      }
    }

    console.log(
      `Customer profile backfill complete. Accounts checked: ${users.length}; ` +
      `profiles created: ${created}; profiles already present: ${existing}.`
    );
  });
};

run()
  .catch((error) => {
    console.error("Customer profile backfill failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
