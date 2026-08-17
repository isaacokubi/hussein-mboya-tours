import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "../models/User.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";

import crypto from "crypto";
dotenv.config();

const createCustomer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // debug removed

    // -------------------------------------------------
    // CUSTOMER PERMISSIONS
    // -------------------------------------------------

    const permissionNames = [
      "view_tours",
      "view_destinations",
      "create_bookings",
      "manage_own_bookings",
      "submit_reviews",
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

    // -------------------------------------------------
    // CUSTOMER ROLE
    // -------------------------------------------------

    let customerRole = await Role.findOne({
      name: "customer",
    });

    if (!customerRole) {
      customerRole = await Role.create({
        name: "customer",
        displayName: "Customer",
        permissions: permissionIds,
      });

      // debug removed
    } else {
      customerRole.permissions = permissionIds;

      await customerRole.save();

      // debug removed
    }

    // -------------------------------------------------
    // CUSTOMER USER
    // -------------------------------------------------

    const email = "customer@husseinmboyatours.com";

    const existingCustomer = await User.findOne({ email });

    if (existingCustomer) {
      // debug removed

      await mongoose.connection.close();
      return;
    }

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

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ CUSTOMER SEED ERROR:", error);

    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
};

createCustomer();