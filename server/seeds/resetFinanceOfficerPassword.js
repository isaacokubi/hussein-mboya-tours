/**
 * Purpose: reset Finance Officer Password database seed module. Main declarations: resetFinanceOfficerPassword.
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

// Declare resetFinanceOfficerPassword for use by the surrounding module or function.
const resetFinanceOfficerPassword = async () => {
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

    // Declare financeOfficer for use by the surrounding module or function.
    const financeOfficer = await User.findOne({
      email: "finance@husseinmboyatours.com",
    });

    // Check the condition (!financeOfficer) and run the matching branch.
    if (!financeOfficer) {
      // Stop the current operation by raising a new Error instance.
      throw new Error("Finance Officer not found.");
    }

    // RBAC role
    // Declare financeRole for use by the surrounding module or function.
    const financeRole = await Role.findOne({
      name: "finance",
    });

    // Check the condition (!financeRole) and run the matching branch.
    if (!financeRole) {
      // Stop the current operation by raising a new Error instance.
      throw new Error("Finance role not found.");
    }

    /*
    |--------------------------------------------------------------------------
    | RESET PASSWORD
    |--------------------------------------------------------------------------
    */

    // Perform the side effect or state update expressed on the following line.
    financeOfficer.password = process.env.SEED_FINANCE_PASSWORD || crypto.randomBytes(18).toString("base64url");

    /*
    |--------------------------------------------------------------------------
    | ROLE SETTINGS
    |--------------------------------------------------------------------------
    */

    // Application role
    // Perform the side effect or state update expressed on the following line.
    financeOfficer.role = "manager";

    // RBAC role
    // Perform the side effect or state update expressed on the following line.
    financeOfficer.roleId = financeRole._id;

    // Legacy compatibility
    // Perform the side effect or state update expressed on the following line.
    financeOfficer.legacyRole = "finance";

    /*
    |--------------------------------------------------------------------------
    | ACCOUNT STATUS
    |--------------------------------------------------------------------------
    */

    // Perform the side effect or state update expressed on the following line.
    financeOfficer.status = "active";
    // Perform the side effect or state update expressed on the following line.
    financeOfficer.isVerified = true;

    /*
    |--------------------------------------------------------------------------
    | RESET SECURITY
    |--------------------------------------------------------------------------
    */

    // Perform the side effect or state update expressed on the following line.
    financeOfficer.loginAttempts = 0;
    // Perform the side effect or state update expressed on the following line.
    financeOfficer.lockUntil = null;

    // Perform the side effect or state update expressed on the following line.
    await financeOfficer.save();

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
resetFinanceOfficerPassword();
