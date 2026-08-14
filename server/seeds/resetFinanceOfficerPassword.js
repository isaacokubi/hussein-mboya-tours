import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "../models/User.js";
import Role from "../models/Role.js";

dotenv.config();

const resetFinanceOfficerPassword = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing.");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    // debug removed

    const financeOfficer = await User.findOne({
      email: "finance@husseinmboyatours.com",
    });

    if (!financeOfficer) {
      throw new Error("Finance Officer not found.");
    }

    // RBAC role
    const financeRole = await Role.findOne({
      name: "finance",
    });

    if (!financeRole) {
      throw new Error("Finance role not found.");
    }

    /*
    |--------------------------------------------------------------------------
    | RESET PASSWORD
    |--------------------------------------------------------------------------
    */

    financeOfficer.password = "Finance@12345";

    /*
    |--------------------------------------------------------------------------
    | ROLE SETTINGS
    |--------------------------------------------------------------------------
    */

    // Application role
    financeOfficer.role = "manager";

    // RBAC role
    financeOfficer.roleId = financeRole._id;

    // Legacy compatibility
    financeOfficer.legacyRole = "finance";

    /*
    |--------------------------------------------------------------------------
    | ACCOUNT STATUS
    |--------------------------------------------------------------------------
    */

    financeOfficer.status = "active";
    financeOfficer.isVerified = true;

    /*
    |--------------------------------------------------------------------------
    | RESET SECURITY
    |--------------------------------------------------------------------------
    */

    financeOfficer.loginAttempts = 0;
    financeOfficer.lockUntil = null;

    await financeOfficer.save();

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

resetFinanceOfficerPassword();