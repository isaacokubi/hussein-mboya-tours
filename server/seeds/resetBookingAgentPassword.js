/**
 * Purpose: reset Booking Agent Password database seed module. Main declarations: resetBookingAgentPassword.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load dotenv so this module can use its exported dependencies.
import dotenv from "dotenv";

// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Role.js so this module can use its exported dependencies.
import Role from "../models/Role.js";

// Load crypto so this module can use its exported dependencies.
import crypto from "crypto";
// Perform the side effect or state update expressed on the following line.
dotenv.config();

// Declare resetBookingAgentPassword for use by the surrounding module or function.
const resetBookingAgentPassword = async () => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!process.env.MONGODB_URI) and run the matching branch.
    if (!process.env.MONGODB_URI) {
      // Stop the current operation by raising a new Error instance.
      throw new Error("MONGODB_URI is missing.");
    }

    // Perform the side effect or state update expressed on the following line.
    await mongoose.connect(process.env.MONGODB_URI);

    // debug removed

    // Declare agent for use by the surrounding module or function.
    const agent = await User.findOne({
      email: "agent@husseinmboyatours.com",
    });

    // Check the condition (!agent) and run the matching branch.
    if (!agent) {
      // Stop the current operation by raising a new Error instance.
      throw new Error("Booking Agent not found.");
    }

    // Find the RBAC role
    // Declare role for use by the surrounding module or function.
    const role =
      (await Role.findOne({ name: "bookingagent" })) ||
      (await Role.findOne({ name: "agent" }));

    // Check the condition (!role) and run the matching branch.
    if (!role) {
      // Stop the current operation by raising a new Error instance.
      throw new Error("Agent role not found.");
    }

    // Reset password
    // Perform the side effect or state update expressed on the following line.
    agent.password = process.env.SEED_AGENT_PASSWORD || crypto.randomBytes(18).toString("base64url");

    // Application role
    // Perform the side effect or state update expressed on the following line.
    agent.role = "agent";

    // RBAC role
    // Perform the side effect or state update expressed on the following line.
    agent.roleId = role._id;

    // Legacy compatibility
    // Perform the side effect or state update expressed on the following line.
    agent.legacyRole = role.name;

    // Account status
    // Perform the side effect or state update expressed on the following line.
    agent.status = "active";
    // Perform the side effect or state update expressed on the following line.
    agent.isVerified = true;

    // Security reset
    // Perform the side effect or state update expressed on the following line.
    agent.loginAttempts = 0;
    // Perform the side effect or state update expressed on the following line.
    agent.lockUntil = null;

    // Perform the side effect or state update expressed on the following line.
    await agent.save();

    // debug removed
    // debug removed
    // debug removed
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("❌ Password reset failed:", error.message);
    // Perform the side effect or state update expressed on the following line.
    process.exitCode = 1;
  } finally {
    // Perform the side effect or state update expressed on the following line.
    await mongoose.connection.close().catch(() => {});
    // debug removed
  }
};

// Perform the side effect or state update expressed on the following line.
resetBookingAgentPassword();
