import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "../models/User.js";
import Role from "../models/Role.js";

dotenv.config();

const resetBookingAgentPassword = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing.");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    // debug removed

    const agent = await User.findOne({
      email: "agent@husseinmboyatours.com",
    });

    if (!agent) {
      throw new Error("Booking Agent not found.");
    }

    // Find the RBAC role
    const role =
      (await Role.findOne({ name: "bookingagent" })) ||
      (await Role.findOne({ name: "agent" }));

    if (!role) {
      throw new Error("Agent role not found.");
    }

    // Reset password
    agent.password = "Agent@12345";

    // Application role
    agent.role = "agent";

    // RBAC role
    agent.roleId = role._id;

    // Legacy compatibility
    agent.legacyRole = role.name;

    // Account status
    agent.status = "active";
    agent.isVerified = true;

    // Security reset
    agent.loginAttempts = 0;
    agent.lockUntil = null;

    await agent.save();

    // debug removed
    // debug removed
    // debug removed
  } catch (error) {
    console.error("❌ Password reset failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close().catch(() => {});
    // debug removed
  }
};

resetBookingAgentPassword();