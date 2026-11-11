/**
 * Purpose: customer Seed database seed module. Main declarations: createCustomer.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load dotenv so this module can use its exported dependencies.
import dotenv from "dotenv";

// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Role.js so this module can use its exported dependencies.
import Role from "../models/Role.js";
// Load ../models/Permission.js so this module can use its exported dependencies.
import Permission from "../models/Permission.js";

// Load crypto so this module can use its exported dependencies.
import crypto from "crypto";
// Perform the side effect or state update expressed on the following line.
dotenv.config();

// Declare createCustomer for use by the surrounding module or function.
const createCustomer = async () => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    await mongoose.connect(process.env.MONGODB_URI);

    // debug removed

    // -------------------------------------------------
    // CUSTOMER PERMISSIONS
    // -------------------------------------------------

    // Declare permissionNames for use by the surrounding module or function.
    const permissionNames = [
      "view_tours",
      "view_destinations",
      "create_bookings",
      "manage_own_bookings",
      "submit_reviews",
    ];

    // Declare permissionIds for use by the surrounding module or function.
    const permissionIds = [];

    // Repeat the enclosed work for each required iteration.
    for (const name of permissionNames) {
      // Declare permission for use by the surrounding module or function.
      let permission = await Permission.findOne({ name });

      // Check the condition (!permission) and run the matching branch.
      if (!permission) {
        // Perform the side effect or state update expressed on the following line.
        permission = await Permission.create({
          name,
          label: name.replace(/_/g, " "),
          module: name.split(/[._]/)[0],
          category: "other",
        });

        // debug removed
      }

      // Perform the side effect or state update expressed on the following line.
      permissionIds.push(permission._id);
    }

    // -------------------------------------------------
    // CUSTOMER ROLE
    // -------------------------------------------------

    // Declare customerRole for use by the surrounding module or function.
    let customerRole = await Role.findOne({
      name: "customer",
    });

    // Check the condition (!customerRole) and run the matching branch.
    if (!customerRole) {
      // Perform the side effect or state update expressed on the following line.
      customerRole = await Role.create({
        name: "customer",
        displayName: "Customer",
        permissions: permissionIds,
      });

      // debug removed
    } else {
      // Perform the side effect or state update expressed on the following line.
      customerRole.permissions = permissionIds;

      // Perform the side effect or state update expressed on the following line.
      await customerRole.save();

      // debug removed
    }

    // -------------------------------------------------
    // CUSTOMER USER
    // -------------------------------------------------

    // Declare email for use by the surrounding module or function.
    const email = "customer@husseinmboyatours.com";

    // Declare existingCustomer for use by the surrounding module or function.
    const existingCustomer = await User.findOne({ email });

    // Check the condition (existingCustomer) and run the matching branch.
    if (existingCustomer) {
      // debug removed

      // Perform the side effect or state update expressed on the following line.
      await mongoose.connection.close();
      // Return the result to the caller.
      return;
    }

    // Declare customer for use by the surrounding module or function.
    const customer = await User.create({
      name: "John Customer",

      email,

      password: process.env.SEED_CUSTOMER_PASSWORD || crypto.randomBytes(18).toString("base64url"),

      phone: "",

      role: "customer",

      roleId: customerRole._id,

      legacyRole: "customer",

      status: "active",

      isVerified: true,
    });

    // debug removed
    // debug removed
    // debug removed
    // debug removed
    // debug removed
    // debug removed
    // debug removed

    // Perform the side effect or state update expressed on the following line.
    await mongoose.connection.close();
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("❌ CUSTOMER SEED ERROR:", error);

    // Perform the side effect or state update expressed on the following line.
    await mongoose.connection.close().catch(() => {});
    // Perform the side effect or state update expressed on the following line.
    process.exit(1);
  }
};

// Perform the side effect or state update expressed on the following line.
createCustomer();
