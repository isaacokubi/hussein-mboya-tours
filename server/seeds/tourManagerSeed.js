import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "../models/User.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";

dotenv.config();

const createTourManager = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing in .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB Connected");

    /*
    |--------------------------------------------------------------------------
    | TOUR MANAGER PERMISSIONS
    |--------------------------------------------------------------------------
    | These permissions can be expanded as your system grows.
    */

    const permissionNames = [
      "manage_tours",
      "manage_itineraries",
      "manage_destinations",
      "manage_bookings",
      "view_bookings",
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
    | CREATE / UPDATE TOUR MANAGER ROLE
    |--------------------------------------------------------------------------
    */

    let tourManagerRole = await Role.findOne({
      name: "tourmanager",
    });

    if (!tourManagerRole) {
      tourManagerRole = await Role.create({
        name: "tourmanager",
        permissions: permissionIds,
      });

      console.log("✅ Tour Manager role created");
    } else {
      tourManagerRole.permissions = permissionIds;

      await tourManagerRole.save();

      console.log("✅ Tour Manager role updated");
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE TOUR MANAGER USER
    |--------------------------------------------------------------------------
    */

    const email = "manager@husseinmboyatours.com";

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("⚠️ Tour Manager already exists.");

      return;
    }

    const manager = await User.create({
      name: "Tour Manager",

      email,

      // Password will be hashed automatically by User model
      password: "Manager@12345",

      phone: "",

      // Application role
      role: "tourmanager",

      // RBAC role reference
      roleId: tourManagerRole._id,

      // Legacy compatibility
      legacyRole: "tourmanager",

      status: "active",

      isVerified: true,
    });

    console.log("\n======================================");
    console.log("✅ TOUR MANAGER CREATED");
    console.log("======================================");
    console.log("Name:      ", manager.name);
    console.log("Email:     ", manager.email);
    console.log("Password:  ", "Manager@12345");
    console.log("Role:      ", manager.role);
    console.log("RBAC Role: ", tourManagerRole.name);
    console.log("======================================");
  } catch (error) {
    console.error("❌ TOUR MANAGER SEED ERROR:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close().catch(() => {});
    console.log("🔌 MongoDB connection closed");
  }
};

createTourManager();