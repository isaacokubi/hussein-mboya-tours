import "dotenv/config";
import mongoose from "mongoose";
import Organization from "../models/Organization.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Invoice from "../models/Invoice.js";
import Customer from "../models/Customer.js";
import Supplier from "../models/Supplier.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import Expense from "../models/Expense.js";
import TourCost from "../models/TourCost.js";
import SupplierPayable from "../models/SupplierPayable.js";
import Tour from "../models/Tour.js";
import Destination from "../models/Destination.js";
import Staff from "../models/Staff.js";
import Vehicle from "../models/Vehicle.js";
import Agent from "../models/Agent.js";
import JournalEntry from "../models/JournalEntry.js";
import ChartOfAccount from "../models/ChartOfAccount.js";
import { runWithTenant } from "../tenancy/context.js";

const EXPECTED_HOST = "cluster0.cdtxzts.mongodb.net";
const EXPECTED_DATABASE = "husseindb";
const TENANT_SLUGS = ["hussein-mboya", "amani-trails", "demo-safari"];
const active = { isDeleted: { $ne: true } };

function validateReadOnlyTarget(uri) {
  if (!uri) throw new Error("MONGODB_URI is required; connection value will not be printed.");
  let parsed;
  try {
    parsed = new URL(uri);
  } catch {
    throw new Error("MONGODB_URI is not a valid MongoDB URI.");
  }
  const database = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  if (!["mongodb:", "mongodb+srv:"].includes(parsed.protocol)
      || parsed.hostname.toLowerCase() !== EXPECTED_HOST
      || database !== EXPECTED_DATABASE) {
    throw new Error("Refusing to run: this audit is restricted to the expected Atlas host and husseindb database.");
  }
}

async function count(Model, tenantId, extra = {}) {
  return Model.countDocuments({ tenantId, ...active, ...extra });
}

async function grouped(Model, tenantId, field) {
  return Model.aggregate([
    { $match: { tenantId, ...active } },
    { $group: { _id: { $ifNull: [`$${field}`, "(missing)"] }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
}

async function postedRevenue(tenantId) {
  const [result] = await JournalEntry.aggregate([
    { $match: { tenantId, status: "posted" } },
    { $unwind: "$lines" },
    {
      $lookup: {
        from: ChartOfAccount.collection.name,
        localField: "lines.account",
        foreignField: "_id",
        as: "account",
      },
    },
    { $unwind: "$account" },
    { $match: { "account.tenantId": tenantId, "account.type": "revenue", "account.active": true } },
    {
      $group: {
        _id: null,
        total: { $sum: { $subtract: [{ $ifNull: ["$lines.credit", 0] }, { $ifNull: ["$lines.debit", 0] }] } },
        journalEntries: { $addToSet: "$_id" },
      },
    },
    { $project: { _id: 0, total: { $round: ["$total", 2] }, journalCount: { $size: "$journalEntries" } } },
  ]);
  return result || { total: 0, journalCount: 0 };
}


const auditId = (value) => value == null ? null : String(value._id || value);
const auditMoney = (value) => Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

async function auditFinancialIntegrity(tenantId) {
  const [bookings, paymentRows, invoices, tours, destinations, customers, users, staff, vehicles, agents, suppliers, purchaseOrders, expenses, tourCosts, supplierPayables, journals, accounts] = await Promise.all([
    Booking.find({ tenantId, ...active }).select("_id bookingNumber customer user tour agent assignedGuide assignedDriver assignedVehicle totalAmount amountPaid balanceAmount").lean(),
    Payment.find({ tenantId, ...active }).select("_id booking customer user amount status refundedAmount").lean(),
    Invoice.find({ tenantId, ...active }).select("_id invoiceNumber booking customer user tour agent totalAmount amountPaid balance").lean(),
    Tour.find({ tenantId, ...active }).select("_id").lean(),
    Destination.find({ tenantId, ...active }).select("_id").lean(),
    Customer.find({ tenantId, ...active }).select("_id").lean(),
    User.find({ tenantId, ...active }).select("_id").lean(),
    Staff.find({ tenantId, ...active }).select("_id").lean(),
    Vehicle.find({ tenantId, ...active }).select("_id").lean(),
    Agent.find({ tenantId, ...active }).select("_id").lean(),
    Supplier.find({ tenantId, ...active }).select("_id").lean(),
    PurchaseOrder.find({ tenantId, ...active }).select("_id").lean(),
    Expense.find({ tenantId, ...active }).select("_id").lean(),
    TourCost.find({ tenantId, ...active }).select("_id").lean(),
    SupplierPayable.find({ tenantId, ...active }).select("_id").lean(),
    JournalEntry.find({ tenantId, status: "posted" }).select("_id sourceType sourceId lines").lean(),
    ChartOfAccount.find({ tenantId }).select("_id active").lean(),
  ]);
  const issues = [];
  const owned = rows => new Set(rows.map(row => auditId(row._id)));
  const sets = { booking: owned(bookings), tour: owned(tours), customer: owned(customers), user: owned(users), staff: owned(staff), vehicle: owned(vehicles), agent: owned(agents), supplier: owned(suppliers), po: owned(purchaseOrders), expense: owned(expenses), account: owned(accounts) };
  const checkRefs = (rows, field, set, code) => {
    const bad = [];
    for (const row of rows) {
      const value = row[field];
      if (value == null || value === "") continue;
      for (const item of (Array.isArray(value) ? value : [value])) if (!set.has(auditId(item))) bad.push({ recordId: auditId(row), referenceId: auditId(item), field });
    }
    if (bad.length) issues.push({ code, count: bad.length, examples: bad.slice(0, 8) });
  };
  for (const [rows, field, set, code] of [
    [bookings,"customer",sets.customer,"BOOKING_CUSTOMER_TENANT"],[bookings,"user",sets.user,"BOOKING_USER_TENANT"],[bookings,"tour",sets.tour,"BOOKING_TOUR_TENANT"],[bookings,"agent",sets.agent,"BOOKING_AGENT_TENANT"],[bookings,"assignedGuide",sets.staff,"BOOKING_GUIDE_TENANT"],[bookings,"assignedDriver",sets.staff,"BOOKING_DRIVER_TENANT"],[bookings,"assignedVehicle",sets.vehicle,"BOOKING_VEHICLE_TENANT"],
    [paymentRows,"booking",sets.booking,"PAYMENT_BOOKING_TENANT"],[paymentRows,"customer",sets.user,"PAYMENT_CUSTOMER_TENANT"],[paymentRows,"user",sets.user,"PAYMENT_USER_TENANT"],
    [invoices,"booking",sets.booking,"INVOICE_BOOKING_TENANT"],[invoices,"customer",sets.customer,"INVOICE_CUSTOMER_TENANT"],[invoices,"user",sets.user,"INVOICE_USER_TENANT"],[invoices,"tour",sets.tour,"INVOICE_TOUR_TENANT"],[invoices,"agent",sets.agent,"INVOICE_AGENT_TENANT"],
    [purchaseOrders,"supplier",sets.supplier,"PO_SUPPLIER_TENANT"],[purchaseOrders,"booking",sets.booking,"PO_BOOKING_TENANT"],[purchaseOrders,"tour",sets.tour,"PO_TOUR_TENANT"],
    [expenses,"supplier",sets.supplier,"EXPENSE_SUPPLIER_TENANT"],[expenses,"purchaseOrder",sets.po,"EXPENSE_PO_TENANT"],[expenses,"booking",sets.booking,"EXPENSE_BOOKING_TENANT"],[expenses,"tour",sets.tour,"EXPENSE_TOUR_TENANT"],
    [tourCosts,"supplier",sets.supplier,"TOUR_COST_SUPPLIER_TENANT"],[tourCosts,"purchaseOrder",sets.po,"TOUR_COST_PO_TENANT"],[tourCosts,"booking",sets.booking,"TOUR_COST_BOOKING_TENANT"],[tourCosts,"tour",sets.tour,"TOUR_COST_TOUR_TENANT"],
    [supplierPayables,"supplier",sets.supplier,"PAYABLE_SUPPLIER_TENANT"],[supplierPayables,"purchaseOrder",sets.po,"PAYABLE_PO_TENANT"],[supplierPayables,"expense",sets.expense,"PAYABLE_EXPENSE_TENANT"],[supplierPayables,"booking",sets.booking,"PAYABLE_BOOKING_TENANT"],[supplierPayables,"tour",sets.tour,"PAYABLE_TOUR_TENANT"],
  ]) checkRefs(rows,field,set,code);

  const netByBooking = new Map();
  for (const payment of paymentRows) {
    if (!payment.booking || !["completed","refunded"].includes(payment.status)) continue;
    const key = auditId(payment.booking);
    netByBooking.set(key,auditMoney((netByBooking.get(key)||0)+Math.max(0,Number(payment.amount||0)-Number(payment.refundedAmount||0))));
  }
  const bookingDiffs=[];
  for (const booking of bookings) {
    const paid=auditMoney(booking.amountPaid), net=auditMoney(netByBooking.get(auditId(booking._id))||0);
    const balance=auditMoney(Math.max(0,Number(booking.totalAmount||0)-paid));
    if(Math.abs(paid-net)>0.01) bookingDiffs.push({booking:booking.bookingNumber,recordedPaidKsh:paid,netSuccessfulPaymentsKsh:net});
    if(Math.abs(auditMoney(booking.balanceAmount)-balance)>0.01) bookingDiffs.push({booking:booking.bookingNumber,recordedBalanceKsh:auditMoney(booking.balanceAmount),expectedBalanceKsh:balance});
  }
  if(bookingDiffs.length) issues.push({code:"BOOKING_PAYMENT_RECONCILIATION",count:bookingDiffs.length,examples:bookingDiffs.slice(0,8)});
  const invoiceDiffs=[];
  for(const invoice of invoices) {
    if(!invoice.booking) continue;
    const booking=bookings.find(row=>auditId(row._id)===auditId(invoice.booking));
    if(!booking) continue;
    const paid=Math.min(auditMoney(invoice.totalAmount),auditMoney(netByBooking.get(auditId(booking._id))||0));
    const balance=auditMoney(Math.max(0,Number(invoice.totalAmount||0)-paid));
    if(Math.abs(auditMoney(invoice.amountPaid)-paid)>0.01||Math.abs(auditMoney(invoice.balance)-balance)>0.01) invoiceDiffs.push({invoice:invoice.invoiceNumber||auditId(invoice),recordedPaidKsh:auditMoney(invoice.amountPaid),expectedPaidKsh:paid,recordedBalanceKsh:auditMoney(invoice.balance),expectedBalanceKsh:balance});
  }
  if(invoiceDiffs.length) issues.push({code:"INVOICE_PAYMENT_RECONCILIATION",count:invoiceDiffs.length,examples:invoiceDiffs.slice(0,8)});
  const unbalanced=[],foreignAccounts=[];
  for(const journal of journals) {
    const debit=auditMoney((journal.lines||[]).reduce((sum,line)=>sum+Number(line.debit||0),0));
    const credit=auditMoney((journal.lines||[]).reduce((sum,line)=>sum+Number(line.credit||0),0));
    if(debit<=0||Math.abs(debit-credit)>0.01) unbalanced.push({journalId:auditId(journal),sourceType:journal.sourceType,debitKsh:debit,creditKsh:credit});
    for(const line of journal.lines||[]) if(!sets.account.has(auditId(line.account))) foreignAccounts.push({journalId:auditId(journal),accountId:auditId(line.account)});
  }
  if(unbalanced.length) issues.push({code:"POSTED_JOURNAL_UNBALANCED",count:unbalanced.length,examples:unbalanced.slice(0,8)});
  if(foreignAccounts.length) issues.push({code:"JOURNAL_ACCOUNT_TENANT",count:foreignAccounts.length,examples:foreignAccounts.slice(0,8)});
  return {
    status:issues.length?"FAIL":"PASS",
    issueCount:issues.reduce((sum,issue)=>sum+issue.count,0),
    issues,
    grossPaymentValueKsh:auditMoney(paymentRows.reduce((sum,payment)=>sum+Number(payment.amount||0),0)),
    netSuccessfulPaymentValueKsh:auditMoney(paymentRows.filter(payment=>["completed","refunded"].includes(payment.status)).reduce((sum,payment)=>sum+Math.max(0,Number(payment.amount||0)-Number(payment.refundedAmount||0)),0)),
    refundedPaymentValueKsh:auditMoney(paymentRows.reduce((sum,payment)=>sum+Math.max(0,Number(payment.refundedAmount||0)),0)),
    catalogueCounts:{tours:tours.length,destinations:destinations.length},
  };
}

async function auditTenant(tenant) {
  const tenantId = tenant._id;
  return runWithTenant({ tenantId, role: "manager", bypass: false }, async () => {
  const [
    users, customers, staff, guides, drivers, agents, vehicles, availableVehicles,
    tours, destinations, bookings, payments, bookingStatuses, paymentStatuses,
    bookingValue, paymentValue, recentBookings, syntheticBookings, revenue,
  ] = await Promise.all([
    count(User, tenantId, { status: { $ne: "blocked" } }),
    count(User, tenantId, { $or: [{ role: "customer" }, { legacyRole: "customer" }], status: { $ne: "blocked" } }),
    count(Staff, tenantId, { isActive: { $ne: false }, status: { $nin: ["inactive", "suspended"] } }),
    count(Staff, tenantId, { isActive: { $ne: false }, status: { $nin: ["inactive", "suspended"] }, $or: [{ position: "guide" }, { role: "guide" }] }),
    count(Staff, tenantId, { isActive: { $ne: false }, status: { $nin: ["inactive", "suspended"] }, $or: [{ position: "driver" }, { role: "driver" }] }),
    count(Agent, tenantId, { status: { $ne: "inactive" } }),
    count(Vehicle, tenantId, { isActive: { $ne: false } }),
    count(Vehicle, tenantId, { isActive: { $ne: false }, status: "available" }),
    count(Tour, tenantId),
    count(Destination, tenantId),
    count(Booking, tenantId),
    count(Payment, tenantId),
    grouped(Booking, tenantId, "status"),
    grouped(Payment, tenantId, "status"),
    Booking.aggregate([{ $match: { tenantId, ...active } }, { $group: { _id: null, total: { $sum: { $ifNull: ["$totalAmount", 0] } } } }]),
    Payment.aggregate([{ $match: { tenantId, ...active } }, { $group: { _id: null, total: { $sum: { $ifNull: ["$amount", 0] } } } }]),
    Booking.find({ tenantId, ...active }).sort({ createdAt: -1 }).limit(5)
      .select("bookingNumber status paymentStatus totalAmount tenantId").lean(),
    Booking.countDocuments({ tenantId, bookingNumber: /^(?:TEST|DEMO)-/i }),
    postedRevenue(tenantId),
  ]);

  const integrity = await auditFinancialIntegrity(tenantId);
  return {
    tenant: tenant.slug,
    counts: { users, customers, staff, guides, drivers, agents, vehicles, availableVehicles, tours, destinations, bookings, payments },
    bookingStatuses: Object.fromEntries(bookingStatuses.map((row) => [String(row._id), row.count])),
    paymentStatuses: Object.fromEntries(paymentStatuses.map((row) => [String(row._id), row.count])),
    bookingValueKsh: Number(bookingValue[0]?.total || 0),
    paymentValueKsh: Number(paymentValue[0]?.total || 0),
    postedRevenueKsh: Number(revenue.total || 0),
    postedJournalCount: Number(revenue.journalCount || 0),
    testPrefixedBookings: syntheticBookings,
    integrity,
    recentBookings: recentBookings.map((row) => ({
      reference: row.bookingNumber,
      status: row.status,
      paymentStatus: row.paymentStatus || "missing",
      amountKsh: Number(row.totalAmount || 0),
    })),
  };
  });
}

async function main() {
  validateReadOnlyTarget(process.env.MONGODB_URI);
  await mongoose.connect(process.env.MONGODB_URI, { maxPoolSize: 3, serverSelectionTimeoutMS: 15000 });
  try {
    const tenants = await Organization.find({
      slug: { $in: TENANT_SLUGS },
      isDeleted: { $ne: true },
    }).select("_id slug name").lean();

    const found = new Set(tenants.map((tenant) => tenant.slug));
    const missing = TENANT_SLUGS.filter((slug) => !found.has(slug));
    if (missing.length) throw new Error(`Expected tenant(s) missing from husseindb: ${missing.join(", ")}`);
    if (tenants.length !== TENANT_SLUGS.length) throw new Error("Unexpected tenant set; refusing to audit an ambiguous tenant configuration.");

    const results = [];
    for (const slug of TENANT_SLUGS) {
      const tenant = tenants.find((item) => item.slug === slug);
      results.push(await auditTenant(tenant));
    }
    console.log("READ-ONLY TENANT AND FINANCIAL INTEGRITY AUDIT — husseindb");
    console.log("No records were inserted, updated, or deleted.");
    const totalIssues = results.reduce((sum, row) => sum + Number(row.integrity?.issueCount || 0), 0);
    console.log(JSON.stringify({ overallStatus: totalIssues ? "FAIL" : "PASS", totalIssues, tenants: results }, null, 2));
    if (totalIssues) process.exitCode = 2;
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(`Tenant dashboard audit failed: ${error.message}`);
  process.exitCode = 1;
});
