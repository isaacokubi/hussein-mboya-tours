import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import Organization from "../models/Organization.js";
import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";
import Customer from "../models/Customer.js";
import Payment from "../models/Payment.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Always load the existing server/.env, even when this script is run from the repository root.
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

const run = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) throw new Error("MONGODB_URI or MONGO_URI is required in server/.env");
  await mongoose.connect(mongoUri);

  const tenants = await Organization.find({}).select("_id name").lean();
  if (!tenants.length) throw new Error("No tenants found");

  let created = 0;
  for (const tenant of tenants) {
    const tenantId = tenant._id;
    const tenantKey = String(tenantId).slice(-8);
    const tours = await Tour.find({ tenantId, isDeleted: { $ne: true } }).limit(10).lean();
    if (!tours.length) {
      console.log(`Skipping ${tenant.name || tenantId}: no tenant tours available`);
      continue;
    }

    for (let i = 0; i < 10; i += 1) {
      const state = STATUSES[i];
      const tour = tours[i % tours.length];
      const amount = Number(tour.price || tour.pricePerPerson || tour.pricePerDay || 500) || 500;
      const email = `demo${i + 1}.${tenantKey}@example.test`;

      // Reuse an existing deterministic demo customer/booking when present.
      let customer = await Customer.findOne({ tenantId, email });
      if (!customer) {
        customer = await Customer.create({
          tenantId,
          firstName: "Demo",
          lastName: `Customer ${i + 1}`,
          email,
          phone: `070000${String(i + 1).padStart(4, "0")}`,
          country: "Kenya",
        });
      }

      const existing = await Booking.findOne({ tenantId, customer: customer._id, tour: tour._id }).sort({ createdAt: -1 });
      if (existing?.staffNotes === `DEMO_TENANT_SEED_${i + 1}`) continue;

      const paidAmount = state.paymentStatus === "paid" ? amount : 0;
      const booking = await Booking.create({
        tenantId,
        customer: customer._id,
        tour: tour._id,
        customerSnapshot: {
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.email,
          phone: customer.phone,
        },
        contact: {
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.email,
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
        paymentReference: `DEMO-${tenantKey}-${i + 1}`,
        status: state.bookingStatus,
        bookingSource: "admin",
        staffNotes: `DEMO_TENANT_SEED_${i + 1}`,
      });

      const payment = await Payment.create({
        tenantId,
        customer: customer._id,
        booking: booking._id,
        provider: "MPESA",
        method: "mpesa",
        paymentMethod: "MPESA",
        amount,
        currency: "KES",
        phone: customer.phone,
        status: state.paymentRecordStatus,
        transactionReference: `DEMO-${tenantKey}-${i + 1}`,
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
  }

  console.log(`Created ${created} demo bookings/payment records.`);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
