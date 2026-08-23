import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "../models/User.js";
import Role from "../models/Role.js";

import crypto from "crypto";
dotenv.config();

const resetPassword = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing.");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    // debug removed

    const user = await User.findOne({
      email: "admin@husseinmboyatours.com",
    });

    if (!user) {
      throw new Error("Admin user not found.");
    }

    const adminRole = await Role.findOne({
      name: "admin",
    });

    if (!adminRole) {
      throw new Error("Admin role not found.");
    }

    user.password = process.env.SEED_ADMIN_PASSWORD || crypto.randomBytes(18).toString("base64url");

    user.role = "admin";
    user.roleId = adminRole._id;
    user.legacyRole = "admin";

    user.isVerified = true;

    user.loginAttempts = 0;
    user.lockUntil = null;

    await user.save();

    // debug removed
  } catch (error) {
    console.error("❌ Reset failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close().catch(() => {});
    // debug removed
  }
};

resetPassword();
