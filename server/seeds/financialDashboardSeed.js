/**
 * Purpose: financial Dashboard Seed database seed module. Main declarations: round, daysFromNow, seededPaymentAmounts, clearTransactionalData, seedTenant.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load dotenv so this module can use its exported dependencies.
import dotenv from "dotenv";
// Load node:path so this module can use its exported dependencies.
import path from "node:path";
// Load node:url so this module can use its exported dependencies.
import { fileURLToPath } from "node:url";
// Load ../models/Organization.js so this module can use its exported dependencies.
import Organization from "../models/Organization.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Customer.js so this module can use its exported dependencies.
import Customer from "../models/Customer.js";
// Load ../models/Destination.js so this module can use its exported dependencies.
import Destination from "../models/Destination.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/Review.js so this module can use its exported dependencies.
import Review from "../models/Review.js";
// Load ../models/Staff.js so this module can use its exported dependencies.
import Staff from "../models/Staff.js";
// Load ../models/Vehicle.js so this module can use its exported dependencies.
import Vehicle from "../models/Vehicle.js";
// Load ../models/Agent.js so this module can use its exported dependencies.
import Agent from "../models/Agent.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Load ../models/Invoice.js so this module can use its exported dependencies.
import Invoice from "../models/Invoice.js";
// Load ../models/Commission.js so this module can use its exported dependencies.
import Commission from "../models/Commission.js";
// Load ../models/Expense.js so this module can use its exported dependencies.
import Expense from "../models/Expense.js";
// Load ../models/CreditDebitNote.js so this module can use its exported dependencies.
import CreditDebitNote from "../models/CreditDebitNote.js";
// Load ../models/Supplier.js so this module can use its exported dependencies.
import Supplier from "../models/Supplier.js";
// Load ../models/PurchaseOrder.js so this module can use its exported dependencies.
import PurchaseOrder from "../models/PurchaseOrder.js";
// Load ../models/TourCost.js so this module can use its exported dependencies.
import TourCost from "../models/TourCost.js";
// Load ../models/SupplierPayable.js so this module can use its exported dependencies.
import SupplierPayable from "../models/SupplierPayable.js";
// Load ../models/JournalEntry.js so this module can use its exported dependencies.
import JournalEntry from "../models/JournalEntry.js";
// Load ../models/Quotation.js so this module can use its exported dependencies.
import Quotation from "../models/Quotation.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant } from "../tenancy/context.js";
// Load ../services/operationalAccountingService.js so this module can use its exported dependencies.
import { postInvoiceToLedger, postPaymentToLedger, postPaymentRefundToLedger } from "../services/operationalAccountingService.js";

// Perform the side effect or state update expressed on the following line.
dotenv.config();

/*
 * SAFE DEMO/QA DATA REFRESH
 *
 * Preserves the three existing tenants and all existing destinations, tours,
 * customers, users, staff, guides, drivers, agents and other master data.
 * Replaces transactional/financial data so every dashboard has realistic data.
 * This script intentionally refuses to run unless exactly three tenants exist.
 */

// Declare round for use by the surrounding module or function.
const round = (n) => Math.round(Number(n) * 100) / 100;
// Declare daysFromNow for use by the surrounding module or function.
const daysFromNow = (n) => new Date(Date.now() + n * 86400000);

// Define seededPaymentAmounts; its parameters and body implement this operation.
export function seededPaymentAmounts(status, total, paid) {
  // Declare netPaid for use by the surrounding module or function.
  const netPaid = status === "refunded"
    ? 0
    : Math.min(Math.max(0, Number(total) || 0), Math.max(0, Number(paid) || 0));
  // Declare totalAmount for use by the surrounding module or function.
  const totalAmount = Math.max(0, Number(total) || 0);
  // Return the object assembled below to the caller.
  return { amountPaid: netPaid, balance: round(totalAmount - netPaid) };
}

// Declare paymentPlans for use by the surrounding module or function.
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

// Declare providers for use by the surrounding module or function.
const providers = [
  ["MPESA", "mpesa"],
  ["STRIPE", "card"],
  ["BANK", "bank"],
  ["PESAPAL", "pesapal"],
  ["CASH", "cash"],
];

// Define clearTransactionalData; its parameters and body implement this operation.
async function clearTransactionalData(tenantId) {
  // Declare filter for use by the surrounding module or function.
  const filter = { tenantId };
  // Perform the side effect or state update expressed on the following line.
  await Promise.all([
    Booking.deleteMany(filter),
    Payment.deleteMany(filter),
    // Existing reviews refer to the bookings replaced by this refresh.
    Review.deleteMany(filter),
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

// Define seedTenant; its parameters and body implement this operation.
async function seedTenant(tenant, tenantIndex) {
  // Return the result of runWithTenant() to the caller.
  return runWithTenant({ tenantId: tenant._id, role: "manager", bypass: false }, async () => {
    // Perform the side effect or state update expressed on the following line.
    await clearTransactionalData(tenant._id);

    // Declare [customers, tours, users, staff, agents, suppliers, vehicles] for use by the surrounding module or function.
    const [customers, tours, users, staff, agents, suppliers, vehicles] = await Promise.all([
      Customer.find({ isDeleted: { $ne: true } }).limit(30).lean(),
      Tour.find({ isDeleted: { $ne: true }, published: true }).limit(50).lean(),
      User.find({ isDeleted: { $ne: true } }).limit(100).lean(),
      Staff.find({ isDeleted: { $ne: true }, status: "active" }).lean(),
      Agent.find({ isDeleted: { $ne: true } }).lean(),
      Supplier.find({ isDeleted: { $ne: true } }).lean(),
      Vehicle.find({ isDeleted: { $ne: true }, status: { $nin: ["maintenance", "retired"] } }).lean(),
    ]);

    // Check the condition (!customers.length) and run the matching branch.
    if (!customers.length) throw new Error(`Tenant ${tenant.name || tenant._id} has no customers; refusing to invent replacement master data.`);
    // Check the condition (!tours.length) and run the matching branch.
    if (!tours.length) throw new Error(`Tenant ${tenant.name || tenant._id} has no tours; refusing to modify master data.`);
    // Check the condition (!suppliers.length) and run the matching branch.
    if (!suppliers.length) throw new Error(`Tenant ${tenant.name || tenant._id} has no suppliers; refusing to create transactional records without supplier master data.`);

    // Declare actor for use by the surrounding module or function.
    const actor = users.find((u) => ["admin", "manager", "super_admin", "superadmin"].includes(String(u.role || "").toLowerCase())) || users[0] || null;
    // Declare customerUsers for use by the surrounding module or function.
    const customerUsers = users.filter((u) => String(u.role || "").toLowerCase() === "customer");
    // Declare paymentUser for use by the surrounding module or function.
    const paymentUser = customerUsers[0] || actor;
    // Declare guides for use by the surrounding module or function.
    const guides = staff.filter((s) => s.position === "guide" || s.role === "guide");
    // Declare drivers for use by the surrounding module or function.
    const drivers = staff.filter((s) => s.position === "driver" || s.role === "driver");
    // Declare vehicleByTour for use by the surrounding module or function.
    const vehicleByTour = new Map(vehicles.filter((vehicle) => vehicle.assignedTour)
      .map((vehicle) => [String(vehicle.assignedTour), vehicle]));

    // Declare bookings for use by the surrounding module or function.
    const bookings = [];
    // Deliberately vary synthetic transaction volume by tenant so the three demo dashboards do not share identical totals.
    // Declare bookingCountBySlug for use by the surrounding module or function.
    const bookingCountBySlug = { "hussein-mboya": 9, "amani-trails": 12, "demo-safari": 7 };
    // Declare bookingCount for use by the surrounding module or function.
    const bookingCount = bookingCountBySlug[String(tenant.slug || "").toLowerCase()] ?? [9, 12, 7][tenantIndex];
    // Repeat the enclosed work for each required iteration.
    for (let i = 0; i < bookingCount; i += 1) {
      // Declare customer for use by the surrounding module or function.
      const customer = customers[i % customers.length];
      // Declare tour for use by the surrounding module or function.
      const tour = tours[(i + tenantIndex * 3) % tours.length];
      // Declare plan for use by the surrounding module or function.
      const plan = paymentPlans[(i + tenantIndex * 3) % paymentPlans.length];
      // Declare amount for use by the surrounding module or function.
      const amount = round(Math.max(1500, Number(tour.price || 0) * (1 + (i % 3) * 0.35)));
      // Declare guests for use by the surrounding module or function.
      const guests = 1 + (i % 5);
      // Declare status for use by the surrounding module or function.
      const status = plan[1];
      // Declare travelOffset for use by the surrounding module or function.
      const travelOffset = status === "completed"
        ? -(Number(tour.durationDetails?.days || tour.durationDays || 1) + 5 + i)
        : status === "ongoing" ? -1
          : ["pending", "confirmed", "assigned"].includes(status) ? 7 + i * 3
            : i < 8 ? 7 + i * 3 : 25 + i * 4;
      // Declare travelDate for use by the surrounding module or function.
      const travelDate = daysFromNow(travelOffset);
      // Declare paid for use by the surrounding module or function.
      const paid = round(amount * plan[2]);
      // Declare paymentMethod for use by the surrounding module or function.
      const paymentMethod = ["MPESA", "CARD", "BANK_TRANSFER", "CARD", "CASH"][i % 5];
      // Declare booking for use by the surrounding module or function.
      const booking = new Booking({
        tenantId: tenant._id,
        bookingNumber: `DEMO-${String(tenantIndex + 1).padStart(2, "0")}-${String(i + 1).padStart(4, "0")}`,
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
        amountPaid: seededPaymentAmounts(plan[0], amount, paid).amountPaid,
        balanceAmount: seededPaymentAmounts(plan[0], amount, paid).balance,
        paymentMethod,
        paymentStatus: plan[0],
        transactionId: paid ? `DEMO-TXN-${tenantIndex + 1}-${String(i + 1).padStart(3, "0")}` : undefined,
        paymentReference: paid ? `DEMO-REF-${tenantIndex + 1}-${String(i + 1).padStart(3, "0")}` : undefined,
        mpesaReceipt: paymentMethod === "MPESA" && paid ? `DEMO${tenantIndex + 1}${Date.now().toString().slice(-6)}${i}` : "",
        status,
        assignedGuide: guides.length && i % 3 !== 3 ? guides[i % guides.length]._id : null,
        assignedDriver: drivers.length && i % 4 !== 3 ? drivers[i % drivers.length]._id : null,
        assignedVehicle: vehicleByTour.get(String(tour._id))?._id || null,
        assigned: Boolean(guides.length || drivers.length) && !["pending", "refunded"].includes(status),
        createdBy: actor?._id || null,
        updatedBy: actor?._id || null,
        notes: "Synthetic dashboard seed data — not a real customer transaction.",
      });
      // Check the condition (status === "completed") and run the matching branch.
      if (status === "completed") {
        // Declare durationDays for use by the surrounding module or function.
        const durationDays = Math.max(1, Number(tour.durationDetails?.days || tour.durationDays || 1));
        // Perform the side effect or state update expressed on the following line.
        booking.completedAt = new Date(travelDate.getTime() + durationDays * 86400000);
      }
      // Check the condition (["confirmed", "assigned", "ongoing"].includes(status)) and run the matching branch.
      if (["confirmed", "assigned", "ongoing"].includes(status)) booking.confirmedAt = new Date(Math.min(Date.now(), travelDate.getTime() - 86400000));
      // Check the condition (status === "refunded") and run the matching branch.
      if (status === "refunded") {
        // Perform the side effect or state update expressed on the following line.
        booking.refundAmount = paid;
        // Perform the side effect or state update expressed on the following line.
        booking.refundStatus = "completed";
        // Perform the side effect or state update expressed on the following line.
        booking.refundReason = "Synthetic dashboard refund record";
      }
      // Perform the side effect or state update expressed on the following line.
      bookings.push(await booking.save());
    }

    // Declare invoices for use by the surrounding module or function.
    const invoices = [];
    // Declare payments for use by the surrounding module or function.
    const payments = [];
    // Repeat the enclosed work for each required iteration.
    for (let i = 0; i < bookings.length; i += 1) {
      // Declare booking for use by the surrounding module or function.
      const booking = bookings[i];
      // Declare paid for use by the surrounding module or function.
      const paid = round(booking.depositAmount);
      // Reuse the exact plan used to create this booking. Tenant-specific plan rotation must not desynchronize invoice/payment status from the booking.
      // Declare plan for use by the surrounding module or function.
      const plan = [booking.paymentStatus, booking.status, 0];
      // Declare invoice for use by the surrounding module or function.
      const invoice = await Invoice.create({
        tenantId: tenant._id,
        booking: booking._id,
        customer: booking.customer,
        user: booking.user || paymentUser?._id || actor?._id || null,
        tour: booking.tour,
        agent: booking.agent,
        invoiceNumber: `INV-DEMO-${tenantIndex + 1}-${String(i + 1).padStart(3, "0")}`,
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
        ...seededPaymentAmounts(plan[0], booking.totalAmount, paid),
        paymentMethod: booking.paymentMethod,
        paymentReference: booking.paymentReference || "",
        status: plan[0] === "refunded" ? "refunded" : paid >= booking.totalAmount ? "paid" : paid > 0 ? "partial" : "pending",
        customerSnapshot: booking.customerSnapshot,
        etimsStatus: i % 5 === 0 ? "pending" : "not_configured",
        notes: "Synthetic dashboard seed data — no KRA/eTIMS submission has occurred.",
      });
      // Perform the side effect or state update expressed on the following line.
      invoices.push(invoice);
      // Perform the side effect or state update expressed on the following line.
      await postInvoiceToLedger(invoice);

      // Check the condition (paid > 0 && paymentUser) and run the matching branch.
      if (paid > 0 && paymentUser) {
        // Declare provider for use by the surrounding module or function.
        const provider = providers[i % providers.length];
        // Declare payment for use by the surrounding module or function.
        const payment = await Payment.create({
          tenantId: tenant._id,
          customer: booking.user || paymentUser._id,
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
        // Perform the side effect or state update expressed on the following line.
        payments.push(payment);
        // Perform the side effect or state update expressed on the following line.
        await postPaymentToLedger(payment);
        // Check the condition (plan[0] === "refunded") and run the matching branch.
        if (plan[0] === "refunded") await postPaymentRefundToLedger(payment, paid, `DEMO-REFUND-${tenantIndex + 1}-${i + 1}`);
        // Perform the side effect or state update expressed on the following line.
        booking.payments = [payment._id];
        // Perform the side effect or state update expressed on the following line.
        await booking.save();
      }

      // Check the condition (booking.agent) and run the matching branch.
      if (booking.agent) {
        // Perform the side effect or state update expressed on the following line.
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

    // Repeat the enclosed work for each required iteration.
    for (let i = 0; i < Math.min(6, suppliers.length, tours.length); i += 1) {
      // Declare supplier for use by the surrounding module or function.
      const supplier = suppliers[i % suppliers.length];
      // Declare tour for use by the surrounding module or function.
      const tour = tours[i % tours.length];
      // Declare booking for use by the surrounding module or function.
      const booking = bookings[i % bookings.length];
      // Declare cost for use by the surrounding module or function.
      const cost = round(Math.max(4500, Number(tour.price || 0) * (0.35 + (i % 3) * 0.1)));
      // Declare po for use by the surrounding module or function.
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
      // Declare expense for use by the surrounding module or function.
      const expense = await Expense.create({
        tenantId: tenant._id,
        category: ["Transport", "Accommodation", "Park fees", "Guide services"][i % 4],
        supplier: supplier._id,
        purchaseOrder: po._id,
        booking: booking._id,
        tour: tour._id,
        supplierName: supplier.tradingName || supplier.legalName || `Supplier ${i + 1}`,
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
      // Perform the side effect or state update expressed on the following line.
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
      // Perform the side effect or state update expressed on the following line.
      await TourCost.create({
        tenantId: tenant._id,
        tour: tour._id,
        booking: booking._id,
        category: ["transport", "accommodation", "guide", "supplier"][i % 4],
        description: `Cost allocation — ${tour.title}`,
        supplier: supplier._id,
        purchaseOrder: po._id,
        quantity: 1,
        unitCost: cost,
        taxAmount: 0,
        costDate: daysFromNow(-10 + i),
        status: i % 3 === 0 ? "actual" : i % 3 === 1 ? "committed" : "estimated",
        createdBy: actor?._id || null,
        notes: "Synthetic tour cost for dashboard demonstration.",
      });
    }

    // Check the condition (invoices.length >= 2) and run the matching branch.
    if (invoices.length >= 2) {
      // Perform the side effect or state update expressed on the following line.
      await CreditDebitNote.create({ tenantId: tenant._id, type: "credit", originalInvoice: invoices[0]._id, originalInvoiceNumber: invoices[0].invoiceNumber, reason: "Synthetic partial refund adjustment", amount: 500, taxAmount: 0, totalAmount: 500, taxRate: 0, status: "issued", etimsStatus: "not_submitted", createdBy: actor?._id || null });
      // Perform the side effect or state update expressed on the following line.
      await CreditDebitNote.create({ tenantId: tenant._id, type: "debit", originalInvoice: invoices[1]._id, originalInvoiceNumber: invoices[1].invoiceNumber, reason: "Synthetic service adjustment", amount: 750, taxAmount: 0, totalAmount: 750, taxRate: 0, status: "issued", etimsStatus: "not_submitted", createdBy: actor?._id || null });
    }

    // Repeat the enclosed work for each required iteration.
    for (const customer of customers) {
      // Declare customerBookings for use by the surrounding module or function.
      const customerBookings = bookings.filter((b) => String(b.customer) === String(customer._id));
      // Declare completed for use by the surrounding module or function.
      const completed = customerBookings.filter((b) => b.status === "completed").length;
      // Declare spent for use by the surrounding module or function.
      const spent = round(customerBookings.reduce((sum, b) => sum + Number(b.amountPaid || 0), 0));
      // Perform the side effect or state update expressed on the following line.
      await Customer.updateOne({ _id: customer._id, tenantId: tenant._id }, { $set: { totalBookings: customerBookings.length, completedBookings: completed, cancelledBookings: customerBookings.filter((b) => b.status === "cancelled").length, totalSpent: spent, averageBookingValue: customerBookings.length ? round(spent / customerBookings.length) : 0, lastBookingDate: customerBookings.map((b) => b.createdAt).filter(Boolean).sort((a, b) => b - a)[0] || null, loyaltyPoints: Math.floor(spent / 100) } });
    }

    // Repeat the enclosed work for each required iteration.
    for (const tour of tours) {
      // Declare activeBookings for use by the surrounding module or function.
      const activeBookings = bookings.filter((b) => String(b.tour) === String(tour._id) && !["cancelled", "refunded"].includes(b.status));
      // Declare bookedSlots for use by the surrounding module or function.
      const bookedSlots = activeBookings.reduce((sum, b) => sum + Number(b.numberOfGuests || 0), 0);
      // Declare tourBookings for use by the surrounding module or function.
      const tourBookings = bookings.filter((booking) => String(booking.tour) === String(tour._id));
      // Declare availability for use by the surrounding module or function.
      const availability = (tour.availability || []).map((slot) => ({
        ...(typeof slot.toObject === "function" ? slot.toObject() : slot),
        bookedSlots,
      }));
      // Perform the side effect or state update expressed on the following line.
      await Tour.updateOne({ _id: tour._id, tenantId: tenant._id }, {
        $set: {
          "availabilitySettings.bookedSlots": bookedSlots,
          availability,
          totalBookings: tourBookings.length,
          ...(vehicleByTour.has(String(tour._id))
            ? { assignedVehicle: vehicleByTour.get(String(tour._id))._id }
            : {}),
        },
      });
    }

    // Rebuild reviews against eligible bookings after the old booking rows
    // have been removed, then derive public tour review counters from those rows.
    // Declare reviewBookings for use by the surrounding module or function.
    const reviewBookings = bookings.filter((booking) => booking.status === "completed").slice(0, 3);
    // Repeat the enclosed work for each required iteration.
    for (const [index, booking] of reviewBookings.entries()) {
      // Perform the side effect or state update expressed on the following line.
      await Review.create({
        tenantId: tenant._id,
        user: booking.user,
        customer: booking.user,
        tour: booking.tour,
        booking: booking._id,
        rating: index === 1 ? 4 : 5,
        title: ["Excellent trip", "A memorable journey", "Great local guide"][index],
        comment: "Synthetic demo feedback attached to a completed booking.",
        recommend: true,
        verified: true,
        approved: true,
      });
    }

    // Declare reviewStats for use by the surrounding module or function.
    const reviewStats = await Review.aggregate([
      { $match: { tenantId: tenant._id, approved: true } },
      { $group: { _id: "$tour", totalReviews: { $sum: 1 }, averageRating: { $avg: "$rating" } } },
    ]);
    // Declare reviewsByTour for use by the surrounding module or function.
    const reviewsByTour = new Map(reviewStats.map((row) => [String(row._id), row]));
    // Declare bookingsByDestination for use by the surrounding module or function.
    const bookingsByDestination = new Map();
    // Declare toursByDestination for use by the surrounding module or function.
    const toursByDestination = new Map();
    // Declare destinationReviewTotals for use by the surrounding module or function.
    const destinationReviewTotals = new Map();
    // Declare destinationRatingSums for use by the surrounding module or function.
    const destinationRatingSums = new Map();
    // Repeat the enclosed work for each required iteration.
    for (const tour of tours) {
      // Declare stats for use by the surrounding module or function.
      const stats = reviewsByTour.get(String(tour._id));
      // Perform the side effect or state update expressed on the following line.
      await Tour.updateOne({ _id: tour._id, tenantId: tenant._id }, {
        $set: {
          totalReviews: Number(stats?.totalReviews || 0),
          averageRating: Number(stats?.averageRating || 0),
        },
      });
      // Declare destinationId for use by the surrounding module or function.
      const destinationId = String(tour.destination);
      // Perform the side effect or state update expressed on the following line.
      toursByDestination.set(destinationId, (toursByDestination.get(destinationId) || 0) + 1);
      // Declare reviewCount for use by the surrounding module or function.
      const reviewCount = Number(stats?.totalReviews || 0);
      // Perform the side effect or state update expressed on the following line.
      destinationReviewTotals.set(destinationId,
        (destinationReviewTotals.get(destinationId) || 0) + reviewCount);
      // Perform the side effect or state update expressed on the following line.
      destinationRatingSums.set(destinationId,
        (destinationRatingSums.get(destinationId) || 0) + Number(stats?.averageRating || 0) * reviewCount);
      // Declare destinationBookings for use by the surrounding module or function.
      const destinationBookings = bookings.filter((booking) =>
        String(booking.tour) === String(tour._id));
      // Perform the side effect or state update expressed on the following line.
      bookingsByDestination.set(destinationId,
        (bookingsByDestination.get(destinationId) || 0) + destinationBookings.length);
    }
    // Repeat the enclosed work for each required iteration.
    for (const [destinationId, totalTours] of toursByDestination) {
      // Perform the side effect or state update expressed on the following line.
      await Destination.updateOne(
        { _id: destinationId, tenantId: tenant._id },
        { $set: {
          totalTours,
          totalBookings: bookingsByDestination.get(destinationId) || 0,
          totalReviews: destinationReviewTotals.get(destinationId) || 0,
          averageRating: destinationReviewTotals.get(destinationId)
            ? round(destinationRatingSums.get(destinationId) / destinationReviewTotals.get(destinationId))
            : 0,
        } },
      );
    }

    // Declare tourById for use by the surrounding module or function.
    const tourById = new Map(tours.map((tour) => [String(tour._id), tour]));
    // Declare convertedQuotes for use by the surrounding module or function.
    const convertedQuotes = await Quotation.find({ tenantId: tenant._id, status: "converted", isDeleted: { $ne: true } });
    // Repeat the enclosed work for each required iteration.
    for (const quote of convertedQuotes) {
      // Declare booking for use by the surrounding module or function.
      const booking = bookings.find((row) => String(row.customer) === String(quote.customer)
        && String(row.tour) === String(quote.tour))
        || bookings.find((row) => String(row.customer) === String(quote.customer))
        || bookings[0];
      // Check the condition (!booking) and run the matching branch.
      if (!booking) continue;
      // Declare tour for use by the surrounding module or function.
      const tour = tourById.get(String(booking.tour));
      // Declare total for use by the surrounding module or function.
      const total = Number(booking.totalAmount || 0);
      // Declare quantity for use by the surrounding module or function.
      const quantity = Math.max(1, Number(booking.numberOfGuests || 1));
      // Perform the side effect or state update expressed on the following line.
      quote.booking = booking._id;
      // Perform the side effect or state update expressed on the following line.
      quote.customer = booking.customer;
      // Perform the side effect or state update expressed on the following line.
      quote.tour = booking.tour;
      // Perform the side effect or state update expressed on the following line.
      quote.agent = booking.agent || quote.agent;
      // Perform the side effect or state update expressed on the following line.
      quote.items = [{
        tenantId: tenant._id,
        name: tour?.title || "Demo tour booking",
        category: "Other",
        description: "Accepted demo quotation converted to the linked booking.",
        quantity,
        unitPrice: round(total / quantity),
        total,
      }];
      // Perform the side effect or state update expressed on the following line.
      quote.subtotal = total;
      // Perform the side effect or state update expressed on the following line.
      quote.tax = 0;
      // Perform the side effect or state update expressed on the following line.
      quote.discount = 0;
      // Perform the side effect or state update expressed on the following line.
      quote.grandTotal = total;
      // Perform the side effect or state update expressed on the following line.
      quote.currency = "KES";
      // Perform the side effect or state update expressed on the following line.
      await quote.save();
    }

    // Declare actualExpenseCount for use by the surrounding module or function.
    const actualExpenseCount = await Expense.countDocuments({});
    // Declare actualPurchaseOrderCount for use by the surrounding module or function.
    const actualPurchaseOrderCount = await PurchaseOrder.countDocuments({});
    // Declare actualSupplierPayableCount for use by the surrounding module or function.
    const actualSupplierPayableCount = await SupplierPayable.countDocuments({});
    // Declare actualTourCostCount for use by the surrounding module or function.
    const actualTourCostCount = await TourCost.countDocuments({});
    // Check the condition (actualExpenseCount < 1) and run the matching branch.
    if (actualExpenseCount < 1) throw new Error(`Tenant ${tenant.name || tenant._id} produced zero expenses after seeding; refusing to report a successful populated financial dashboard.`);
    // Check the condition (actualPurchaseOrderCount < 1) and run the matching branch.
    if (actualPurchaseOrderCount < 1) throw new Error(`Tenant ${tenant.name || tenant._id} produced zero purchase orders after seeding.`);
    // Check the condition (actualSupplierPayableCount < 1) and run the matching branch.
    if (actualSupplierPayableCount < 1) throw new Error(`Tenant ${tenant.name || tenant._id} produced zero supplier payables after seeding.`);
    // Check the condition (actualTourCostCount < 1) and run the matching branch.
    if (actualTourCostCount < 1) throw new Error(`Tenant ${tenant.name || tenant._id} produced zero tour costs after seeding.`);

    // Return the object assembled below to the caller.
    return {
      tenant: tenant.name,
      bookings: bookings.length,
      payments: payments.length,
      invoices: invoices.length,
      expenses: actualExpenseCount,
      purchaseOrders: actualPurchaseOrderCount,
      supplierPayables: actualSupplierPayableCount,
      tourCosts: actualTourCostCount,
    };
  });
}

// Define main; its parameters and body implement this operation.
export async function main() {
  // Prevent Booking.post('save') from auto-creating a second payment while this seed writes its explicit ledger records.
  // Perform the side effect or state update expressed on the following line.
  process.env.DEMO_SEED_MODE = "true";
  // Check the condition (!process.env.MONGODB_URI) and run the matching branch.
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required.");
  // Perform the side effect or state update expressed on the following line.
  await mongoose.connect(process.env.MONGODB_URI, {
    maxPoolSize: 5,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
    socketTimeoutMS: 120000,
    waitQueueTimeoutMS: 30000,
  });
  // Declare tenants for use by the surrounding module or function.
  const tenants = await Organization.find({ isDeleted: { $ne: true } }).sort({ createdAt: 1 }).lean();
  // Check the condition (tenants.length !== 3) and run the matching branch.
  if (tenants.length !== 3) throw new Error(`Expected exactly 3 active tenants, found ${tenants.length}. Refusing to seed.`);

  // Perform the side effect or state update expressed on the following line.
  console.log("Verified exactly 3 active tenants. Master data will be preserved.");
  // Perform the side effect or state update expressed on the following line.
  console.log("============================================");
  // Perform the side effect or state update expressed on the following line.
  console.log("GLOBAL TOURS FINANCIAL DASHBOARD SEED");
  // Perform the side effect or state update expressed on the following line.
  console.log("============================================");
  // Perform the side effect or state update expressed on the following line.
  console.log("Preserving all three tenants and master data.");
  // Perform the side effect or state update expressed on the following line.
  console.log("Replacing bookings and transactional/financial demo data only.");

  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare results for use by the surrounding module or function.
    const results = [];
    // Repeat the enclosed work for each required iteration.
    for (let i = 0; i < tenants.length; i += 1) results.push(await seedTenant(tenants[i], i));
    // Perform the side effect or state update expressed on the following line.
    console.table(results);
    // Perform the side effect or state update expressed on the following line.
    console.log("Seed complete. All generated transactions are synthetic dashboard/demo records.");
  } finally {
    // Perform the side effect or state update expressed on the following line.
    await mongoose.disconnect();
  }
}

// Check the condition (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(imp) and run the matching branch.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  // Perform the side effect or state update expressed on the following line.
  main().catch((error) => {
    // Perform the side effect or state update expressed on the following line.
    console.error(`Financial dashboard seed failed: ${error.message}`);
    // Perform the side effect or state update expressed on the following line.
    process.exitCode = 1;
  });
}
