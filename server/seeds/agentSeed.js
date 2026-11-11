/**
 * Purpose: agent Seed database seed module. Main declarations: seedAgents.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load dotenv so this module can use its exported dependencies.
import dotenv from "dotenv";
// Load bcryptjs so this module can use its exported dependencies.
import bcrypt from "bcryptjs";
// Load crypto so this module can use its exported dependencies.
import crypto from "crypto";

// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Agent.js so this module can use its exported dependencies.
import Agent from "../models/Agent.js";
// Load ../models/Organization.js so this module can use its exported dependencies.
import Organization from "../models/Organization.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant } from "../tenancy/context.js";

// Perform the side effect or state update expressed on the following line.
dotenv.config({ path: "./server/.env" });
// Perform the side effect or state update expressed on the following line.
dotenv.config();

// Declare agents for use by the surrounding module or function.
const agents = [
  { name: "John Kamau", email: "john.kamau@coherenttours.com", phone: "+254711111111", location: "Nairobi" },
  { name: "Mary Wanjiku", email: "mary.wanjiku@coherenttours.com", phone: "+254722222222", location: "Mombasa" },
  { name: "David Otieno", email: "david.otieno@coherenttours.com", phone: "+254733333333", location: "Kisumu" },
];

// Declare seedAgents for use by the surrounding module or function.
const seedAgents = async () => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = String(process.env.TENANT_ID || "").trim();
    // Declare tenantSlug for use by the surrounding module or function.
    const tenantSlug = String(process.env.TENANT_SLUG || "").trim().toLowerCase();
    // Declare tenantName for use by the surrounding module or function.
    const tenantName = String(process.env.TENANT_NAME || "").trim();
    // Check the condition (!tenantId && !tenantSlug && !tenantName) and run the matching branch.
    if (!tenantId && !tenantSlug && !tenantName) throw new Error("Set TENANT_ID, TENANT_SLUG, or TENANT_NAME before running the agent seed.");
    // Declare mongoUri for use by the surrounding module or function.
    const mongoUri = String(process.env.MONGODB_URI || "").trim();
    // Check the condition (!mongoUri) and run the matching branch.
    if (!mongoUri) throw new Error("MONGODB_URI is missing in server/.env");

    // Perform the side effect or state update expressed on the following line.
    await mongoose.connect(mongoUri);

    // Declare organization for use by the surrounding module or function.
    let organization;
    // Check the condition (tenantId) and run the matching branch.
    if (tenantId) organization = await Organization.findById(tenantId).lean();
    else if (tenantSlug) organization = await Organization.findOne({ slug: tenantSlug }).lean();
    else organization = await Organization.findOne({ name: tenantName }).lean();
    // Check the condition (!organization) and run the matching branch.
    if (!organization) throw new Error("Tenant organization was not found.");

    // Declare password for use by the surrounding module or function.
    const password = await bcrypt.hash(process.env.SEED_AGENT_PASSWORD || crypto.randomBytes(18).toString("base64url"), 12);

    // Perform the side effect or state update expressed on the following line.
    await runWithTenant({ tenantId: organization._id, tenant: organization }, async () => {
      // Repeat the enclosed work for each required iteration.
      for (const data of agents) {
        // Declare user for use by the surrounding module or function.
        const user = await User.findOneAndUpdate(
          { email: data.email },
          {
            $set: { name: data.name, phone: data.phone, role: "agent", legacyRole: "agent", status: "active" },
            // tenantPlugin injects tenantId into $setOnInsert and validates the
            // tenant context, so tenantId must not also appear in $set here.
            $setOnInsert: { email: data.email, password },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        );

        // Perform the side effect or state update expressed on the following line.
        await Agent.findOneAndUpdate(
          { user: user._id },
          {
            $set: { companyName: organization.name, phone: data.phone, email: data.email, location: data.location, isApproved: true, status: "active" },
            // tenantPlugin injects tenantId into $setOnInsert and enforces the
            // current tenant for this upsert.
            $setOnInsert: { user: user._id, commissionRate: 10, totalCommission: 0, pendingCommission: 0, paidCommission: 0, walletBalance: 0, totalSales: 0, totalBookings: 0, successfulBookings: 0, cancelledBookings: 0 },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        );
      }
    });

    // Perform the side effect or state update expressed on the following line.
    console.log(`Agents synced for ${organization.name}`);
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("Agent seed failed:", error);
    // Perform the side effect or state update expressed on the following line.
    process.exitCode = 1;
  } finally {
    // Perform the side effect or state update expressed on the following line.
    await mongoose.connection.close().catch(() => {});
  }
};

// Perform the side effect or state update expressed on the following line.
seedAgents();
