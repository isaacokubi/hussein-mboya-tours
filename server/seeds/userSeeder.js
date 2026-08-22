import dotenv from "dotenv";
import mongoose from "mongoose";

import User from "../models/User.js";
import Role from "../models/Role.js";

import crypto from "crypto";
dotenv.config();

const seedUsers = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing in .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    // debug removed

    /*
    |--------------------------------------------------------------------------
    | FIND ROLES
    |--------------------------------------------------------------------------
    */

    const adminRole = await Role.findOne({
      name: "superadmin",
    });

    const managerRole = await Role.findOne({
      name: "tourmanager",
    });

    if (!adminRole) {
      throw new Error("Superadmin role not found. Run role seeder first.");
    }

    if (!managerRole) {
      throw new Error("Tour Manager role not found. Run role seeder first.");
    }

    /*
    |--------------------------------------------------------------------------
    | REMOVE EXISTING USERS
    |--------------------------------------------------------------------------
    */

    await User.deleteMany({
      email: {
        $in: [
          "admin@husseinmboyatours.com",
          "manager@husseinmboyatours.com",
        ],
      },
    });

    // debug removed

    /*
    |--------------------------------------------------------------------------
    | CREATE SUPER ADMIN
    |--------------------------------------------------------------------------
    */

    const admin = await User.create({
      name: "System Admin",

      email: "admin@husseinmboyatours.com",

      phone: "0712345678",

      password: process.env.SEED_ADMIN_PASSWORD || crypto.randomBytes(18).toString("base64url"),

      role: adminRole._id,

      legacyRole: "superadmin",

      isActive: true,

      isVerified: true,
    });

    /*
    |--------------------------------------------------------------------------
    | CREATE TOUR MANAGER
    |--------------------------------------------------------------------------
    */

    const manager = await User.create({
      name: "Tour Manager",

      email: "manager@husseinmboyatours.com",

      phone: "0712345679",

      password: process.env.SEED_MANAGER_PASSWORD || crypto.randomBytes(18).toString("base64url"),

      role: managerRole._id,

      legacyRole: "tourmanager",

      isActive: true,

      isVerified: true,
    });

    // debug removed

    // debug removed

    console.log({
      name: admin.name,
      email: admin.email,
      password: process.env.SEED_ADMIN_PASSWORD || crypto.randomBytes(18).toString("base64url"),
      role: "superadmin",
    });

    // debug removed

    // debug removed

    console.log({
      name: manager.name,
      email: manager.email,
      password: process.env.SEED_MANAGER_PASSWORD || crypto.randomBytes(18).toString("base64url"),
      role: "tourmanager",
    });

    // debug removed

    await mongoose.connection.close();

    // debug removed

    process.exit(0);
  } catch (error) {
    console.error("❌ USER SEED ERROR:", error.message);

    await mongoose.connection.close().catch(() => {});

    process.exit(1);
  }
};

seedUsers();