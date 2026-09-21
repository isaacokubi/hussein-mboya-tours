import dotenv from "dotenv";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Tour from "../models/Tour.js";
dotenv.config();
const round = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
const run = async () => {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required.");
  await mongoose.connect(process.env.MONGO_URI);
  const cursor = Booking.find({}).cursor(); let processed = 0; let changed = 0;
  for await (const booking of cursor) {
    const payments = await Payment.find({ booking: booking._id, status: { $in: ["completed", "refunded"] } }).select("amount refundedAmount").lean();
    let paid = payments.reduce((sum, payment) => sum + Math.max(0, Number(payment.amount || 0) - Number(payment.refundedAmount || 0)), 0);
    if (paid <= 0 && booking.paymentStatus === "paid") paid = Number(booking.totalAmount || 0);
    paid = Math.min(Number(booking.totalAmount || 0), round(paid));
    let depositDue = Number(booking.depositAmount || 0);
    if (booking.tour) {
      const tour = await Tour.findById(booking.tour).select("depositRequired depositType").lean();
      if (tour) { const configured = Number(tour.depositRequired || 0); depositDue = String(tour.depositType || "fixed").toLowerCase() === "percentage" ? round(Math.min(Number(booking.totalAmount || 0), Number(booking.totalAmount || 0) * configured / 100)) : round(Math.min(Number(booking.totalAmount || 0), configured)); }
    }
    const balance = Math.max(0, round(Number(booking.totalAmount || 0) - paid));
    const nextStatus = paid >= Number(booking.totalAmount || 0) && Number(booking.totalAmount || 0) > 0 ? "paid" : paid > 0 ? "partial" : booking.paymentStatus;
    const before = JSON.stringify({ amountPaid:Number(booking.amountPaid||0), balanceAmount:Number(booking.balanceAmount||0), depositAmount:Number(booking.depositAmount||0), paymentStatus:booking.paymentStatus });
    booking.amountPaid = paid; booking.depositAmount = depositDue; booking.balanceAmount = balance; booking.paymentStatus = nextStatus;
    await booking.save({ validateBeforeSave: false });
    const after = JSON.stringify({ amountPaid:paid, balanceAmount:balance, depositAmount:depositDue, paymentStatus:nextStatus });
    processed += 1; if (before !== after) changed += 1;
  }
  console.log(JSON.stringify({ processed, changed }, null, 2)); await mongoose.disconnect();
};
run().catch(async (error) => { console.error(error); try { await mongoose.disconnect(); } catch {} process.exit(1); });