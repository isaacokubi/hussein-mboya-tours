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

    console.log("MongoDB Connected");

    /*
    |--------------------------------------------------------------------------
    | TOUR MANAGER PERMISSIONS
    |--------------------------------------------------------------------------
    */

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

    const permissionIds = [];

    for (const data of permissionDefinitions) {
      let permission = await Permission.findOne({
        name: data.name,
      });

      if (!permission) {
        permission = await Permission.create({
          ...data,
          enabled: true,
        });

        console.log(`CREATED permission: ${data.name}`);
      } else {
        permission.label = data.label;
        permission.module = data.module;
        permission.path = data.path;
        permission.enabled = true;

        await permission.save();

        console.log(`UPDATED permission: ${data.name}`);
      }

      permissionIds.push(permission._id);
    }

    /*
    |--------------------------------------------------------------------------
    | FIND CORRECT TOUR MANAGER ROLE
    |--------------------------------------------------------------------------
    */

    let tourManagerRole = await Role.findOne({
      name: "tour_manager",
    });

    if (!tourManagerRole) {
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

      console.log("CREATED role: tour_manager");
    } else {
      tourManagerRole.displayName = "Tour Manager";
      tourManagerRole.description =
        "Manages tours, bookings, customers, guides and tour operations.";
      tourManagerRole.permissions = permissionIds;
      tourManagerRole.level = 70;
      tourManagerRole.isSystem = true;
      tourManagerRole.status = "active";

      await tourManagerRole.save();

      console.log("UPDATED role: tour_manager");
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE OR UPDATE TOUR MANAGER USER
    |--------------------------------------------------------------------------
    */

    const email = "manager@husseinmboyatours.com";

    let manager = await User.findOne({ email });

    if (!manager) {
      manager = await User.create({
        name: "Tour Manager",
        email,
        password: "Manager@12345",
        phone: "0000000000",

        role: "tour_manager",

        roleId: tourManagerRole._id,

        legacyRole: "tour_manager",

        status: "active",
        isVerified: true,
      });

      console.log("CREATED user: manager@husseinmboyatours.com");
    } else {
      manager.role = "tour_manager";
      manager.roleId = tourManagerRole._id;
      manager.legacyRole = "tour_manager";
      manager.status = "active";
      manager.isVerified = true;

      await manager.save();

      console.log("UPDATED user: manager@husseinmboyatours.com");
    }

    /*
    |--------------------------------------------------------------------------
    | SUMMARY
    |--------------------------------------------------------------------------
    */

    console.log("\n======================================");
    console.log("TOUR MANAGER RBAC READY");
    console.log("======================================");
    console.log("Email:       manager@husseinmboyatours.com");
    console.log("Password:    Manager@12345");
    console.log("Role:        tour_manager");
    console.log("Role ID:     ", tourManagerRole._id.toString());
    console.log("Permissions: ", permissionIds.length);
    console.log("======================================\n");

  } catch (error) {
    console.error("TOUR MANAGER SEED ERROR:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close().catch(() => {});
    console.log("MongoDB connection closed");
  }
};

createTourManager();
