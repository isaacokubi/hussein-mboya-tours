import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "../models/User.js";
import Role from "../models/Role.js";

import crypto from "crypto";
dotenv.config();

const resetCustomerPassword = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing.");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    // debug removed

    const customer = await User.findOne({
      email: "customer@husseinmboyatours.com",
    });

    if (!customer) {
      throw new Error("Customer not found.");
    }

    const customerRole = await Role.findOne({
      name: "customer",
    });

    if (!customerRole) {
      throw new Error("Customer role not found.");
    }

    /*
    |--------------------------------------------------------------------------
    | RESET PASSWORD
    |--------------------------------------------------------------------------
    */

    customer.password = process.env.SEED_CUSTOMER_PASSWORD || crypto.randomBytes(18).toString("base64url");

    /*
    |--------------------------------------------------------------------------
    | ROLE SETTINGS
    |--------------------------------------------------------------------------
    */

    customer.role = "customer";
    customer.roleId = customerRole._id;
    customer.legacyRole = "customer";

    /*
    |--------------------------------------------------------------------------
    | ACCOUNT STATUS
    |--------------------------------------------------------------------------
    */

    customer.status = "active";
    customer.isVerified = true;

    /*
    |--------------------------------------------------------------------------
    | RESET SECURITY
    |--------------------------------------------------------------------------
    */

    customer.loginAttempts = 0;
    customer.lockUntil = null;

    await customer.save();

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

resetCustomerPassword();