import mongoose from "mongoose";
import dotenv from "dotenv";
import Organization from "../models/Organization.js";
import User from "../models/User.js";
import Customer from "../models/Customer.js";
import Tour from "../models/Tour.js";
import Staff from "../models/Staff.js";
import Agent from "../models/Agent.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Invoice from "../models/Invoice.js";
import Commission from "../models/Commission.js";
import Expense from "../models/Expense.js";
import CreditDebitNote from "../models/CreditDebitNote.js";
import Supplier from "../models/Supplier.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import TourCost from "../models/TourCost.js";
import SupplierPayable from "../models/SupplierPayable.js";
import JournalEntry from "../models/JournalEntry.js";
import { runWithTenant } from "../tenancy/context.js";

dotenv.config();

/*
 * SAFE DEMO/QA DATA REFRESH
 *
 * Preserves the three existing tenants and all existing destinations, tours,
 * customers, users, staff, guides, drivers, agents and other master data.
 * Replaces transactional/financial data so every dashboard has realistic data.
 * This script intentionally refuses to run unless exactly three tenants exist.
 */

const round = (n) => Math.round(Number(n) * 100) / 100;
const daysFromNow = (n) => new Date(Date.now() + n * 86400000);
const slug = (name) => String(name || "tenant").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

const paymentPlans = [
  ["paid", "completed", 1],
  ["paid", "completed", 1],
  ["partial", "confirmed", 0.45],
  ["pending", "pending", 0],
  ["paid", "completed", 1],
  ["partial", "assigned", 0.6],
  ["refunded", "refunded", 1],
  ["failed", "pending", 0],
  ["paid", "ongoing", 1],
  ["paid", "confirmed", 1],
  ["partial", "confirmed", 0.5],
  ["paid", "completed", 1],
];

const providers = [
  ["MPESA", "mpesa"],
  ["STRIPE", "card"],
  ["BANK", "bank"],
  ["PESAPAL", "pesapal"],
  ["CASH", "cash"],
];

async function clearTransactionalData(tenantId) {
  const filter = { tenantId };
  await Promise.all([
    Booking.deleteMany(filter),
    Payment.deleteMany(filter),
    Invoice.deleteMany(filter),
    Commission.deleteMany(filter),
    Expense.deleteMany(filter),
    CreditDebitNote.deleteMany(filter),
    PurchaseOrder.deleteMany(filter),
    TourCost.deleteMany(filter),
    SupplierPayable.deleteMany(filter),
    JournalEntry.deleteMany(filter),
  ]);
}

async function seedTenant(tenant, tenantIndex) {
  return runWithTenant({ tenantId: tenant._id, role: "super_admin", bypass: true }, async () => {
    await clearTransactionalData(tenant._id);

    const [customers, tours, users, staff, agents, suppliers] = await Promise.all([
      Customer.find({ tenantId: tenant._id, isDeleted: { $ne: true } }).limit(30).lean(),
      Tour.find({ tenantId: tenant._id, isDeleted: { $ne: true }, published: true }).limit(50).lean(),
      User.find({ tenantId: tenant._id, isDeleted: { $ne: true } }).limit(100).lean(),
      Staff.find({ tenantId: tenant._id, isDeleted: { $ne: true }, status: "active" }).lean(),
      Agent.find({ tenantId: tenant._id, isDeleted: { $ne: true } }).lean(),
      Supplier.find({ tenantId: tenant._id, isDeleted: { $ne: true } }).lean(),
    ]);

    if (!customers.length) throw new Error(`Tenant ${tenant.name || tenant._id} has no customers; refusing to invent replacement master data.`);
    if (!tours.length) throw new Error(`Tenant ${tenant.name || tenant._id} has no tours; refusing to modify master data.`);

    const actor = users.find((u) => ["admin", "manager", "super_admin", "superadmin"].includes(String(u.role || "").toLowerCase())) || users[0] || null;
    const customerUsers = users.filter((u) => String(u.role || "").toLowerCase() === "customer");
    const paymentUser = customerUsers[0] || actor;
    const guides = staff.filter((s) => s.position === "guide" || s.role === "guide");
    const drivers = staff.filter((s) => s.position === "driver" || s.role === "driver");

    const bookings = [];
    for (let i = 0; i < 12; i += 1) {
      const customer = customers[i % customers.length];
      const tour = tours[(i + tenantIndex * 3) % tours.length];
      const plan = paymentPlans[i];
      const amount = round(Math.max(1500, Number(tour.price || 0) * (1 + (i % 3) * 0.35)));
      const guests = 1 + (i % 5);
      const travelOffset = i < 4 ? -(45 - i * 8) : i < 8 ? 7 + i * 3 : 25 + i * 4;
      const travelDate = daysFromNow(travelOffset);
      const paid = round(amount * plan[2]);
      const paymentMethod = ["MPESA", "CARD", "BANK_TRANSFER", "PESAPAL", "CASH"][i % 5];
      const status = plan[1];
      const booking = new Booking({
        tenantId: tenant._id,
        customer: customer._id,
        user: customer.user || null,
        customerSnapshot: { name: `${customer.firstName} ${customer.lastName}`, email: customer.email, phone: customer.phone },
        contact: { name: `${customer.firstName} ${customer.lastName}`, email: customer.email, phone: customer.phone },
        agent: agents.length ? agents[i % agents.length]._id : null,
        bookingSource: ["website", "agent", "admin", "walk_in", "partner"][i % 5],
        bookingType: i % 5 === 0 ? "corporate" : i % 4 === 0 ? "group" : "individual",
        corporateCompanyName: i % 5 === 0 ? `Kenya Enterprise ${tenantIndex + 1}${i}` : "",
        corporatePin: i % 5 === 0 ? `P0${tenantIndex + 1}8${i}K` : "",
        purchaseOrderNumber: i % 5 === 0 ? `PO-DEMO-${tenantIndex + 1}-${i + 1}` : "",
        paymentTerms: i % 5 === 0 ? "credit" : i % 3 === 0 ? "deposit" : "immediate",
        billingContact: i % 5 === 0 ? { name: "Accounts Department", email: `accounts${i}@demo.co.ke`, phone: "0712000000" } : undefined,
        tour: tour._id,
        travelDate,
        travelers: Array.from({ length: guests }, (_, n) => ({
          name: n === 0 ? `${customer.firstName} ${customer.lastName}` : `${customer.firstName} Guest ${n + 1}`,
          age: 24 + ((i + n) % 35),
          gender: ["male", "female", "other"][(i + n) % 3],
          nationality: "Kenyan",
          passportNumber: `DEMO${tenantIndex + 1}${i}${n}`,
          emergencyContactName: "Demo Emergency Contact",
          emergencyContactPhone: "0712000001",
        })),
        numberOfGuests: guests,
        pickupLocation: i % 2 ? "Nairobi CBD" : "JKIA Terminal 1",
        pickupTime: daysFromNow(travelOffset),
        hotelName: i % 2 ? "Demo Nairobi Hotel" : "Demo Safari Lodge",
        roomNumber: `R-${tenantIndex + 1}${i + 1}`,
        subtotal: amount,
        discountAmount: i % 4 === 0 ? round(amount * 0.05) : 0,
        taxAmount: 0,
        serviceFee: round(amount * 0.025),
        totalAmount: amount,
        commissionRate: agents.length ? 10 : 0,
        commissionAmount: agents.length ? round(amount * 0.10) : 0,
        commissionStatus: i % 4 === 0 ? "paid" : i % 3 === 0 ? "approved" : "pending",
        depositAmount: paid,
        balanceAmount: round(amount - paid),
        paymentMethod,
        paymentStatus: plan[0],
        transactionId: paid ? `DEMO-TXN-${tenantIndex + 1}-${String(i + 1).padStart(3, "0")}` : undefined,
        paymentReference: paid ? `DEMO-REF-${tenantIndex + 1}-${String(i + 1).padStart(3, "0")}` : undefined,
        mpesaReceipt: paymentMethod === "MPESA" && paid ? `DEMO${tenantIndex + 1}${Date.now().toString().slice(-6)}${i}` : "",
        status,
        assignedGuide: guides.length && i % 3 !== 3 ? guides[i % guides.length]._id : null,
        assignedDriver: drivers.length && i % 4 !== 3 ? drivers[i % drivers.length]._id : null,
        assigned: Boolean(guides.length || drivers.length) && !["pending", "refunded"].includes(status),
        createdBy: actor?._id || null,
        updatedBy: actor?._id || null,
        notes: "Synthetic dashboard seed data — not a real customer transaction.",
      });
      if (status === "completed") booking.completedAt = travelDate;
      if (status === "confirmed" || status === "assigned" || status === "ongoing") booking.confirmedAt = new Date(Math.min(Date.now(), travelDate.getTime() - 86400000));
      if (status === "refunded") {
        booking.refundAmount = paid;
        booking.refundStatus = "completed";
        booking.refundReason = "Synthetic dashboard refund record";
      }
      bookings.push(await booking.save());
    }

    const invoices = [];
    const payments = [];
    for (let i = 0; i < bookings.length; i += 1) {
      const booking = bookings[i];
      const paid = round(booking.depositAmount);
      const plan = paymentPlans[i];
      const invoice = await Invoice.create({
        tenantId: tenant._id,
        booking: booking._id,
        customer: booking.customer,
        user: booking.user || paymentUser?._id || actor?._id || null,
        tour: booking.tour,
        agent: booking.agent,
        issueDate: new Date(booking.createdAt || Date.now()),
        dueDate: daysFromNow(plan[0] === "pending" || plan[0] === "partial" ? 14 : -10),
        subtotal: booking.totalAmount,
        discount: booking.discountAmount,
        tax: booking.taxAmount,
        taxRate: 0,
        taxType: "NON_VAT",
        taxMode: "exclusive",
        taxableAmount: booking.totalAmount,
        totalAmount: booking.totalAmount,
        amountPaid: paid,
        balance: round(booking.totalAmount - paid),
        paymentMethod: booking.paymentMethod === "PESAPAL" ? "PESAPAL" : booking.paymentMethod,
        paymentReference: booking.paymentReference || "",
        status: plan[0] === "refunded" ? "refunded" : paid >= booking.totalAmount ? "paid" : paid > 0 ? "partial" : "pending",
        customerSnapshot: booking.customerSnapshot,
        etimsStatus: i % 5 === 0 ? "pending" : "not_configured",
        notes: "Synthetic dashboard seed data — no KRA/eTIMS submission has occurred.",
      });
      invoices.push(invoice);

      if (paid > 0 && paymentUser) {
        const provider = providers[i % providers.length];
        const payment = await Payment.create({
          tenantId: tenant._id,
          customer: paymentUser._id,
          user: booking.user || paymentUser._id,
          booking: booking._id,
          provider: provider[0],
          method: provider[1],
          paymentMethod: booking.paymentMethod,
          amount: paid,
          currency: "KES",
          phone: booking.contact?.phone || "0712000000",
          phoneNumber: booking.contact?.phone || "0712000000",
          status: plan[0] === "refunded" ? "refunded" : "completed",
          transactionId: `DEMO-TXN-${tenantIndex + 1}-${String(i + 1).padStart(3, "0")}`,
          transactionReference: `DEMO-REF-${tenantIndex + 1}-${String(i + 1).padStart(3, "0")}`,
          invoiceNumber: invoice.invoiceNumber,
          mpesaReceiptNumber: provider[0] === "MPESA" ? booking.mpesaReceipt : "",
          paidAt: new Date(booking.createdAt || Date.now()),
          refundedAmount: plan[0] === "refunded" ? paid : 0,
          refundStatus: plan[0] === "refunded" ? "completed" : "none",
          refundedAt: plan[0] === "refunded" ? new Date() : null,
          notes: "Synthetic dashboard seed payment — not a real customer transaction.",
        });
        payments.push(payment);
        booking.payments = [payment._id];
        await booking.save();
      }

      if (booking.agent) {
        await Commission.create({
          tenantId: tenant._id,
          agent: booking.agent,
          booking: booking._id,
          customer: booking.user || paymentUser?._id || null,
          tour: booking.tour,
          bookingAmount: booking.totalAmount,
          rate: booking.commissionRate,
          amount: booking.commissionAmount,
          status: i % 4 === 0 ? "paid" : i % 3 === 0 ? "approved" : "pending",
          paymentMethod: i % 4 === 0 ? "BANK_TRANSFER" : undefined,
          paymentReference: i % 4 === 0 ? `DEMO-COM-${tenantIndex + 1}-${i + 1}` : "",
          paidAt: i % 4 === 0 ? new Date() : null,
          createdBy: actor?._id || null,
          notes: "Synthetic commission for dashboard demonstration.",
        });
      }
    }

    for (let i = 0; i < Math.min(6, suppliers.length, tours.length); i += 1) {
      const supplier = suppliers[i % suppliers.length];
      const tour = tours[i % tours.length];
      const booking = bookings[i % bookings.length];
      const cost = round(Math.max(4500, Number(tour.price || 0) * (0.35 + (i % 3) * 0.1)));
      const po = await PurchaseOrder.create({
        tenantId: tenant._id,
        supplier: supplier._id,
        booking: booking._id,
        tour: tour._id,
        issueDate: daysFromNow(-15 + i),
        expectedDate: daysFromNow(10 + i),
        currency: "KES",
        lines: [{ description: `Tour operating services — ${tour.title}`, quantity: 1, unitCost: cost, taxRate: 0, taxType: "non_vat" }],
        status: ["approved", "submitted", "received"][i % 3],
        approvedBy: actor?._id || null,
        approvedAt: new Date(),
        createdBy: actor?._id || null,
        notes: "Synthetic purchase order for dashboard demonstration.",
      });
      const expense = await Expense.create({
        tenantId: tenant._id,
        category: ["Transport", "Accommodation", "Park fees", "Guide services"][i % 4],
        supplier: supplier._id,
        purchaseOrder: po._id,
        booking: booking._id,
        tour: tour._id,
        supplierName: supplier.name || `Supplier ${i + 1}`,
        description: `Operating cost — ${tour.title}`,
        amount: cost,
        taxAmount: 0,
        currency: "KES",
        expenseDate: daysFromNow(-10 + i),
        paymentMethod: ["BANK_TRANSFER", "MPESA", "CASH"][i % 3],
        paymentReference: `DEMO-EXP-${tenantIndex + 1}-${i + 1}`,
        status: ["paid", "approved", "paid"][i % 3],
        createdBy: actor?._id || null,
        notes: "Synthetic expense for dashboard demonstration.",
      });
      await SupplierPayable.create({
        tenantId: tenant._id,
        supplier: supplier._id,
        purchaseOrder: po._id,
        expense: expense._id,
        booking: booking._id,
        tour: tour._id,
        amount: cost,
        amountPaid: i % 3 === 0 ? cost : round(cost * 0.4),
        dueDate: daysFromNow(i % 3 === 0 ? -2 : 14),
        paymentReference: i % 3 === 0 ? `DEMO-PAY-${tenantIndex + 1}-${i + 1}` : "",
        createdBy: actor?._id || null,
        notes: "Synthetic supplier payable for dashboard demonstration.",
      });
      await TourCost.create({ tenantId: tenant._id, tour: tour._id, booking: booking._id, category: "operational", description: `Cost allocation — ${tour.title}`, amount: cost, currency: "KES", status: "approved", createdBy: actor?._id || null }).catch(() => {});
    }

    if (invoices.length >= 2) {
      await CreditDebitNote.create({ tenantId: tenant._id, type: "credit", originalInvoice: invoices[0]._id, originalInvoiceNumber: invoices[0].invoiceNumber, reason: "Synthetic partial refund adjustment", amount: 500, taxAmount: 0, totalAmount: 500, taxRate: 0, status: "issued", etimsStatus: "not_submitted", createdBy: actor?._id || null });
      await CreditDebitNote.create({ tenantId: tenant._id, type: "debit", originalInvoice: invoices[1]._id, originalInvoiceNumber: invoices[1].invoiceNumber, reason: "Synthetic service adjustment", amount: 750, taxAmount: 0, totalAmount: 750, taxRate: 0, status: "issued", etimsStatus: "not_submitted", createdBy: actor?._id || null });
    }

    for (const customer of customers) {
      const customerBookings = bookings.filter((b) => String(b.customer) === String(customer._id));
      const completed = customerBookings.filter((b) => b.status === "completed").length;
      const spent = round(customerBookings.reduce((sum, b) => sum + Number(b.totalAmount || 0), 0));
      await Customer.updateOne({ tenantId: tenant._id, _id: customer._id }, { $set: { totalBookings: customerBookings.length, completedBookings: completed, cancelledBookings: customerBookings.filter((b) => b.status === "cancelled").length, totalSpent: spent, averageBookingValue: customerBookings.length ? round(spent / customerBookings.length) : 0, lastBookingDate: customerBookings.map((b) => b.createdAt).filter(Boolean).sort((a, b) => b - a)[0] || null, loyaltyPoints: Math.floor(spent / 100) } });
    }

    for (const tour of tours) {
      const activeBookings = bookings.filter((b) => String(b.tour) === String(tour._id) && !["cancelled", "refunded"].includes(b.status));
      const bookedSlots = activeBookings.reduce((sum, b) => sum + Number(b.numberOfGuests || 0), 0);
      await Tour.updateOne({ tenantId: tenant._id, _id: tour._id }, { $set: { "availabilitySettings.bookedSlots": bookedSlots } });
    }

    return { tenant: tenant.name || String(tenant._id), bookings: bookings.length, payments: payments.length, invoices: invoices.length, expenses: Math.min(6, suppliers.length, tours.length) };
  });
}

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing.");
  await mongoose.connect(process.env.MONGODB_URI);

  const tenants = await Organization.find({ isDeleted: { $ne: true } }).sort({ createdAt: 1 }).lean();
  if (tenants.length !== 3) throw new Error(`SAFE STOP: expected exactly 3 active tenants, found ${tenants.length}. No data was changed.`);

  console.log("============================================");
  console.log("GLOBAL TOURS FINANCIAL DASHBOARD SEED");
  console.log("============================================");
  console.log("Preserving all three tenants and master data.");
  console.log("Replacing bookings and transactional/financial demo data only.");

  const results = [];
  for (let i = 0; i < tenants.length; i += 1) results.push(await seedTenant(tenants[i], i));
  console.table(results);
  console.log("Seed complete. All generated transactions are synthetic dashboard/demo records.");
}

main()
  .catch((error) => {
    console.error("Financial dashboard seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close().catch(() => {});
  });
