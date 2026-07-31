import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "../models/User.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";

dotenv.config();

const createTourGuide = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing in .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB Connected");

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
        });

        console.log(`✅ Created permission: ${name}`);
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
        permissions: permissionIds,
      });

      console.log("✅ Guide role created");
    } else {
      guideRole.permissions = permissionIds;

      await guideRole.save();

      console.log("✅ Guide role updated");
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE GUIDE USER
    |--------------------------------------------------------------------------
    */

    const email = "guide@husseinmboyatours.com";

    const existingGuide = await User.findOne({ email });

    if (existingGuide) {
      console.log("⚠️ Tour Guide already exists.");

      return;
    }

    const guide = await User.create({
      name: "Safari Guide",

      email,

      // Password will be hashed automatically
      password: "Guide@12345",

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

    console.log("\n======================================");
    console.log("✅ TOUR GUIDE CREATED");
    console.log("======================================");
    console.log("Name:      ", guide.name);
    console.log("Email:     ", guide.email);
    console.log("Password:  ", "Guide@12345");
    console.log("Role:      ", guide.role);
    console.log("RBAC Role: ", guideRole.name);
    console.log("======================================");
  } catch (error) {
    console.error("❌ TOUR GUIDE SEED ERROR:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close().catch(() => {});
    console.log("🔌 MongoDB connection closed");
  }
};

createTourGuide();