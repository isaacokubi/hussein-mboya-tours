import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "../models/User.js";
import Role from "../models/Role.js";

dotenv.config();

const resetManagerPassword = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing.");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB Connected");

    const manager = await User.findOne({
      email: "manager@husseinmboyatours.com",
    });

    if (!manager) {
      throw new Error("Tour Manager not found.");
    }

    // Find RBAC role
    const managerRole =
      (await Role.findOne({ name: "tourmanager" })) ||
      (await Role.findOne({ name: "manager" }));

    if (!managerRole) {
      throw new Error("Tour Manager role not found.");
    }

    /*
    |--------------------------------------------------------------------------
    | RESET PASSWORD
    |--------------------------------------------------------------------------
    */

    manager.password = "Manager@12345";

    /*
    |--------------------------------------------------------------------------
    | ROLE SETTINGS
    |--------------------------------------------------------------------------
    */

    // Application role
    manager.role = "manager";

    // RBAC role
    manager.roleId = managerRole._id;

    // Legacy compatibility
    manager.legacyRole = managerRole.name;

    /*
    |--------------------------------------------------------------------------
    | ACCOUNT STATUS
    |--------------------------------------------------------------------------
    */

    manager.status = "active";
    manager.isVerified = true;

    /*
    |--------------------------------------------------------------------------
    | RESET SECURITY
    |--------------------------------------------------------------------------
    */

    manager.loginAttempts = 0;
    manager.lockUntil = null;

    await manager.save();

    console.log("✅ Tour Manager password reset successfully");
    console.log("Email: manager@husseinmboyatours.com");
    console.log("Password: Manager@12345");
  } catch (error) {
    console.error("❌ Password reset failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close().catch(() => {});
    console.log("🔌 MongoDB connection closed");
  }
};

resetManagerPassword();