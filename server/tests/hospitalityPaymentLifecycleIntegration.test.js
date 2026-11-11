/**
 * Purpose: hospitality Payment Lifecycle Integration.test automated test. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import test from "node:test";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Load ../models/AirportTransferBooking.js so this module can use its exported dependencies.
import AirportTransferBooking from "../models/AirportTransferBooking.js";
// Load ../models/Invoice.js so this module can use its exported dependencies.
import Invoice from "../models/Invoice.js";
// Load ../models/JournalEntry.js so this module can use its exported dependencies.
import JournalEntry from "../models/JournalEntry.js";
// Load ../services/hospitalityPaymentLifecycleService.js so this module can use its exported dependencies.
import { completeHospitalityPayment } from "../services/hospitalityPaymentLifecycleService.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant } from "../tenancy/context.js";
// Load ./integrationMongoUri.js so this module can use its exported dependencies.
import { getDisposableIntegrationMongoUri } from "./integrationMongoUri.js";

// Declare integrationMongoUri for use by the surrounding module or function.
const integrationMongoUri = getDisposableIntegrationMongoUri();
// Declare integrationEnabled for use by the surrounding module or function.
const integrationEnabled = process.env.RUN_DATABASE_INTEGRATION_TESTS === "true" && Boolean(integrationMongoUri);

// Perform the side effect or state update expressed on the following line.
test("airport transfer payment completion atomically updates booking, invoice and accounting", { skip: !integrationEnabled }, async () => {
  // Check the condition (mongoose.connection.readyState === 0) and run the matching branch.
  if (mongoose.connection.readyState === 0) await mongoose.connect(integrationMongoUri);
  // Declare tenantId for use by the surrounding module or function.
  const tenantId = new mongoose.Types.ObjectId();
  // Declare bookingId for use by the surrounding module or function.
  const bookingId = new mongoose.Types.ObjectId();

  // Perform the side effect or state update expressed on the following line.
  await runWithTenant({ tenantId, role: "manager" }, async () => {
    // Declare booking for use by the surrounding module or function.
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

    // Declare payment for use by the surrounding module or function.
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

    // Declare result for use by the surrounding module or function.
    const result = await completeHospitalityPayment({
      payment,
      booking,
      paymentData: { amount: 1000, paymentMethod: "MPESA", mpesaReceiptNumber: "CI-ATOMIC-001" },
    });

    // Perform the side effect or state update expressed on the following line.
    assert.equal(result.payment.status, "completed");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(result.booking.paymentStatus, "paid");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(result.booking.status, "confirmed");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(result.invoice.status, "paid");

    // Declare paymentJournal for use by the surrounding module or function.
    const paymentJournal = await JournalEntry.findOne({
      tenantId,
      sourceType: "payment",
      sourceId: payment._id,
      status: "posted",
    }).lean();
    // Perform the side effect or state update expressed on the following line.
    assert.ok(paymentJournal);
    // Declare debit for use by the surrounding module or function.
    const debit = paymentJournal.lines.reduce((sum, line) => sum + Number(line.debit || 0), 0);
    // Declare credit for use by the surrounding module or function.
    const credit = paymentJournal.lines.reduce((sum, line) => sum + Number(line.credit || 0), 0);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(Math.round(debit * 100), Math.round(credit * 100));

    // Perform the side effect or state update expressed on the following line.
    await JournalEntry.deleteMany({ tenantId });
    // Perform the side effect or state update expressed on the following line.
    await Invoice.deleteMany({ tenantId });
    // Perform the side effect or state update expressed on the following line.
    await Payment.deleteMany({ tenantId });
    // Perform the side effect or state update expressed on the following line.
    await AirportTransferBooking.deleteMany({ tenantId });
  });
});

// Perform the side effect or state update expressed on the following line.
test.after(async () => {
  // Check the condition (mongoose.connection.readyState !== 0) and run the matching branch.
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});
