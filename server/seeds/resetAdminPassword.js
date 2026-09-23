import * as firestore from "../config/firestore.js";
import dotenv from "dotenv";

import User from "../models/User.js";
import Role from "../models/Role.js";

import crypto from "crypto";
dotenv.config();

const resetPassword = async () => {
  try {
    if (!process.env.FIREBASE_PROJECT_ID) {
      throw new Error("FIREBASE_PROJECT_ID is missing.");
    }

    await firestore.connectFirestore();

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
    await firestore.connection.close().catch(() => {});
    // debug removed
  }
};

resetPassword();
