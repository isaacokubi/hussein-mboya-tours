import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import User from "../models/User.js";
import Agent from "../models/Agent.js";
import Organization from "../models/Organization.js";
import { runWithTenant } from "../tenancy/context.js";

dotenv.config({ path: "./server/.env" });
dotenv.config();

const agents = [
  { name: "John Kamau", email: "john.kamau@coherenttours.com", phone: "+254711111111", location: "Nairobi" },
  { name: "Mary Wanjiku", email: "mary.wanjiku@coherenttours.com", phone: "+254722222222", location: "Mombasa" },
  { name: "David Otieno", email: "david.otieno@coherenttours.com", phone: "+254733333333", location: "Kisumu" },
];

const seedAgents = async () => {
  try {
    const tenantId = String(process.env.TENANT_ID || "").trim();
    const tenantSlug = String(process.env.TENANT_SLUG || "").trim().toLowerCase();
    const tenantName = String(process.env.TENANT_NAME || "").trim();
    if (!tenantId && !tenantSlug && !tenantName) throw new Error("Set TENANT_ID, TENANT_SLUG, or TENANT_NAME before running the agent seed.");
    const mongoUri = String(process.env.MONGODB_URI || "").trim();
    if (!mongoUri) throw new Error("MONGODB_URI is missing in server/.env");

    await mongoose.connect(mongoUri);

    let organization;
    if (tenantId) organization = await Organization.findById(tenantId).lean();
    else if (tenantSlug) organization = await Organization.findOne({ slug: tenantSlug }).lean();
    else organization = await Organization.findOne({ name: tenantName }).lean();
    if (!organization) throw new Error("Tenant organization was not found.");

    const password = await bcrypt.hash(process.env.SEED_AGENT_PASSWORD || crypto.randomBytes(18).toString("base64url"), 12);

    await runWithTenant({ tenantId: organization._id, tenant: organization }, async () => {
      for (const data of agents) {
        const user = await User.findOneAndUpdate(
          { email: data.email },
          {
            $set: { name: data.name, phone: data.phone, role: "agent", legacyRole: "agent", status: "active", tenantId: organization._id },
            $setOnInsert: { email: data.email, password },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        );

        await Agent.findOneAndUpdate(
          { user: user._id },
          {
            $set: { companyName: organization.name, phone: data.phone, email: data.email, location: data.location, isApproved: true, status: "active", tenantId: organization._id },
            $setOnInsert: { user: user._id, commissionRate: 10, totalCommission: 0, pendingCommission: 0, paidCommission: 0, walletBalance: 0, totalSales: 0, totalBookings: 0, successfulBookings: 0, cancelledBookings: 0 },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        );
      }
    });

    console.log(`Agents synced for ${organization.name}`);
  } catch (error) {
    console.error("Agent seed failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close().catch(() => {});
  }
};

seedAgents();
