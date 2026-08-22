import mongoose from "mongoose";
import dotenv from "dotenv";
import Booking from "../models/Booking.js";
import Agent from "../models/Agent.js";
import Commission from "../models/Commission.js";
import Organization from "../models/Organization.js";
import { runWithTenant } from "../tenancy/context.js";

dotenv.config();
await mongoose.connect(process.env.MONGODB_URI);

const tenants = await Organization.find({ status: { $ne: "cancelled" } }).lean();
for (const tenant of tenants) {
  await runWithTenant({ tenantId: tenant._id, tenant, bypass: false }, async () => {
    const bookings = await Booking.find({ paymentStatus: "paid", agent: { $ne: null } });
    for (const booking of bookings) {
      const exists = await Commission.findOne({ booking: booking._id });
      if (exists) continue;
      const agent = await Agent.findById(booking.agent);
      if (!agent) continue;
      const bookingAmount = Number(booking.totalAmount || booking.amount || 0);
      const rate = Number(agent.commissionRate || 10);
      await Commission.create({
        agent: agent._id, booking: booking._id, customer: booking.customer, tour: booking.tour,
        bookingAmount, rate, amount: (bookingAmount * rate) / 100, status: "pending",
        paymentMethod: booking.paymentMethod || "MPESA",
      });
      console.log(`[${tenant.slug}] Commission created: ${booking.bookingNumber || booking._id}`);
    }
  });
}
await mongoose.disconnect();
