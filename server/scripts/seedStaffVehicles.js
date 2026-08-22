import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Staff from "../models/Staff.js";
import Vehicle from "../models/Vehicle.js";
import Organization from "../models/Organization.js";
import { runWithTenant } from "../tenancy/context.js";

import crypto from "crypto";
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("MONGODB_URI is missing from server/.env");

const seed = async () => {
  await mongoose.connect(MONGODB_URI);
  const tenantId = process.env.DEFAULT_TENANT_ID;
  if (!tenantId) throw new Error("DEFAULT_TENANT_ID is required. Run npm run migrate:multitenancy first.");
  const tenant = await Organization.findById(tenantId).lean();
  if (!tenant) throw new Error("DEFAULT_TENANT_ID does not reference an existing organization.");

  const seedPassword = process.env.SEED_STAFF_PASSWORD || crypto.randomBytes(18).toString("base64url");

  await runWithTenant({ tenantId: tenant._id, tenant, bypass: false }, async () => {
  for (let i = 1; i <= 10; i += 1) {
    const guideEmail = `guide${i}@seed.husseintours.local`;
    let guideUser = await User.findOne({ email: guideEmail });
    if (!guideUser) {
      guideUser = await User.create({
        name: `Guide ${i}`,
        email: guideEmail,
        phone: `07100000${String(i).padStart(2, "0")}`,
        password: seedPassword,
        role: "guide",
        legacyRole: "guide",
        status: "active",
        isVerified: true,
      });
    }
    await Staff.findOneAndUpdate(
      { email: guideEmail },
      {
        $setOnInsert: {
          user: guideUser._id,
          name: guideUser.name,
          email: guideEmail,
          phone: guideUser.phone,
          position: "guide",
          role: "guide",
          status: "active",
          isActive: true,
          availability: "available",
          employeeNumber: `GUIDE-${String(i).padStart(3, "0")}`,
        },
      },
      { upsert: true, new: true }
    );

    const driverEmail = `driver${i}@seed.husseintours.local`;
    let driverUser = await User.findOne({ email: driverEmail });
    if (!driverUser) {
      driverUser = await User.create({
        name: `Driver ${i}`,
        email: driverEmail,
        phone: `07200000${String(i).padStart(2, "0")}`,
        password: seedPassword,
        role: "driver",
        legacyRole: "driver",
        status: "active",
        isVerified: true,
      });
    }
    await Staff.findOneAndUpdate(
      { email: driverEmail },
      {
        $setOnInsert: {
          user: driverUser._id,
          name: driverUser.name,
          email: driverEmail,
          phone: driverUser.phone,
          position: "driver",
          role: "driver",
          status: "active",
          isActive: true,
          availability: "available",
          employeeNumber: `DRIVER-${String(i).padStart(3, "0")}`,
        },
      },
      { upsert: true, new: true }
    );

    await Vehicle.findOneAndUpdate(
      { registrationNumber: `KDA ${String(100 + i)}A` },
      {
        $setOnInsert: {
          name: `Tour Vehicle ${i}`,
          registrationNumber: `KDA ${String(100 + i)}A`,
          registration: `KDA ${String(100 + i)}A`,
          model: i <= 5 ? "Land Cruiser" : "Hiace",
          manufacturer: i <= 5 ? "Toyota" : "Toyota",
          year: 2022 + (i % 4),
          type: i <= 5 ? "LAND_CRUISER" : "VAN",
          capacity: i <= 5 ? 7 : 12,
          status: "available",
          isActive: true,
        },
      },
      { upsert: true, new: true }
    );
  }
  });

  // debug removed
  // debug removed.");
  await mongoose.disconnect();
};

seed().catch(async (error) => {
  console.error("Seed failed:", error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
