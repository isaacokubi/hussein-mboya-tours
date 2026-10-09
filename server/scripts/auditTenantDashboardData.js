import "dotenv/config";
import mongoose from "mongoose";
import Organization from "../models/Organization.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Tour from "../models/Tour.js";
import Destination from "../models/Destination.js";
import Staff from "../models/Staff.js";
import Vehicle from "../models/Vehicle.js";
import Agent from "../models/Agent.js";
import JournalEntry from "../models/JournalEntry.js";
import ChartOfAccount from "../models/ChartOfAccount.js";

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

async function auditTenant(tenant) {
  const tenantId = tenant._id;
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
    Booking.countDocuments({ tenantId, bookingNumber: /^TEST-/i }),
    postedRevenue(tenantId),
  ]);

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
    recentBookings: recentBookings.map((row) => ({
      reference: row.bookingNumber,
      status: row.status,
      paymentStatus: row.paymentStatus || "missing",
      amountKsh: Number(row.totalAmount || 0),
    })),
  };
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
    console.log("READ-ONLY TENANT DASHBOARD AUDIT — husseindb");
    console.log("No records were inserted, updated, or deleted.");
    console.log(JSON.stringify(results, null, 2));
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(`Tenant dashboard audit failed: ${error.message}`);
  process.exitCode = 1;
});
