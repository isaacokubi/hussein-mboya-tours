import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "../models/User.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";
import Staff from "../models/Staff.js";

import crypto from "crypto";
dotenv.config();

const guides = [
  {
    name: "John Safari Guide",
    email: "john.guide@husseinmboyatours.com",
    password: process.env.SEED_GUIDE_PASSWORD || crypto.randomBytes(18).toString("base64url"),
    phone: "+254700111222",
  },
  {
    name: "Mary Wildlife Expert",
    email: "mary.guide@husseinmboyatours.com",
    password: process.env.SEED_GUIDE_PASSWORD || crypto.randomBytes(18).toString("base64url"),
    phone: "+254700333444",
  },
  {
    name: "David Mountain Guide",
    email: "david.guide@husseinmboyatours.com",
    password: process.env.SEED_GUIDE_PASSWORD || crypto.randomBytes(18).toString("base64url"),
    phone: "+254700555666",
  },
];

const seedGuides = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing in .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);

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
          module: "guide",
          category: "other",
        });
      }

      permissionIds.push(permission._id);
    }

    let guideRole = await Role.findOne({ name: "guide" });

    if (!guideRole) {
      guideRole = await Role.create({
        name: "guide",
        displayName: "Tour Guide",
        description: "Tour guide access",
        permissions: permissionIds,
        isSystem: true,
        status: "active",
        level: 2,
      });
    } else {
      guideRole.permissions = permissionIds;
      guideRole.status = "active";
      await guideRole.save();
    }

    for (const item of guides) {
      let user = await User.findOne({ email: item.email });

      if (!user) {
        user = await User.create({
          name: item.name,
          email: item.email,
          password: item.password,
          phone: item.phone,
          role: "tour_guide",
          roleId: guideRole._id,
          legacyRole: "tour_guide",
          status: "active",
          isVerified: true,
        });
      } else {
        user.name = item.name;
        user.phone = item.phone;
        user.role = "tour_guide";
        user.roleId = guideRole._id;
        user.legacyRole = "tour_guide";
        user.status = "active";
        user.isVerified = true;
        await user.save();
      }

      let staff = await Staff.findOne({
        $or: [
          { user: user._id },
          { email: user.email },
        ],
        position: "guide",
      });

      if (!staff) {
        staff = await Staff.create({
          user: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          position: "guide",
          role: "guide",
          status: "active",
          isActive: true,
          isDeleted: false,
          availability: "available",
          createdBy: user._id,
        });
      } else {
        staff.user = user._id;
        staff.name = user.name;
        staff.email = user.email;
        staff.phone = user.phone || staff.phone || "";
        staff.position = "guide";
        staff.role = "guide";
        staff.status = "active";
        staff.isActive = true;
        staff.isDeleted = false;
        await staff.save();
      }

      // debug removed
    }

    // debug removed
  } catch (error) {
    console.error("TOUR GUIDE SEED ERROR:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close().catch(() => {});
  }
};

seedGuides();
