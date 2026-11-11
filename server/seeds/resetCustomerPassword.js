/**
 * Purpose: reset Customer Password database seed module. Main declarations: resetCustomerPassword.
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

// Declare resetCustomerPassword for use by the surrounding module or function.
const resetCustomerPassword = async () => {
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

    // Declare customer for use by the surrounding module or function.
    const customer = await User.findOne({
      email: "customer@husseinmboyatours.com",
    });

    // Check the condition (!customer) and run the matching branch.
    if (!customer) {
      // Stop the current operation by raising a new Error instance.
      throw new Error("Customer not found.");
    }

    // Declare customerRole for use by the surrounding module or function.
    const customerRole = await Role.findOne({
      name: "customer",
    });

    // Check the condition (!customerRole) and run the matching branch.
    if (!customerRole) {
      // Stop the current operation by raising a new Error instance.
      throw new Error("Customer role not found.");
    }

    /*
    |--------------------------------------------------------------------------
    | RESET PASSWORD
    |--------------------------------------------------------------------------
    */

    // Perform the side effect or state update expressed on the following line.
    customer.password = process.env.SEED_CUSTOMER_PASSWORD || crypto.randomBytes(18).toString("base64url");

    /*
    |--------------------------------------------------------------------------
    | ROLE SETTINGS
    |--------------------------------------------------------------------------
    */

    // Perform the side effect or state update expressed on the following line.
    customer.role = "customer";
    // Perform the side effect or state update expressed on the following line.
    customer.roleId = customerRole._id;
    // Perform the side effect or state update expressed on the following line.
    customer.legacyRole = "customer";

    /*
    |--------------------------------------------------------------------------
    | ACCOUNT STATUS
    |--------------------------------------------------------------------------
    */

    // Perform the side effect or state update expressed on the following line.
    customer.status = "active";
    // Perform the side effect or state update expressed on the following line.
    customer.isVerified = true;

    /*
    |--------------------------------------------------------------------------
    | RESET SECURITY
    |--------------------------------------------------------------------------
    */

    // Perform the side effect or state update expressed on the following line.
    customer.loginAttempts = 0;
    // Perform the side effect or state update expressed on the following line.
    customer.lockUntil = null;

    // Perform the side effect or state update expressed on the following line.
    await customer.save();

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
resetCustomerPassword();
