/**
 * Purpose: tour Guide Seed database seed module. Main declarations: createTourGuide.
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

// Declare createTourGuide for use by the surrounding module or function.
const createTourGuide = async () => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!process.env.MONGODB_URI) and run the matching branch.
    if (!process.env.MONGODB_URI) {
      // Stop the current operation by raising a new Error instance.
      throw new Error("MONGODB_URI is missing in .env");
    }

    // Perform the side effect or state update expressed on the following line.
    await mongoose.connect(process.env.MONGODB_URI);

    // debug removed

    /*
    |--------------------------------------------------------------------------
    | GUIDE PERMISSIONS
    |--------------------------------------------------------------------------
    | These permissions match the guide routes.
    */

    // Declare permissionNames for use by the surrounding module or function.
    const permissionNames = [
      "view_assigned_tours",
      "view_tour_guests",
      "update_tour_status",
      "submit_tour_report",
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

    /*
    |--------------------------------------------------------------------------
    | CREATE / UPDATE GUIDE ROLE
    |--------------------------------------------------------------------------
    */

    // Declare guideRole for use by the surrounding module or function.
    let guideRole = await Role.findOne({
      name: "guide",
    });

    // Check the condition (!guideRole) and run the matching branch.
    if (!guideRole) {
      // Perform the side effect or state update expressed on the following line.
      guideRole = await Role.create({
        name: "guide",
        displayName: "Tour Guide",
        permissions: permissionIds,
      });

      // debug removed
    } else {
      // Perform the side effect or state update expressed on the following line.
      guideRole.permissions = permissionIds;

      // Perform the side effect or state update expressed on the following line.
      await guideRole.save();

      // debug removed
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE GUIDE USER
    |--------------------------------------------------------------------------
    */

    // Declare email for use by the surrounding module or function.
    const email = "guide@husseinmboyatours.com";

    // Declare existingGuide for use by the surrounding module or function.
    const existingGuide = await User.findOne({ email });

    // Check the condition (existingGuide) and run the matching branch.
    if (existingGuide) {
      // debug removed

      // Return the result to the caller.
      return;
    }

    // Declare guide for use by the surrounding module or function.
    const guide = await User.create({
      name: "Safari Guide",

      email,

      // Password will be hashed automatically
      password: process.env.SEED_GUIDE_PASSWORD || crypto.randomBytes(18).toString("base64url"),

      phone: "",

      // Application role
      role: "guide",

      // RBAC Role
      roleId: guideRole._id,

      // Legacy compatibility
      legacyRole: "guide",

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
    // debug removed
    // debug removed
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("❌ TOUR GUIDE SEED ERROR:", error.message);
    // Perform the side effect or state update expressed on the following line.
    process.exitCode = 1;
  } finally {
    // Perform the side effect or state update expressed on the following line.
    await mongoose.connection.close().catch(() => {});
    // debug removed
  }
};

// Perform the side effect or state update expressed on the following line.
createTourGuide();
