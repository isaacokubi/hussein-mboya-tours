import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import Payment from "../models/Payment.js";
import AirportTransferBooking from "../models/AirportTransferBooking.js";
import Invoice from "../models/Invoice.js";
import JournalEntry from "../models/JournalEntry.js";
import { completeHospitalityPayment } from "../services/hospitalityPaymentLifecycleService.js";
import { runWithTenant } from "../tenancy/context.js";

const integrationEnabled = Boolean(process.env.MONGODB_URI);

test("airport transfer payment completion atomically updates booking, invoice and accounting", { skip: !integrationEnabled }, async () => {
  if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_URI);
  const tenantId = new mongoose.Types.ObjectId();
  const bookingId = new mongoose.Types.ObjectId();

  await runWithTenant({ tenantId, role: "manager" }, async () => {
    const booking = await AirportTransferBooking.create({
      _id: bookingId,
      tenantId,
      reference: "TR-CI-ATOMIC-001",
      transfer: new mongoose.Types.ObjectId(),
      pickupDateTime: new Date("2099-08-01T08:00:00.000Z"),
      pickupLocation: "Mombasa Airport",
      dropoffLocation: "Nyali",
      passengerName: "Integration Guest",
      passengerPhone: "0712345678",
      passengers: 1,
      subtotal: 1000,
      totalAmount: 1000,
      source: "api",
    });

    const payment = await Payment.create({
      tenantId,
      customer: new mongoose.Types.ObjectId(),
      user: new mongoose.Types.ObjectId(),
      hospitalityBooking: booking._id,
      hospitalityBookingModel: "AirportTransferBooking",
      hospitalityType: "airport_transfer",
      provider: "MPESA",
      paymentMethod: "MPESA",
      amount: 1000,
      currency: "KES",
      status: "pending",
    });

    const result = await completeHospitalityPayment({
      payment,
      booking,
      paymentData: { amount: 1000, paymentMethod: "MPESA", mpesaReceiptNumber: "CI-ATOMIC-001" },
    });

    assert.equal(result.payment.status, "completed");
    assert.equal(result.booking.paymentStatus, "paid");
    assert.equal(result.booking.status, "confirmed");
    assert.equal(result.invoice.status, "paid");

    const paymentJournal = await JournalEntry.findOne({
      tenantId,
      sourceType: "payment",
      sourceId: payment._id,
      status: "posted",
    }).lean();
    assert.ok(paymentJournal);
    const debit = paymentJournal.lines.reduce((sum, line) => sum + Number(line.debit || 0), 0);
    const credit = paymentJournal.lines.reduce((sum, line) => sum + Number(line.credit || 0), 0);
    assert.equal(Math.round(debit * 100), Math.round(credit * 100));

    await JournalEntry.deleteMany({ tenantId });
    await Invoice.deleteMany({ tenantId });
    await Payment.deleteMany({ tenantId });
    await AirportTransferBooking.deleteMany({ tenantId });
  });
});

test.after(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});
