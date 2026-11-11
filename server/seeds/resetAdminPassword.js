/**
 * Purpose: reset Admin Password database seed module. Main declarations: resetPassword.
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

// Declare resetPassword for use by the surrounding module or function.
const resetPassword = async () => {
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

    // Declare user for use by the surrounding module or function.
    const user = await User.findOne({
      email: "admin@husseinmboyatours.com",
    });

    // Check the condition (!user) and run the matching branch.
    if (!user) {
      // Stop the current operation by raising a new Error instance.
      throw new Error("Admin user not found.");
    }

    // Declare adminRole for use by the surrounding module or function.
    const adminRole = await Role.findOne({
      name: "admin",
    });

    // Check the condition (!adminRole) and run the matching branch.
    if (!adminRole) {
      // Stop the current operation by raising a new Error instance.
      throw new Error("Admin role not found.");
    }

    // Perform the side effect or state update expressed on the following line.
    user.password = process.env.SEED_ADMIN_PASSWORD || crypto.randomBytes(18).toString("base64url");

    // Perform the side effect or state update expressed on the following line.
    user.role = "admin";
    // Perform the side effect or state update expressed on the following line.
    user.roleId = adminRole._id;
    // Perform the side effect or state update expressed on the following line.
    user.legacyRole = "admin";

    // Perform the side effect or state update expressed on the following line.
    user.isVerified = true;

    // Perform the side effect or state update expressed on the following line.
    user.loginAttempts = 0;
    // Perform the side effect or state update expressed on the following line.
    user.lockUntil = null;

    // Perform the side effect or state update expressed on the following line.
    await user.save();

    // debug removed
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("❌ Reset failed:", error.message);
    // Perform the side effect or state update expressed on the following line.
    process.exitCode = 1;
  } finally {
    // Perform the side effect or state update expressed on the following line.
    await mongoose.connection.close().catch(() => {});
    // debug removed
  }
};

// Perform the side effect or state update expressed on the following line.
resetPassword();
