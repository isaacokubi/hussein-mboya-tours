/**
 * Purpose: reset Tour Guide Password database seed module. Main declarations: resetTourGuidePassword.
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

// Declare resetTourGuidePassword for use by the surrounding module or function.
const resetTourGuidePassword = async () => {
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

    // Declare tourGuide for use by the surrounding module or function.
    const tourGuide = await User.findOne({
      email: "guide@husseinmboyatours.com",
    });

    // Check the condition (!tourGuide) and run the matching branch.
    if (!tourGuide) {
      // Stop the current operation by raising a new Error instance.
      throw new Error("Tour Guide not found.");
    }

    // Find RBAC role
    // Declare guideRole for use by the surrounding module or function.
    const guideRole =
      (await Role.findOne({ name: "guide" })) ||
      (await Role.findOne({ name: "guide" }));

    // Check the condition (!guideRole) and run the matching branch.
    if (!guideRole) {
      // Stop the current operation by raising a new Error instance.
      throw new Error("Guide role not found.");
    }

    /*
    |--------------------------------------------------------------------------
    | RESET PASSWORD
    |--------------------------------------------------------------------------
    */

    // Perform the side effect or state update expressed on the following line.
    tourGuide.password = process.env.SEED_GUIDE_PASSWORD || crypto.randomBytes(18).toString("base64url");

    /*
    |--------------------------------------------------------------------------
    | ROLE SETTINGS
    |--------------------------------------------------------------------------
    */

    // Application role
    // Perform the side effect or state update expressed on the following line.
    tourGuide.role = "guide";

    // RBAC role
    // Perform the side effect or state update expressed on the following line.
    tourGuide.roleId = guideRole._id;

    // Legacy compatibility
    // Perform the side effect or state update expressed on the following line.
    tourGuide.legacyRole = guideRole.name;

    /*
    |--------------------------------------------------------------------------
    | ACCOUNT STATUS
    |--------------------------------------------------------------------------
    */

    // Perform the side effect or state update expressed on the following line.
    tourGuide.status = "active";
    // Perform the side effect or state update expressed on the following line.
    tourGuide.isVerified = true;

    /*
    |--------------------------------------------------------------------------
    | RESET SECURITY
    |--------------------------------------------------------------------------
    */

    // Perform the side effect or state update expressed on the following line.
    tourGuide.loginAttempts = 0;
    // Perform the side effect or state update expressed on the following line.
    tourGuide.lockUntil = null;

    // Perform the side effect or state update expressed on the following line.
    await tourGuide.save();

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
resetTourGuidePassword();
