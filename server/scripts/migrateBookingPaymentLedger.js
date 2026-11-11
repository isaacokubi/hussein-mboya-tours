/**
 * Purpose: migrate Booking Payment Ledger operational script. Main declarations: round, run.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import dotenv from "dotenv";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Perform the side effect or state update expressed on the following line.
dotenv.config();
// Declare round for use by the surrounding module or function.
const round = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
// Declare run for use by the surrounding module or function.
const run = async () => {
  // Check the condition (!process.env.MONGODB_URI) and run the matching branch.
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required.");
  // Perform the side effect or state update expressed on the following line.
  await mongoose.connect(process.env.MONGODB_URI);
  // Declare cursor for use by the surrounding module or function.
  const cursor = Booking.find({}).cursor(); let processed = 0; let changed = 0;
  // Repeat the enclosed work for each required iteration.
  for await (const booking of cursor) {
    // Declare payments for use by the surrounding module or function.
    const payments = await Payment.find({ booking: booking._id, status: { $in: ["completed", "refunded"] } }).select("amount refundedAmount").lean();
    // Declare paid for use by the surrounding module or function.
    let paid = payments.reduce((sum, payment) => sum + Math.max(0, Number(payment.amount || 0) - Number(payment.refundedAmount || 0)), 0);
    // Check the condition (paid <= 0 && booking.paymentStatus === "paid") and run the matching branch.
    if (paid <= 0 && booking.paymentStatus === "paid") paid = Number(booking.totalAmount || 0);
    // Perform the side effect or state update expressed on the following line.
    paid = Math.min(Number(booking.totalAmount || 0), round(paid));
    // Declare depositDue for use by the surrounding module or function.
    let depositDue = Number(booking.depositAmount || 0);
    // Check the condition (booking.tour) and run the matching branch.
    if (booking.tour) {
      // Declare tour for use by the surrounding module or function.
      const tour = await Tour.findById(booking.tour).select("depositRequired depositType").lean();
      // Check the condition (tour) and run the matching branch.
      if (tour) { const configured = Number(tour.depositRequired || 0); depositDue = String(tour.depositType || "fixed").toLowerCase() === "percentage" ? round(Math.min(Number(booking.totalAmount || 0), Number(booking.totalAmount || 0) * configured / 100)) : round(Math.min(Number(booking.totalAmount || 0), configured)); }
    }
    // Declare balance for use by the surrounding module or function.
    const balance = Math.max(0, round(Number(booking.totalAmount || 0) - paid));
    // Declare nextStatus for use by the surrounding module or function.
    const nextStatus = paid >= Number(booking.totalAmount || 0) && Number(booking.totalAmount || 0) > 0 ? "paid" : paid > 0 ? "partial" : booking.paymentStatus;
    // Declare before for use by the surrounding module or function.
    const before = JSON.stringify({ amountPaid:Number(booking.amountPaid||0), balanceAmount:Number(booking.balanceAmount||0), depositAmount:Number(booking.depositAmount||0), paymentStatus:booking.paymentStatus });
    // Perform the side effect or state update expressed on the following line.
    booking.amountPaid = paid; booking.depositAmount = depositDue; booking.balanceAmount = balance; booking.paymentStatus = nextStatus;
    // Perform the side effect or state update expressed on the following line.
    await booking.save({ validateBeforeSave: false });
    // Declare after for use by the surrounding module or function.
    const after = JSON.stringify({ amountPaid:paid, balanceAmount:balance, depositAmount:depositDue, paymentStatus:nextStatus });
    // Perform the side effect or state update expressed on the following line.
    processed += 1; if (before !== after) changed += 1;
  }
  // Perform the side effect or state update expressed on the following line.
  console.log(JSON.stringify({ processed, changed }, null, 2)); await mongoose.disconnect();
};
// Perform the side effect or state update expressed on the following line.
run().catch(async (error) => { console.error(error); try { await mongoose.disconnect(); } catch {} process.exit(1); });
