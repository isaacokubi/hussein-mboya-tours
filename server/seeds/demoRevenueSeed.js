import mongoose from "mongoose";
import dotenv from "dotenv";

import Organization from "../models/Organization.js";
import User from "../models/User.js";
import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import { runWithTenant } from "../tenancy/context.js";

dotenv.config();

const DEMO_TAG = "DEMO_REVENUE_SEED_V2";

/*
|--------------------------------------------------------------------------
| DETERMINISTIC TENANT PROFILE
|--------------------------------------------------------------------------
| Every tenant gets a different, repeatable demo profile derived from its
| organization id/slug. Re-running this seed replaces only records created by
| this demo seed and never touches real bookings or payments.
|--------------------------------------------------------------------------
*/

const hashText = (value = "") => {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const pick = (seed, min, max) => min + (seed % (max - min + 1));

const roundTo = (value, step = 1000) => Math.round(value / step) * step;

const moneyFor = (seed, index, base) => {
  const spread = pick(seed + index * 7919, -28, 42);
  return Math.max(18000, roundTo(base * (1 + spread / 100), 1000));
};

const profileFor = (organization) => {
  const seed = hashText(`${organization._id}:${organization.slug}:${organization.name}`);

  return {
    seed,
    bookingCount: pick(seed, 9, 24),
    baseAmount: pick(seed >>> 3, 42000, 145000),
    monthlyTrend: pick(seed >>> 7, 8, 26),
    guestBase: pick(seed >>> 11, 1, 4),
  };
};

const findOrCreateDemoCustomer = async (organization, seed) => {
  const existing = await User.findOne({
    status: "active",
    role: { $in: ["customer", "admin", "manager", "agent", "guide", "driver"] },
  }).select("_id name email phone").lean();

  if (existing) return existing;

  const suffix = String(seed).slice(-8);
  const customer = await User.create({
    tenantId: organization._id,
    name: `${organization.name} Demo Customer`,
    email: `demo.customer.${suffix}@example.invalid`,
    phone: `07${String(10000000 + (seed % 8999999)).padStart(8, "0")}`.slice(0, 10),
    password: `DemoSeed-${suffix}-2026!`,
    role: "customer",
    legacyRole: "customer",
    status: "active",
    isVerified: true,
  });

  return customer.toObject();
};

const createTenantDemoData = async (organization) => {
  const profile = profileFor(organization);

  return runWithTenant(
    { tenantId: organization._id, tenant: organization },
    async () => {
      // Only remove records explicitly created by this demo seed.
      await Payment.deleteMany({ notes: DEMO_TAG });
      await Booking.deleteMany({ staffNotes: DEMO_TAG });

      const customer = await findOrCreateDemoCustomer(organization, profile.seed);
      const tours = await Tour.find({ isDeleted: { $ne: true } })
        .select("_id title price")
        .limit(20)
        .lean();

      const bookings = [];
      const payments = [];
      const now = new Date();

      for (let index = 0; index < profile.bookingCount; index += 1) {
        const monthOffset = index % 6;
        const daySeed = profile.seed + index * 104729;
        const daysAgo = monthOffset * 27 + pick(daySeed, 2, 24);
        const createdAt = new Date(now.getTime() - daysAgo * 86400000);
        const guestCount = pick(daySeed >>> 5, profile.guestBase, profile.guestBase + 3);
        const tour = tours.length ? tours[index % tours.length] : null;
        const amount = moneyFor(daySeed, index, tour?.price || profile.baseAmount);

        const booking = await Booking.create({
          tenantId: organization._id,
          customer: customer._id,
          user: customer._id,
          customerSnapshot: {
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
          },
          tour: tour?._id || null,
          travelDate: new Date(createdAt.getTime() + pick(daySeed, 20, 95) * 86400000),
          numberOfGuests: guestCount,
          travelers: Array.from({ length: guestCount }, (_, travelerIndex) => ({
            name: `${customer.name} Traveler ${travelerIndex + 1}`,
            age: pick(daySeed + travelerIndex, 18, 62),
            gender: ["male", "female", "other"][pick(daySeed + travelerIndex * 13, 0, 2)],
            nationality: "Kenyan",
          })),
          pickupLocation: "Nairobi",
          hotelName: "Demo Safari Hotel",
          subtotal: amount,
          totalAmount: amount,
          depositAmount: amount,
          balanceAmount: 0,
          paymentMethod: ["MPESA", "CARD", "BANK_TRANSFER", "CASH"][index % 4],
          paymentStatus: "paid",
          status: index % 9 === 0 ? "confirmed" : "completed",
          bookingSource: ["website", "agent", "admin", "walk_in"][index % 4],
          staffNotes: DEMO_TAG,
          customerNotes: "Demonstration analytics record. Not a real customer booking.",
          createdAt,
          updatedAt: createdAt,
          confirmedAt: createdAt,
          completedAt: index % 9 === 0 ? null : createdAt,
        });

        bookings.push(booking);

        const transactionSeed = `${organization.slug}-${profile.seed}-${index}`;
        payments.push({
          tenantId: organization._id,
          customer: customer._id,
          user: customer._id,
          booking: booking._id,
          provider: ["MPESA", "STRIPE", "BANK", "CASH"][index % 4],
          method: ["mpesa", "card", "bank", "cash"][index % 4],
          paymentMethod: ["MPESA", "CARD", "BANK_TRANSFER", "CASH"][index % 4],
          amount,
          currency: organization.currency || "KES",
          status: "completed",
          transactionId: `DEMO-${profile.seed}-${index}-${Date.now()}`,
          transactionReference: `DEMO-${transactionSeed}`,
          invoiceNumber: `DEMO-INV-${String(profile.seed).slice(-6)}-${index + 1}`,
          notes: DEMO_TAG,
          paidAt: createdAt,
          createdAt,
          updatedAt: createdAt,
        });
      }

      if (payments.length) {
        const createdPayments = await Payment.insertMany(payments, { ordered: true });
        await Booking.bulkWrite(
          createdPayments.map((payment) => ({
            updateOne: {
              filter: { _id: payment.booking, tenantId: organization._id },
              update: { $addToSet: { payments: payment._id } },
            },
          })),
        );
      }

      const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
      return {
        tenant: organization.name,
        bookings: bookings.length,
        completedPayments: payments.length,
        revenue: totalRevenue,
      };
    },
  );
};

const seedDemoRevenue = async () => {
  if (String(process.env.SEED_DEMO_REVENUE || "").toLowerCase() !== "true") {
    throw new Error("Demo revenue seed is disabled. Set SEED_DEMO_REVENUE=true before running it.");
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required.");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  try {
    const organizations = await Organization.find({
      status: { $in: ["active", "trial"] },
    })
      .select("_id name slug currency status")
      .sort({ createdAt: 1 })
      .lean();

    if (!organizations.length) {
      console.log("No active/trial tenants found.");
      return;
    }

    console.log(`Seeding tenant-specific demo revenue for ${organizations.length} tenants...`);

    for (const organization of organizations) {
      const result = await createTenantDemoData(organization);
      console.log(
        `${result.tenant}: ${result.bookings} demo bookings, ${result.completedPayments} completed payments, KES ${result.revenue.toLocaleString()}`,
      );
    }

    console.log("Tenant-specific demo revenue seed completed.");
  } finally {
    await mongoose.connection.close().catch(() => {});
  }
};

seedDemoRevenue().catch((error) => {
  console.error("Demo revenue seed failed:", error);
  process.exitCode = 1;
});
