import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import Organization from "../models/Organization.js";
import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";
import Customer from "../models/Customer.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import { runWithTenant } from "../tenancy/context.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, "../.env") });
dotenv.config();

const STATUSES = [
  { bookingStatus: "confirmed", paymentStatus: "paid", paymentRecordStatus: "completed" },
  { bookingStatus: "confirmed", paymentStatus: "paid", paymentRecordStatus: "completed" },
  { bookingStatus: "confirmed", paymentStatus: "pending", paymentRecordStatus: "pending" },
  { bookingStatus: "pending", paymentStatus: "pending", paymentRecordStatus: "pending" },
  { bookingStatus: "pending", paymentStatus: "failed", paymentRecordStatus: "failed" },
  { bookingStatus: "confirmed", paymentStatus: "paid", paymentRecordStatus: "completed" },
  { bookingStatus: "pending", paymentStatus: "pending", paymentRecordStatus: "pending" },
  { bookingStatus: "confirmed", paymentStatus: "paid", paymentRecordStatus: "completed" },
  { bookingStatus: "pending", paymentStatus: "failed", paymentRecordStatus: "failed" },
  { bookingStatus: "confirmed", paymentStatus: "paid", paymentRecordStatus: "completed" },
];

async function getTenants() {
  return runWithTenant({ role: "superadmin", bypass: true }, async () =>
    Organization.find({}).select("_id name").lean()
  );
}

async function seedTenant(tenant) {
  return runWithTenant({
    tenantId: String(tenant._id),
    role: "admin",
    bypass: false,
  }, async () => {
    const tenantId = tenant._id;
    const tenantKey = String(tenantId).slice(-8);
    const tours = await Tour.find({ isDeleted: { $ne: true } }).limit(10).lean();
    if (!tours.length) {
      console.log(`Skipping ${tenant.name || tenantId}: no tenant tours available`);
      return 0;
    }

    // Payment.customer references User, while Customer.user is unique.
    // Reuse one existing tenant user/customer for all demo bookings instead of
    // attempting to create multiple customers with user:null.
    const paymentUser = await User.findOne({ status: { $ne: "disabled" } })
      .select("_id email")
      .lean();
    if (!paymentUser) {
      console.log(`Skipping ${tenant.name || tenantId}: no tenant user available for payment records`);
      return 0;
    }

    let customer = await Customer.findOne({ user: paymentUser._id });
    if (!customer) {
      customer = await Customer.findOne({});
    }
    if (!customer) {
      customer = await Customer.create({
        user: paymentUser._id,
        firstName: "Demo",
        lastName: "Customer",
        email: paymentUser.email || `demo.${tenantKey}@example.test`,
        phone: "0700000000",
        country: "Kenya",
      });
    }

    let created = 0;
    for (let i = 0; i < 10; i += 1) {
      const state = STATUSES[i];
      const tour = tours[i % tours.length];
      const amount = Number(tour.price || 500) || 500;
      const reference = `DEMO-${tenantKey}-${i + 1}`;
      const marker = `DEMO_TENANT_SEED_${tenantKey}_${i + 1}`;

      const existing = await Booking.findOne({ staffNotes: marker });
      if (existing) continue;

      const paidAmount = state.paymentStatus === "paid" ? amount : 0;
      const booking = await Booking.create({
        customer: customer._id,
        tour: tour._id,
        customerSnapshot: {
          name: `Demo Customer ${i + 1}`,
          email: customer.email || `demo${i + 1}.${tenantKey}@example.test`,
          phone: customer.phone,
        },
        contact: {
          name: `Demo Customer ${i + 1}`,
          email: customer.email || `demo${i + 1}.${tenantKey}@example.test`,
          phone: customer.phone,
        },
        travelDate: new Date(Date.now() + (30 + i) * 86400000),
        numberOfGuests: (i % 4) + 1,
        subtotal: amount,
        discountAmount: 0,
        totalAmount: amount,
        depositAmount: paidAmount,
        balanceAmount: Math.max(0, amount - paidAmount),
        paymentMethod: "MPESA",
        paymentStatus: state.paymentStatus,
        paymentReference: reference,
        status: state.bookingStatus,
        bookingSource: "admin",
        staffNotes: marker,
      });

      const payment = await Payment.create({
        customer: paymentUser._id,
        booking: booking._id,
        provider: "MPESA",
        method: "mpesa",
        paymentMethod: "MPESA",
        amount,
        currency: "KES",
        phone: customer.phone,
        status: state.paymentRecordStatus,
        transactionReference: reference,
        transactionId: `DEMO-TXN-${tenantKey}-${i + 1}`,
        paidAt: state.paymentRecordStatus === "completed" ? new Date() : null,
        failureReason: state.paymentRecordStatus === "failed" ? "Demo payment failure" : "",
        notes: "Demo tenant test payment",
      });

      booking.payments = [payment._id];
      await booking.save();
      created += 1;
    }

    console.log(`${tenant.name || tenantId}: ensured 10 demo bookings with mixed paid, pending and failed payments`);
    return created;
  });
}

async function run() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) throw new Error("MONGODB_URI or MONGO_URI is required in server/.env");
  await mongoose.connect(mongoUri);

  try {
    const tenants = await getTenants();
    if (!tenants.length) throw new Error("No tenants found");

    let created = 0;
    for (const tenant of tenants) created += await seedTenant(tenant);
    console.log(`Created ${created} demo bookings/payment records.`);
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
