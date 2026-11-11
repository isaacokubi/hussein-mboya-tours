/**
 * Purpose: tour Manager Seed database seed module. Main declarations: createTourManager.
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

// Declare createTourManager for use by the surrounding module or function.
const createTourManager = async () => {
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
    | TOUR MANAGER PERMISSIONS
    |--------------------------------------------------------------------------
    */

    // Declare permissionDefinitions for use by the surrounding module or function.
    const permissionDefinitions = [
      {
        name: "manage_tours",
        label: "Manage Tours",
        module: "tours",
        path: "/manager/tours",
      },
      {
        name: "manage_itineraries",
        label: "Manage Itineraries",
        module: "itineraries",
        path: "/manager/itineraries",
      },
      {
        name: "manage_destinations",
        label: "Manage Destinations",
        module: "destinations",
        path: "/manager/destinations",
      },
      {
        name: "manage_bookings",
        label: "Manage Bookings",
        module: "bookings",
        path: "/manager/bookings",
      },
      {
        name: "view_bookings",
        label: "View Bookings",
        module: "bookings",
        path: "/manager/bookings",
      },
      {
        name: "manage_customers",
        label: "Manage Customers",
        module: "customers",
        path: "/manager/customers",
      },
      {
        name: "manage_guides",
        label: "Manage Guides",
        module: "guides",
        path: "/manager/guides",
      },
      {
        name: "manage_vehicles",
        label: "Manage Vehicles",
        module: "vehicles",
        path: "/manager/vehicles",
      },
      {
        name: "view_analytics",
        label: "View Analytics",
        module: "analytics",
        path: "/manager/analytics",
      },
    ];

    // Declare permissionIds for use by the surrounding module or function.
    const permissionIds = [];

    // Repeat the enclosed work for each required iteration.
    for (const data of permissionDefinitions) {
      // Declare permission for use by the surrounding module or function.
      let permission = await Permission.findOne({
        name: data.name,
      });

      // Check the condition (!permission) and run the matching branch.
      if (!permission) {
        // Perform the side effect or state update expressed on the following line.
        permission = await Permission.create({
          ...data,
          enabled: true,
        });

        // debug removed
      } else {
        // Perform the side effect or state update expressed on the following line.
        permission.label = data.label;
        // Perform the side effect or state update expressed on the following line.
        permission.module = data.module;
        // Perform the side effect or state update expressed on the following line.
        permission.path = data.path;
        // Perform the side effect or state update expressed on the following line.
        permission.enabled = true;

        // Perform the side effect or state update expressed on the following line.
        await permission.save();

        // debug removed
      }

      // Perform the side effect or state update expressed on the following line.
      permissionIds.push(permission._id);
    }

    /*
    |--------------------------------------------------------------------------
    | FIND CORRECT TOUR MANAGER ROLE
    |--------------------------------------------------------------------------
    */

    // Declare tourManagerRole for use by the surrounding module or function.
    let tourManagerRole = await Role.findOne({
      name: "tour_manager",
    });

    // Check the condition (!tourManagerRole) and run the matching branch.
    if (!tourManagerRole) {
      // Perform the side effect or state update expressed on the following line.
      tourManagerRole = await Role.create({
        name: "tour_manager",
        displayName: "Tour Manager",
        description:
          "Manages tours, bookings, customers, guides and tour operations.",
        permissions: permissionIds,
        level: 70,
        isSystem: true,
        isDefault: false,
        status: "active",
      });

      // debug removed
    } else {
      // Perform the side effect or state update expressed on the following line.
      tourManagerRole.displayName = "Tour Manager";
      // Perform the side effect or state update expressed on the following line.
      tourManagerRole.description =
        "Manages tours, bookings, customers, guides and tour operations.";
      // Perform the side effect or state update expressed on the following line.
      tourManagerRole.permissions = permissionIds;
      // Perform the side effect or state update expressed on the following line.
      tourManagerRole.level = 70;
      // Perform the side effect or state update expressed on the following line.
      tourManagerRole.isSystem = true;
      // Perform the side effect or state update expressed on the following line.
      tourManagerRole.status = "active";

      // Perform the side effect or state update expressed on the following line.
      await tourManagerRole.save();

      // debug removed
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE OR UPDATE TOUR MANAGER USER
    |--------------------------------------------------------------------------
    */

    // Declare email for use by the surrounding module or function.
    const email = "manager@husseinmboyatours.com";

    // Declare manager for use by the surrounding module or function.
    let manager = await User.findOne({ email });

    // Check the condition (!manager) and run the matching branch.
    if (!manager) {
      // Perform the side effect or state update expressed on the following line.
      manager = await User.create({
        name: "Tour Manager",
        email,
        password: process.env.SEED_MANAGER_PASSWORD || crypto.randomBytes(18).toString("base64url"),
        phone: "0000000000",

        role: "tour_manager",

        roleId: tourManagerRole._id,

        legacyRole: "tour_manager",

        status: "active",
        isVerified: true,
      });

      // debug removed
    } else {
      // Perform the side effect or state update expressed on the following line.
      manager.role = "tour_manager";
      // Perform the side effect or state update expressed on the following line.
      manager.roleId = tourManagerRole._id;
      // Perform the side effect or state update expressed on the following line.
      manager.legacyRole = "tour_manager";
      // Perform the side effect or state update expressed on the following line.
      manager.status = "active";
      // Perform the side effect or state update expressed on the following line.
      manager.isVerified = true;

      // Perform the side effect or state update expressed on the following line.
      await manager.save();

      // debug removed
    }

    /*
    |--------------------------------------------------------------------------
    | SUMMARY
    |--------------------------------------------------------------------------
    */

    // debug removed
    // debug removed
    // debug removed
    // debug removed
    // debug removed
    // debug removed
    // debug removed);
    // debug removed
    // debug removed

  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("TOUR MANAGER SEED ERROR:", error);
    // Perform the side effect or state update expressed on the following line.
    process.exitCode = 1;
  } finally {
    // Perform the side effect or state update expressed on the following line.
    await mongoose.connection.close().catch(() => {});
    // debug removed
  }
};

// Perform the side effect or state update expressed on the following line.
createTourManager();
