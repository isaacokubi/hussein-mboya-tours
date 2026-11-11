/**
 * Purpose: reset Manager Password database seed module. Main declarations: resetManagerPassword.
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

// Declare resetManagerPassword for use by the surrounding module or function.
const resetManagerPassword = async () => {
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

    // Declare manager for use by the surrounding module or function.
    const manager = await User.findOne({
      email: "manager@husseinmboyatours.com",
    });

    // Check the condition (!manager) and run the matching branch.
    if (!manager) {
      // Stop the current operation by raising a new Error instance.
      throw new Error(
        "Tour Manager not found. Run seeds/tourManagerSeed.js first."
      );
    }

    // Declare managerRole for use by the surrounding module or function.
    const managerRole = await Role.findOne({
      name: "tour_manager",
    });

    // Check the condition (!managerRole) and run the matching branch.
    if (!managerRole) {
      // Stop the current operation by raising a new Error instance.
      throw new Error(
        "tour_manager role not found. Run seeds/tourManagerSeed.js first."
      );
    }

    // Perform the side effect or state update expressed on the following line.
    manager.password = process.env.SEED_MANAGER_PASSWORD || crypto.randomBytes(18).toString("base64url");

    // Perform the side effect or state update expressed on the following line.
    manager.role = "tour_manager";
    // Perform the side effect or state update expressed on the following line.
    manager.roleId = managerRole._id;
    // Perform the side effect or state update expressed on the following line.
    manager.legacyRole = "tour_manager";

    // Perform the side effect or state update expressed on the following line.
    manager.status = "active";
    // Perform the side effect or state update expressed on the following line.
    manager.isVerified = true;

    // Perform the side effect or state update expressed on the following line.
    manager.loginAttempts = 0;
    // Perform the side effect or state update expressed on the following line.
    manager.lockUntil = null;

    // Perform the side effect or state update expressed on the following line.
    await manager.save();

    // debug removed
    // debug removed
    // debug removed
    // debug removed
    // debug removed
    // debug removed
    // debug removed);
    // debug removed

  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("Password reset failed:", error);
    // Perform the side effect or state update expressed on the following line.
    process.exitCode = 1;
  } finally {
    // Perform the side effect or state update expressed on the following line.
    await mongoose.connection.close().catch(() => {});
    // debug removed
  }
};

// Perform the side effect or state update expressed on the following line.
resetManagerPassword();
