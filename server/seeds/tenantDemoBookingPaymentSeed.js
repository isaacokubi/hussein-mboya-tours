import mongoose from "mongoose";
import dotenv from "dotenv";
import Organization from "../models/Organization.js";
import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";

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
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required");
  await mongoose.connect(process.env.MONGODB_URI);

  const tenants = await Organization.find({}).select("_id name").lean();
  if (!tenants.length) throw new Error("No tenants found");

  let created = 0;
  for (const tenant of tenants) {
    const tenantId = tenant._id;
    const tours = await Tour.find({ tenantId, isDeleted: { $ne: true } }).limit(10).lean();
    if (!tours.length) {
      console.log(`Skipping ${tenant.name || tenantId}: no tenant tours available`);
      continue;
    }

    for (let i = 0; i < 10; i += 1) {
      const state = STATUSES[i];
      const tour = tours[i % tours.length];
      const amount = Number(tour.price || tour.pricePerPerson || 500) || 500;
      const reference = `DEMO-${String(tenantId).slice(-6)}-${i + 1}`;

      const existing = await Booking.findOne({ tenantId, reference });
      if (existing) continue;

      const booking = await Booking.create({
        tenantId,
        tour: tour._id,
        destination: tour.destination || undefined,
        customerName: `Demo Customer ${i + 1}`,
        customerEmail: `demo${i + 1}.${String(tenantId).slice(-6)}@example.test`,
        customerPhone: `070000${String(i + 1).padStart(4, "0")}`,
        travelDate: new Date(Date.now() + (30 + i) * 86400000),
        numberOfGuests: (i % 4) + 1,
        subtotal: amount,
        discountAmount: 0,
        amount,
        totalAmount: amount,
        paymentMethod: "demo",
        paymentStatus: state.paymentStatus,
        status: state.bookingStatus,
        reference,
      });

      await Payment.create({
        tenantId,
        booking: booking._id,
        amount,
        currency: "KES",
        provider: "demo",
        method: "demo",
        status: state.paymentRecordStatus,
        reference,
      });
      created += 1;
    }
    console.log(`${tenant.name || tenantId}: ensured 10 demo bookings with mixed statuses`);
  }

  console.log(`Created ${created} demo bookings/payment records.`);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
