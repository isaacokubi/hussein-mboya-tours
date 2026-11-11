/**
 * Purpose: audit Tenant Dashboard Data operational script. Main declarations: validateReadOnlyTarget, count, grouped, postedRevenue, auditId.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import "dotenv/config";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../models/Organization.js so this module can use its exported dependencies.
import Organization from "../models/Organization.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Load ../models/Invoice.js so this module can use its exported dependencies.
import Invoice from "../models/Invoice.js";
// Load ../models/Customer.js so this module can use its exported dependencies.
import Customer from "../models/Customer.js";
// Load ../models/Supplier.js so this module can use its exported dependencies.
import Supplier from "../models/Supplier.js";
// Load ../models/PurchaseOrder.js so this module can use its exported dependencies.
import PurchaseOrder from "../models/PurchaseOrder.js";
// Load ../models/Expense.js so this module can use its exported dependencies.
import Expense from "../models/Expense.js";
// Load ../models/TourCost.js so this module can use its exported dependencies.
import TourCost from "../models/TourCost.js";
// Load ../models/SupplierPayable.js so this module can use its exported dependencies.
import SupplierPayable from "../models/SupplierPayable.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/Destination.js so this module can use its exported dependencies.
import Destination from "../models/Destination.js";
// Load ../models/Staff.js so this module can use its exported dependencies.
import Staff from "../models/Staff.js";
// Load ../models/Vehicle.js so this module can use its exported dependencies.
import Vehicle from "../models/Vehicle.js";
// Load ../models/Agent.js so this module can use its exported dependencies.
import Agent from "../models/Agent.js";
// Load ../models/JournalEntry.js so this module can use its exported dependencies.
import JournalEntry from "../models/JournalEntry.js";
// Load ../models/ChartOfAccount.js so this module can use its exported dependencies.
import ChartOfAccount from "../models/ChartOfAccount.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant } from "../tenancy/context.js";

// Declare EXPECTED_HOST for use by the surrounding module or function.
const EXPECTED_HOST = "cluster0.cdtxzts.mongodb.net";
// Declare EXPECTED_DATABASE for use by the surrounding module or function.
const EXPECTED_DATABASE = "husseindb";
// Declare TENANT_SLUGS for use by the surrounding module or function.
const TENANT_SLUGS = ["hussein-mboya", "amani-trails", "demo-safari"];
// Declare active for use by the surrounding module or function.
const active = { isDeleted: { $ne: true } };

// Define validateReadOnlyTarget; its parameters and body implement this operation.
function validateReadOnlyTarget(uri) {
  // Check the condition (!uri) and run the matching branch.
  if (!uri) throw new Error("MONGODB_URI is required; connection value will not be printed.");
  // Declare parsed for use by the surrounding module or function.
  let parsed;
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    parsed = new URL(uri);
  } catch {
    // Stop the current operation by raising a new Error instance.
    throw new Error("MONGODB_URI is not a valid MongoDB URI.");
  }
  // Declare database for use by the surrounding module or function.
  const database = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  // Check the condition (!["mongodb:", "mongodb+srv:"].includes(parsed.protocol) || parsed.host) and run the matching branch.
  if (!["mongodb:", "mongodb+srv:"].includes(parsed.protocol)
      || parsed.hostname.toLowerCase() !== EXPECTED_HOST
      || database !== EXPECTED_DATABASE) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Refusing to run: this audit is restricted to the expected Atlas host and husseindb database.");
  }
}

// Define count; its parameters and body implement this operation.
async function count(Model, tenantId, extra = {}) {
  // Return the result of Model.countDocuments() to the caller.
  return Model.countDocuments({ tenantId, ...active, ...extra });
}

// Define grouped; its parameters and body implement this operation.
async function grouped(Model, tenantId, field) {
  // Return the result of Model.aggregate() to the caller.
  return Model.aggregate([
    { $match: { tenantId, ...active } },
    { $group: { _id: { $ifNull: [`$${field}`, "(missing)"] }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
}

// Define postedRevenue; its parameters and body implement this operation.
async function postedRevenue(tenantId) {
  // Declare [result] for use by the surrounding module or function.
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
  // Return the expression shown below to the caller.
  return result || { total: 0, journalCount: 0 };
}

// Declare auditId for use by the surrounding module or function.
const auditId = (value) => value == null ? null : String(value._id || value);
// Declare auditMoney for use by the surrounding module or function.
const auditMoney = (value) => Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

// Define auditFinancialIntegrity; its parameters and body implement this operation.
async function auditFinancialIntegrity(tenantId) {
  // Declare [bookings, paymentRows, invoices, tours, destinations, customers, users, staff, vehicles, agents, suppliers, purchaseOrders, expenses, tourCosts, supplierPayables, journals, accounts] for use by the surrounding module or function.
  const [bookings, paymentRows, invoices, tours, destinations, customers, users, staff, vehicles, agents, suppliers, purchaseOrders, expenses, tourCosts, supplierPayables, journals, accounts] = await Promise.all([
    Booking.find({ tenantId, ...active }).select("_id bookingNumber customer user tour agent assignedGuide assignedDriver assignedVehicle totalAmount amountPaid balanceAmount").lean(),
    Payment.find({ tenantId, ...active }).select("_id booking customer user amount status refundedAmount invoiceNumber").lean(),
    Invoice.find({ tenantId, ...active }).select("_id invoiceNumber booking customer user tour agent totalAmount tax amountPaid balance status").lean(),
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
    ChartOfAccount.find({ tenantId }).select("_id code type active").lean(),
  ]);
  // Declare issues for use by the surrounding module or function.
  const issues = [];
  // Declare owned for use by the surrounding module or function.
  const owned = rows => new Set(rows.map(row => auditId(row._id)));
  // Declare sets for use by the surrounding module or function.
  const sets = { booking: owned(bookings), tour: owned(tours), customer: owned(customers), user: owned(users), staff: owned(staff), vehicle: owned(vehicles), agent: owned(agents), supplier: owned(suppliers), po: owned(purchaseOrders), expense: owned(expenses), account: owned(accounts) };
  // Declare checkRefs for use by the surrounding module or function.
  const checkRefs = (rows, field, set, code) => {
    // Declare bad for use by the surrounding module or function.
    const bad = [];
    // Repeat the enclosed work for each required iteration.
    for (const row of rows) {
      // Declare value for use by the surrounding module or function.
      const value = row[field];
      // Check the condition (value == null || value === "") and run the matching branch.
      if (value == null || value === "") continue;
      // Repeat the enclosed work for each required iteration.
      for (const item of (Array.isArray(value) ? value : [value])) if (!set.has(auditId(item))) bad.push({ recordId: auditId(row), referenceId: auditId(item), field });
    }
    // Check the condition (bad.length) and run the matching branch.
    if (bad.length) issues.push({ code, count: bad.length, examples: bad.slice(0, 8) });
  };
  // Repeat the enclosed work for each required iteration.
  for (const [rows, field, set, code] of [
    [bookings,"customer",sets.customer,"BOOKING_CUSTOMER_TENANT"],[bookings,"user",sets.user,"BOOKING_USER_TENANT"],[bookings,"tour",sets.tour,"BOOKING_TOUR_TENANT"],[bookings,"agent",sets.agent,"BOOKING_AGENT_TENANT"],[bookings,"assignedGuide",sets.staff,"BOOKING_GUIDE_TENANT"],[bookings,"assignedDriver",sets.staff,"BOOKING_DRIVER_TENANT"],[bookings,"assignedVehicle",sets.vehicle,"BOOKING_VEHICLE_TENANT"],
    [paymentRows,"booking",sets.booking,"PAYMENT_BOOKING_TENANT"],[paymentRows,"customer",sets.user,"PAYMENT_CUSTOMER_TENANT"],[paymentRows,"user",sets.user,"PAYMENT_USER_TENANT"],
    [invoices,"booking",sets.booking,"INVOICE_BOOKING_TENANT"],[invoices,"customer",sets.customer,"INVOICE_CUSTOMER_TENANT"],[invoices,"user",sets.user,"INVOICE_USER_TENANT"],[invoices,"tour",sets.tour,"INVOICE_TOUR_TENANT"],[invoices,"agent",sets.agent,"INVOICE_AGENT_TENANT"],
    [purchaseOrders,"supplier",sets.supplier,"PO_SUPPLIER_TENANT"],[purchaseOrders,"booking",sets.booking,"PO_BOOKING_TENANT"],[purchaseOrders,"tour",sets.tour,"PO_TOUR_TENANT"],
    [expenses,"supplier",sets.supplier,"EXPENSE_SUPPLIER_TENANT"],[expenses,"purchaseOrder",sets.po,"EXPENSE_PO_TENANT"],[expenses,"booking",sets.booking,"EXPENSE_BOOKING_TENANT"],[expenses,"tour",sets.tour,"EXPENSE_TOUR_TENANT"],
    [tourCosts,"supplier",sets.supplier,"TOUR_COST_SUPPLIER_TENANT"],[tourCosts,"purchaseOrder",sets.po,"TOUR_COST_PO_TENANT"],[tourCosts,"booking",sets.booking,"TOUR_COST_BOOKING_TENANT"],[tourCosts,"tour",sets.tour,"TOUR_COST_TOUR_TENANT"],
    [supplierPayables,"supplier",sets.supplier,"PAYABLE_SUPPLIER_TENANT"],[supplierPayables,"purchaseOrder",sets.po,"PAYABLE_PO_TENANT"],[supplierPayables,"expense",sets.expense,"PAYABLE_EXPENSE_TENANT"],[supplierPayables,"booking",sets.booking,"PAYABLE_BOOKING_TENANT"],[supplierPayables,"tour",sets.tour,"PAYABLE_TOUR_TENANT"],
  ]) checkRefs(rows,field,set,code);

  // Declare netByBooking for use by the surrounding module or function.
  const netByBooking = new Map();
  // Repeat the enclosed work for each required iteration.
  for (const payment of paymentRows) {
    // Check the condition (!payment.booking || !["completed","refunded"].includes(payment.status)) and run the matching branch.
    if (!payment.booking || !["completed","refunded"].includes(payment.status)) continue;
    // Declare key for use by the surrounding module or function.
    const key = auditId(payment.booking);
    // Perform the side effect or state update expressed on the following line.
    netByBooking.set(key,auditMoney((netByBooking.get(key)||0)+Math.max(0,Number(payment.amount||0)-Number(payment.refundedAmount||0))));
  }
  // Declare bookingDiffs for use by the surrounding module or function.
  const bookingDiffs=[];
  // Repeat the enclosed work for each required iteration.
  for (const booking of bookings) {
    // Declare paid, net for use by the surrounding module or function.
    const paid=auditMoney(booking.amountPaid), net=auditMoney(netByBooking.get(auditId(booking._id))||0);
    // Declare balance for use by the surrounding module or function.
    const balance=auditMoney(Math.max(0,Number(booking.totalAmount||0)-paid));
    // Check the condition (Math.abs(paid-net)>0.01) and run the matching branch.
    if(Math.abs(paid-net)>0.01) bookingDiffs.push({booking:booking.bookingNumber,recordedPaidKsh:paid,netSuccessfulPaymentsKsh:net});
    // Check the condition (Math.abs(auditMoney(booking.balanceAmount)-balance)>0.01) and run the matching branch.
    if(Math.abs(auditMoney(booking.balanceAmount)-balance)>0.01) bookingDiffs.push({booking:booking.bookingNumber,recordedBalanceKsh:auditMoney(booking.balanceAmount),expectedBalanceKsh:balance});
  }
  // Check the condition (bookingDiffs.length) and run the matching branch.
  if(bookingDiffs.length) issues.push({code:"BOOKING_PAYMENT_RECONCILIATION",count:bookingDiffs.length,examples:bookingDiffs.slice(0,8)});
  // Declare invoiceDiffs for use by the surrounding module or function.
  const invoiceDiffs=[];
  // Repeat the enclosed work for each required iteration.
  for(const invoice of invoices) {
    // Check the condition (!invoice.booking) and run the matching branch.
    if(!invoice.booking) continue;
    // Declare booking for use by the surrounding module or function.
    const booking=bookings.find(row=>auditId(row._id)===auditId(invoice.booking));
    // Check the condition (!booking) and run the matching branch.
    if(!booking) continue;
    // Declare paid for use by the surrounding module or function.
    const paid=Math.min(auditMoney(invoice.totalAmount),auditMoney(netByBooking.get(auditId(booking._id))||0));
    // Declare balance for use by the surrounding module or function.
    const balance=auditMoney(Math.max(0,Number(invoice.totalAmount||0)-paid));
    // Check the condition (Math.abs(auditMoney(invoice.amountPaid)-paid)>0.01||Math.abs(auditMone) and run the matching branch.
    if(Math.abs(auditMoney(invoice.amountPaid)-paid)>0.01||Math.abs(auditMoney(invoice.balance)-balance)>0.01) invoiceDiffs.push({invoice:invoice.invoiceNumber||auditId(invoice),recordedPaidKsh:auditMoney(invoice.amountPaid),expectedPaidKsh:paid,recordedBalanceKsh:auditMoney(invoice.balance),expectedBalanceKsh:balance});
  }
  // Check the condition (invoiceDiffs.length) and run the matching branch.
  if(invoiceDiffs.length) issues.push({code:"INVOICE_PAYMENT_RECONCILIATION",count:invoiceDiffs.length,examples:invoiceDiffs.slice(0,8)});
  // Declare unbalanced, foreignAccounts for use by the surrounding module or function.
  const unbalanced=[],foreignAccounts=[];
  // Repeat the enclosed work for each required iteration.
  for(const journal of journals) {
    // Declare debit for use by the surrounding module or function.
    const debit=auditMoney((journal.lines||[]).reduce((sum,line)=>sum+Number(line.debit||0),0));
    // Declare credit for use by the surrounding module or function.
    const credit=auditMoney((journal.lines||[]).reduce((sum,line)=>sum+Number(line.credit||0),0));
    // Check the condition (debit<=0||Math.abs(debit-credit)>0.01) and run the matching branch.
    if(debit<=0||Math.abs(debit-credit)>0.01) unbalanced.push({journalId:auditId(journal),sourceType:journal.sourceType,debitKsh:debit,creditKsh:credit});
    // Repeat the enclosed work for each required iteration.
    for(const line of journal.lines||[]) if(!sets.account.has(auditId(line.account))) foreignAccounts.push({journalId:auditId(journal),accountId:auditId(line.account)});
  }
  // Check the condition (unbalanced.length) and run the matching branch.
  if(unbalanced.length) issues.push({code:"POSTED_JOURNAL_UNBALANCED",count:unbalanced.length,examples:unbalanced.slice(0,8)});

  // Check the condition (foreignAccounts.length) and run the matching branch.
  if(foreignAccounts.length) issues.push({code:"JOURNAL_ACCOUNT_TENANT",count:foreignAccounts.length,examples:foreignAccounts.slice(0,8)});

  // Declare accountById for use by the surrounding module or function.
  const accountById = new Map(accounts.map(account => [auditId(account._id), account]));
  // Declare invoiceJournalIssues for use by the surrounding module or function.
  const invoiceJournalIssues = [];
  // Repeat the enclosed work for each required iteration.
  for (const invoice of invoices) {
    // Check the condition (["draft", "cancelled"].includes(invoice.status) || Number(invoice.tota) and run the matching branch.
    if (["draft", "cancelled"].includes(invoice.status) || Number(invoice.totalAmount || 0) <= 0) continue;
    // Declare journal for use by the surrounding module or function.
    const journal = journals.find(row => row.sourceType === "invoice" && auditId(row.sourceId) === auditId(invoice._id));
    // Check the condition (!journal) and run the matching branch.
    if (!journal) {
      // Perform the side effect or state update expressed on the following line.
      invoiceJournalIssues.push({ invoice: invoice.invoiceNumber || auditId(invoice), issue: "missing posted invoice journal" });
      // Skip the remainder of this iteration and continue with the next one.
      continue;
    }
    // Declare actualRevenue for use by the surrounding module or function.
    const actualRevenue = auditMoney((journal.lines || []).reduce((sum, line) => {
      // Declare account for use by the surrounding module or function.
      const account = accountById.get(auditId(line.account));
      // Return the expression shown below to the caller.
      return sum + (account?.type === "revenue" ? Number(line.credit || 0) - Number(line.debit || 0) : 0);
    }, 0));
    // Declare total for use by the surrounding module or function.
    const total = Math.max(0, auditMoney(invoice.totalAmount));
    // Declare tax for use by the surrounding module or function.
    const tax = Math.max(0, Math.min(total, auditMoney(invoice.tax)));
    // Declare expectedRevenue for use by the surrounding module or function.
    const expectedRevenue = auditMoney(total - tax);
    // Check the condition (Math.abs(actualRevenue - expectedRevenue) > 0.01) and run the matching branch.
    if (Math.abs(actualRevenue - expectedRevenue) > 0.01) {
      // Perform the side effect or state update expressed on the following line.
      invoiceJournalIssues.push({ invoice: invoice.invoiceNumber || auditId(invoice), expectedRevenueKsh: expectedRevenue, postedRevenueKsh: actualRevenue });
    }
  }
  // Check the condition (invoiceJournalIssues.length) and run the matching branch.
  if (invoiceJournalIssues.length) issues.push({ code: "INVOICE_REVENUE_POSTING", count: invoiceJournalIssues.length, examples: invoiceJournalIssues.slice(0, 8) });

  // Declare refundJournalIssues for use by the surrounding module or function.
  const refundJournalIssues = [];
  // Repeat the enclosed work for each required iteration.
  for (const journal of journals.filter(row => ["payment_refund", "payment_refund_correction"].includes(row.sourceType))) {
    // Declare lineTotals for use by the surrounding module or function.
    const lineTotals = (journal.lines || []).reduce((totals, line) => {
      // Declare account for use by the surrounding module or function.
      const account = accountById.get(auditId(line.account));
      // Check the condition (account?.type === "revenue") and run the matching branch.
      if (account?.type === "revenue") totals.revenueDebit += Number(line.debit || 0) - Number(line.credit || 0);
      // Check the condition (["1000", "1010", "1020", "1030"].includes(account?.code)) and run the matching branch.
      if (["1000", "1010", "1020", "1030"].includes(account?.code)) totals.cashCredit += Number(line.credit || 0) - Number(line.debit || 0);
      // Check the condition (account?.code === "1100") and run the matching branch.
      if (account?.code === "1100") totals.receivableDebit += Number(line.debit || 0);
      // Return the value of totals to the caller.
      return totals;
    }, { revenueDebit: 0, cashCredit: 0, receivableDebit: 0 });
    // Check the condition (lineTotals.revenueDebit <= 0 || lineTotals.cashCredit <= 0 || lineTota) and run the matching branch.
    if (lineTotals.revenueDebit <= 0 || lineTotals.cashCredit <= 0 || lineTotals.receivableDebit > 0.01) {
      // Perform the side effect or state update expressed on the following line.
      refundJournalIssues.push({ journalId: auditId(journal), sourceType: journal.sourceType, revenueDebitKsh: auditMoney(lineTotals.revenueDebit), cashCreditKsh: auditMoney(lineTotals.cashCredit), receivableDebitKsh: auditMoney(lineTotals.receivableDebit) });
    }
  }
  // Check the condition (refundJournalIssues.length) and run the matching branch.
  if (refundJournalIssues.length) issues.push({ code: "REFUND_JOURNAL_ACCOUNTING", count: refundJournalIssues.length, examples: refundJournalIssues.slice(0, 8) });
  // Return the object assembled below to the caller.
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

// Define auditTenant; its parameters and body implement this operation.
async function auditTenant(tenant) {
  // Declare tenantId for use by the surrounding module or function.
  const tenantId = tenant._id;
  // Return the result of runWithTenant() to the caller.
  return runWithTenant({ tenantId, role: "manager", bypass: false }, async () => {
  // Declare [ users, customers, staff, guides, drivers, agents, vehicles, availableVehicles, tours, destinations, bookings, payments, bookingStatuses, paymentStatuses, syntheticBookings, revenue, ] for use by the surrounding module or function.
  const [
    users, customers, staff, guides, drivers, agents, vehicles, availableVehicles,
    tours, destinations, bookings, payments, bookingStatuses, paymentStatuses,
    syntheticBookings, revenue,
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
    Booking.countDocuments({ tenantId, bookingNumber: /^(?:TEST|DEMO)-/i }),
    postedRevenue(tenantId),
  ]);

  // Declare integrity for use by the surrounding module or function.
  const integrity = await auditFinancialIntegrity(tenantId);
  // Return the object assembled below to the caller.
  return {
    tenant: tenant.slug,
    counts: { users, customers, staff, guides, drivers, agents, vehicles, availableVehicles, tours, destinations, bookings, payments },
    bookingStatuses: Object.fromEntries(bookingStatuses.map((row) => [String(row._id), row.count])),
    paymentStatuses: Object.fromEntries(paymentStatuses.map((row) => [String(row._id), row.count])),
    testPrefixedBookings: syntheticBookings,
    postedJournalCount: Number(revenue.journalCount || 0),
    integrity: {
      status: integrity.status,
      issueCount: integrity.issueCount,
      issueSummary: integrity.issues.map(({ code, count }) => ({ code, count })),
      catalogueCounts: integrity.catalogueCounts,
    },
  };
  });
}

// Define main; its parameters and body implement this operation.
async function main() {
  // Perform the side effect or state update expressed on the following line.
  validateReadOnlyTarget(process.env.MONGODB_URI);
  // Perform the side effect or state update expressed on the following line.
  await mongoose.connect(process.env.MONGODB_URI, { maxPoolSize: 3, serverSelectionTimeoutMS: 15000 });
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenants for use by the surrounding module or function.
    const tenants = await Organization.find({
      slug: { $in: TENANT_SLUGS },
      isDeleted: { $ne: true },
    }).select("_id slug name").lean();

    // Declare found for use by the surrounding module or function.
    const found = new Set(tenants.map((tenant) => tenant.slug));
    // Declare missing for use by the surrounding module or function.
    const missing = TENANT_SLUGS.filter((slug) => !found.has(slug));
    // Check the condition (missing.length) and run the matching branch.
    if (missing.length) throw new Error(`Expected tenant(s) missing from husseindb: ${missing.join(", ")}`);
    // Check the condition (tenants.length !== TENANT_SLUGS.length) and run the matching branch.
    if (tenants.length !== TENANT_SLUGS.length) throw new Error("Unexpected tenant set; refusing to audit an ambiguous tenant configuration.");

    // Declare results for use by the surrounding module or function.
    const results = [];
    // Repeat the enclosed work for each required iteration.
    for (const slug of TENANT_SLUGS) {
      // Declare tenant for use by the surrounding module or function.
      const tenant = tenants.find((item) => item.slug === slug);
      // Perform the side effect or state update expressed on the following line.
      results.push(await auditTenant(tenant));
    }
    // Perform the side effect or state update expressed on the following line.
    console.log("READ-ONLY TENANT AND FINANCIAL INTEGRITY AUDIT — husseindb");
    // Perform the side effect or state update expressed on the following line.
    console.log("No records were inserted, updated, or deleted.");
    // Declare totalIssues for use by the surrounding module or function.
    const totalIssues = results.reduce((sum, row) => sum + Number(row.integrity?.issueCount || 0), 0);
    // Perform the side effect or state update expressed on the following line.
    console.log(JSON.stringify({ overallStatus: totalIssues ? "FAIL" : "PASS", totalIssues, tenants: results }, null, 2));
    // Check the condition (totalIssues) and run the matching branch.
    if (totalIssues) process.exitCode = 2;
  } finally {
    // Perform the side effect or state update expressed on the following line.
    await mongoose.disconnect();
  }
}

// Perform the side effect or state update expressed on the following line.
main().catch((error) => {
  // Perform the side effect or state update expressed on the following line.
  console.error(`Tenant dashboard audit failed: ${error.message}`);
  // Perform the side effect or state update expressed on the following line.
  process.exitCode = 1;
});
