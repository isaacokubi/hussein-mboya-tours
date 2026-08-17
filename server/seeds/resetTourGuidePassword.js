import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "../models/User.js";
import Role from "../models/Role.js";

import crypto from "crypto";
dotenv.config();

const resetTourGuidePassword = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing.");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    // debug removed

    const tourGuide = await User.findOne({
      email: "guide@husseinmboyatours.com",
    });

    if (!tourGuide) {
      throw new Error("Tour Guide not found.");
    }

    // Find RBAC role
    const guideRole =
      (await Role.findOne({ name: "tourguide" })) ||
      (await Role.findOne({ name: "guide" }));

    if (!guideRole) {
      throw new Error("Guide role not found.");
    }

    /*
    |--------------------------------------------------------------------------
    | RESET PASSWORD
    |--------------------------------------------------------------------------
    */

    tourGuide.password = process.env.SEED_GUIDE_PASSWORD || crypto.randomBytes(18).toString("base64url");

    /*
    |--------------------------------------------------------------------------
    | ROLE SETTINGS
    |--------------------------------------------------------------------------
    */

    // Application role
    tourGuide.role = "guide";

    // RBAC role
    tourGuide.roleId = guideRole._id;

    // Legacy compatibility
    tourGuide.legacyRole = guideRole.name;

    /*
    |--------------------------------------------------------------------------
    | ACCOUNT STATUS
    |--------------------------------------------------------------------------
    */

    tourGuide.status = "active";
    tourGuide.isVerified = true;

    /*
    |--------------------------------------------------------------------------
    | RESET SECURITY
    |--------------------------------------------------------------------------
    */

    tourGuide.loginAttempts = 0;
    tourGuide.lockUntil = null;

    await tourGuide.save();

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

resetTourGuidePassword();