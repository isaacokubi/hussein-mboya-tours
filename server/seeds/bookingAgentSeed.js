/**
 * Purpose: booking Agent Seed database seed module. Main declarations: createBookingAgent.
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

// Declare createBookingAgent for use by the surrounding module or function.
const createBookingAgent = async () => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    await mongoose.connect(process.env.MONGODB_URI);

    // debug removed

    // -------------------------------------------------
    // AGENT PERMISSIONS
    // -------------------------------------------------

    // Declare permissionNames for use by the surrounding module or function.
    const permissionNames = [
      "create_bookings",
      "manage_customer_bookings",
      "view_tours",
      "view_destinations",
      "view_commissions",
      "view_wallet",
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
    // AGENT ROLE
    // -------------------------------------------------

    // Declare agentRole for use by the surrounding module or function.
    let agentRole = await Role.findOne({
      name: "agent",
    });

    // Check the condition (!agentRole) and run the matching branch.
    if (!agentRole) {
      // Perform the side effect or state update expressed on the following line.
      agentRole = await Role.create({
        name: "agent",
        displayName: "Travel Agent",
        permissions: permissionIds,
      });

      // debug removed
    } else {
      // Perform the side effect or state update expressed on the following line.
      agentRole.permissions = permissionIds;

      // Perform the side effect or state update expressed on the following line.
      await agentRole.save();

      // debug removed
    }

    // -------------------------------------------------
    // AGENT USER
    // -------------------------------------------------

    // Declare email for use by the surrounding module or function.
    const email = "agent@husseinmboyatours.com";

    // Declare existingAgent for use by the surrounding module or function.
    const existingAgent = await User.findOne({ email });

    // Check the condition (existingAgent) and run the matching branch.
    if (existingAgent) {
      // debug removed

      // Perform the side effect or state update expressed on the following line.
      await mongoose.connection.close();
      // Return the result to the caller.
      return;
    }

    // Declare agent for use by the surrounding module or function.
    const agent = await User.create({
      name: "Booking Agent",

      email,

      password: process.env.SEED_AGENT_PASSWORD || crypto.randomBytes(18).toString("base64url"),

      phone: "",

      role: "agent",

      roleId: agentRole._id,

      legacyRole: "agent",

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
    console.error("❌ BOOKING AGENT SEED ERROR:", error);

    // Perform the side effect or state update expressed on the following line.
    await mongoose.connection.close().catch(() => {});
    // Perform the side effect or state update expressed on the following line.
    process.exit(1);
  }
};

// Perform the side effect or state update expressed on the following line.
createBookingAgent();
