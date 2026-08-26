import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import Agent from "../models/Agent.js";
import Organization from "../models/Organization.js";
import { runWithTenant } from "../tenancy/context.js";

const TARGET_COUNT = Math.max(10, Number(process.env.TEST_SEED_COUNT || 10));
const PASSWORD = process.env.TEST_SEED_PASSWORD || "TestPassword123!";

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error("MONGODB_URI is missing.");

  await mongoose.connect(mongoUri);

  try {
    const organizations = await runWithTenant(
      { role: "super_admin", bypass: true },
      () => Organization.find({}).sort({ createdAt: 1 }).limit(1).lean()
    );

    const tenantId = organizations[0]?._id;
    if (!tenantId) throw new Error("No organization exists; comprehensive seed cannot continue.");

    await runWithTenant({ tenantId, role: "admin" }, async () => {
      for (let i = 0; i < TARGET_COUNT; i += 1) {
        const email = `agent${i + 1}@coherenttours.test`;
        let user = await User.findOne({ email }).select("+password");

        if (!user) {
          user = await User.create({
            name: `Test Agent ${String(i + 1).padStart(2, "0")}`,
            email,
            phone: `0700${String(i + 1).padStart(6, "0")}`,
            password: PASSWORD,
            role: "agent",
            legacyRole: "agent",
            status: "active",
            isVerified: true,
          });
        }

        const existingAgent = await Agent.findOne({ user: user._id });
        if (!existingAgent) {
          await Agent.create({
            user: user._id,
            companyName: `Coherent Tours Agency ${String(i + 1).padStart(2, "0")}`,
            phone: user.phone,
            email: user.email,
            location: ["Nairobi", "Mombasa", "Arusha", "Kampala", "Kigali"][i % 5],
            website: `https://example.com/agencies/${i + 1}`,
            description: `Synthetic agent profile ${i + 1} for comprehensive testing.`,
            commissionRate: 10 + (i % 6),
            totalCommission: 1500 + i * 500,
            pendingCommission: 500 + i * 100,
            paidCommission: 1000 + i * 400,
            walletBalance: 2500 + i * 750,
            totalSales: 15000 + i * 3000,
            totalBookings: 10 + i,
            successfulBookings: 8 + i,
            cancelledBookings: i % 3,
            isApproved: true,
            status: "active",
            licenseNumber: `AG-LIC-${String(i + 1).padStart(4, "0")}`,
            taxNumber: `TAX-${String(i + 1).padStart(6, "0")}`,
          });
        }
      }
    });

    const [agentCount, userCount] = await runWithTenant(
      { tenantId, role: "admin" },
      async () => Promise.all([Agent.countDocuments({}), User.countDocuments({ role: "agent" })])
    );

    console.log(JSON.stringify({
      success: true,
      tenantId: String(tenantId),
      agentCount,
      agentUserCount: userCount,
      targetCount: TARGET_COUNT,
      message: "Tenant-safe agent prerequisites created; the comprehensive seed can now complete without cross-tenant writes.",
    }, null, 2));
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(`Test data bootstrap failed: ${error.message}`);
  process.exitCode = 1;
});
