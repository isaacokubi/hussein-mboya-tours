import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "../models/User.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";

import crypto from "crypto";
dotenv.config();

const createTourGuide = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing in .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    // debug removed

    /*
    |--------------------------------------------------------------------------
    | GUIDE PERMISSIONS
    |--------------------------------------------------------------------------
    | These permissions match the guide routes.
    */

    const permissionNames = [
      "view_assigned_tours",
      "view_tour_guests",
      "update_tour_status",
      "submit_tour_report",
    ];

    const permissionIds = [];

    for (const name of permissionNames) {
      let permission = await Permission.findOne({ name });

      if (!permission) {
        permission = await Permission.create({
          name,
          label: name.replace(/_/g, " "),
          module: name.split(/[._]/)[0],
          category: "other",
        });

        // debug removed
      }

      permissionIds.push(permission._id);
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE / UPDATE GUIDE ROLE
    |--------------------------------------------------------------------------
    */

    let guideRole = await Role.findOne({
      name: "guide",
    });

    if (!guideRole) {
      guideRole = await Role.create({
        name: "guide",
        displayName: "Tour Guide",
        permissions: permissionIds,
      });

      // debug removed
    } else {
      guideRole.permissions = permissionIds;

      await guideRole.save();

      // debug removed
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE GUIDE USER
    |--------------------------------------------------------------------------
    */

    const email = "guide@husseinmboyatours.com";

    const existingGuide = await User.findOne({ email });

    if (existingGuide) {
      // debug removed

      return;
    }

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
    console.error("❌ TOUR GUIDE SEED ERROR:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close().catch(() => {});
    // debug removed
  }
};

createTourGuide();