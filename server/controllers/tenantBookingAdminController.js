/**
 * Purpose: tenant Booking Admin Controller HTTP controller. Main declarations: populateBookings, refId, loadOwnership, normalizeEmail, loadEmailTenantOwnership.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Customer.js so this module can use its exported dependencies.
import Customer from "../models/Customer.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/Staff.js so this module can use its exported dependencies.
import Staff from "../models/Staff.js";
// Load ../models/Vehicle.js so this module can use its exported dependencies.
import Vehicle from "../models/Vehicle.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../constants/bookingConstants.js so this module can use its exported dependencies.
import { BOOKING_STATUSES, BOOKING_PAYMENT_STATUSES } from "../constants/bookingConstants.js";

// Declare populateBookings for use by the surrounding module or function.
const populateBookings = (query) => query
  .populate("customer", "_id name email phone user tenantId")
  .populate("user", "_id name email phone tenantId")
  .populate("tour", "_id title destination price discountPrice durationDays tenantId")
  .populate("assignedGuide", "_id name email phone tenantId")
  .populate("assignedDriver", "_id name email phone tenantId")
  .populate("assignedVehicle", "_id name registrationNumber plateNumber tenantId");

// Declare refId for use by the surrounding module or function.
const refId = (value) => {
  // Check the condition (!value) and run the matching branch.
  if (!value) return null;
  // Check the condition (typeof value === "object" && value._id) and run the matching branch.
  if (typeof value === "object" && value._id) return value._id;
  // Return the value of value to the caller.
  return value;
};

// Declare loadOwnership for use by the surrounding module or function.
const loadOwnership = async (model, ids, tenantId) => {
  // Declare validIds for use by the surrounding module or function.
  const validIds = [...new Set(ids.filter((id) => id && mongoose.Types.ObjectId.isValid(id)).map(String))]
    .map((id) => new mongoose.Types.ObjectId(id));
  // Check the condition (!validIds.length) and run the matching branch.
  if (!validIds.length) return new Map();
  // Declare rows for use by the surrounding module or function.
  const rows = await model.collection.find(
    { _id: { $in: validIds }, tenantId: new mongoose.Types.ObjectId(tenantId) },
    { projection: { _id: 1, tenantId: 1 } },
  ).toArray();
  // Return a new Map instance to the caller.
  return new Map(rows.map((row) => [String(row._id), row.tenantId ? String(row.tenantId) : null]));
};

// Declare normalizeEmail for use by the surrounding module or function.
const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

// Declare loadEmailTenantOwnership for use by the surrounding module or function.
const loadEmailTenantOwnership = async (emails, tenantId) => {
  // Declare normalized for use by the surrounding module or function.
  const normalized = [...new Set(emails.map(normalizeEmail).filter(Boolean))];
  // Check the condition (!normalized.length) and run the matching branch.
  if (!normalized.length) return new Map();

  // Declare [customerRows, userRows] for use by the surrounding module or function.
  const [customerRows, userRows] = await Promise.all([
    Customer.collection.find(
      { email: { $in: normalized }, tenantId: new mongoose.Types.ObjectId(tenantId) },
      { projection: { email: 1, tenantId: 1 } },
    ).toArray(),
    User.collection.find(
      { email: { $in: normalized }, tenantId: new mongoose.Types.ObjectId(tenantId) },
      { projection: { email: 1, tenantId: 1 } },
    ).toArray(),
  ]);

  // Declare ownership for use by the surrounding module or function.
  const ownership = new Map();
  // Repeat the enclosed work for each required iteration.
  for (const row of [...customerRows, ...userRows]) {
    // Declare email for use by the surrounding module or function.
    const email = normalizeEmail(row.email);
    // Check the condition (!email || !row.tenantId) and run the matching branch.
    if (!email || !row.tenantId) continue;
    // Check the condition (!ownership.has(email)) and run the matching branch.
    if (!ownership.has(email)) ownership.set(email, new Set());
    // Perform the side effect or state update expressed on the following line.
    ownership.get(email).add(String(row.tenantId));
  }
  // Return the value of ownership to the caller.
  return ownership;
};

// Declare getReferenceOwnership for use by the surrounding module or function.
const getReferenceOwnership = async (bookings, tenantId) => {
  // Declare customerIds for use by the surrounding module or function.
  const customerIds = bookings.map((b) => refId(b.customer)).filter(Boolean);
  // Declare userIds for use by the surrounding module or function.
  const userIds = bookings.map((b) => refId(b.user)).filter(Boolean);
  // Declare tourIds for use by the surrounding module or function.
  const tourIds = bookings.map((b) => refId(b.tour)).filter(Boolean);
  // Declare guideIds for use by the surrounding module or function.
  const guideIds = bookings.map((b) => refId(b.assignedGuide)).filter(Boolean);
  // Declare driverIds for use by the surrounding module or function.
  const driverIds = bookings.map((b) => refId(b.assignedDriver)).filter(Boolean);
  // Declare vehicleIds for use by the surrounding module or function.
  const vehicleIds = bookings.map((b) => refId(b.assignedVehicle)).filter(Boolean);
  // Declare emails for use by the surrounding module or function.
  const emails = bookings.flatMap((b) => [
    b?.customerSnapshot?.email,
    b?.contact?.email,
    b?.billingContact?.email,
  ]);

  // Declare [customers, users, tours, guides, drivers, vehicles, emailOwners] for use by the surrounding module or function.
  const [customers, users, tours, guides, drivers, vehicles, emailOwners] = await Promise.all([
    loadOwnership(Customer, customerIds, tenantId),
    loadOwnership(User, userIds, tenantId),
    loadOwnership(Tour, tourIds, tenantId),
    loadOwnership(Staff, guideIds, tenantId),
    loadOwnership(Staff, driverIds, tenantId),
    loadOwnership(Vehicle, vehicleIds, tenantId),
    loadEmailTenantOwnership(emails, tenantId),
  ]);
  // Return the object assembled below to the caller.
  return { customers, users, tours, guides, drivers, vehicles, emailOwners };
};

// Declare snapshotIdentityBelongsToTenant for use by the surrounding module or function.
const snapshotIdentityBelongsToTenant = (booking, tenantId, emailOwners) => {
  // Declare expected for use by the surrounding module or function.
  const expected = String(tenantId);
  // Declare emails for use by the surrounding module or function.
  const emails = [
    booking?.customerSnapshot?.email,
    booking?.contact?.email,
    booking?.billingContact?.email,
  ].map(normalizeEmail).filter(Boolean);

  // Return the result of emails.every() to the caller.
  return emails.every((email) => {
    // Declare owners for use by the surrounding module or function.
    const owners = emailOwners.get(email);
    // An email not belonging to any tenant account can be a legitimate guest.
    // But if it belongs to an account, the booking must belong to that same tenant.
    // Check the condition (!owners) and run the matching branch.
    if (!owners) return true;
    // Return the result of owners.has() to the caller.
    return owners.has(expected);
  });
};

// Declare belongsToTenant for use by the surrounding module or function.
const belongsToTenant = (booking, tenantId, ownership) => {
  // Declare expected for use by the surrounding module or function.
  const expected = String(tenantId);
  // Declare checks for use by the surrounding module or function.
  const checks = [
    [booking.customer, ownership.customers],
    [booking.user, ownership.users],
    [booking.tour, ownership.tours],
    [booking.assignedGuide, ownership.guides],
    [booking.assignedDriver, ownership.drivers],
    [booking.assignedVehicle, ownership.vehicles],
  ];

  // Check the condition (!snapshotIdentityBelongsToTenant(booking, tenantId, ownership.emailOwn) and run the matching branch.
  if (!snapshotIdentityBelongsToTenant(booking, tenantId, ownership.emailOwners)) return false;

  // Return the result of checks.every() to the caller.
  return checks.every(([reference, owners]) => {
    // Declare id for use by the surrounding module or function.
    const id = refId(reference);
    // Check the condition (!id) and run the matching branch.
    if (!id) return true;
    // Declare ownerTenantId for use by the surrounding module or function.
    const ownerTenantId = owners.get(String(id));
    // A referenced document must have an explicit tenant owner. Legacy/null
    // ownership is not safe to expose in another tenant's admin queue.
    // Check the condition (ownerTenantId === undefined || ownerTenantId === null) and run the matching branch.
    if (ownerTenantId === undefined || ownerTenantId === null) return false;
    // Return the expression shown below to the caller.
    return ownerTenantId === expected;
  });
};

// Declare filterTenantConsistentBookings for use by the surrounding module or function.
const filterTenantConsistentBookings = async (bookings, tenantId) => {
  // Declare ownership for use by the surrounding module or function.
  const ownership = await getReferenceOwnership(bookings, tenantId);
  // Return the result of bookings.filter() to the caller.
  return bookings.filter((booking) => belongsToTenant(booking, tenantId, ownership));
};

// Declare getAllBookings for use by the surrounding module or function.
export const getAllBookings = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId();
    // Declare { page = 1, limit = 20, search, status, paymentStatus } for use by the surrounding module or function.
    const { page = 1, limit = 20, search, status, paymentStatus } = req.query;
    // Declare currentPage for use by the surrounding module or function.
    const currentPage = Math.max(Number(page) || 1, 1);
    // Declare pageSize for use by the surrounding module or function.
    const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100);
    // Declare filter for use by the surrounding module or function.
    const filter = { tenantId, isDeleted: { $ne: true } };
    // Check the condition (search) and run the matching branch.
    if (search) {
      // Declare regex for use by the surrounding module or function.
      const regex = { $regex: String(search).trim(), $options: "i" };
      // Perform the side effect or state update expressed on the following line.
      filter.$or = [
        { bookingNumber: regex },
        { "customerSnapshot.name": regex },
        { "customerSnapshot.email": regex },
        { "customerSnapshot.phone": regex },
        { "contact.name": regex },
        { "contact.email": regex },
        { "contact.phone": regex },
      ];
    }
    // Check the condition (status && BOOKING_STATUSES.includes(status)) and run the matching branch.
    if (status && BOOKING_STATUSES.includes(status)) filter.status = status;
    // Check the condition (paymentStatus && BOOKING_PAYMENT_STATUSES.includes(paymentStatus)) and run the matching branch.
    if (paymentStatus && BOOKING_PAYMENT_STATUSES.includes(paymentStatus)) filter.paymentStatus = paymentStatus;
    // Declare tenantFilter for use by the surrounding module or function.
    const tenantFilter = mergeTenantFilter(filter);
    // Declare candidates for use by the surrounding module or function.
    const candidates = await populateBookings(Booking.find(tenantFilter).sort({ createdAt: -1 }).lean());
    // Declare safeBookings for use by the surrounding module or function.
    const safeBookings = await filterTenantConsistentBookings(candidates, tenantId);
    // Declare total for use by the surrounding module or function.
    const total = safeBookings.length;
    // Declare skip for use by the surrounding module or function.
    const skip = (currentPage - 1) * pageSize;
    // Declare bookings for use by the surrounding module or function.
    const bookings = safeBookings.slice(skip, skip + pageSize);
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({
      success: true,
      count: bookings.length,
      pagination: { total, page: currentPage, pages: Math.ceil(total / pageSize), limit: pageSize },
      data: bookings,
      bookings,
    });
  } catch (error) {
    // Return the result of next() to the caller.
    return next(error);
  }
};

// Declare getBookings for use by the surrounding module or function.
export const getBookings = getAllBookings;

// Declare getBooking for use by the surrounding module or function.
export const getBooking = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { id } for use by the surrounding module or function.
    const { id } = req.params;
    // Check the condition (!mongoose.Types.ObjectId.isValid(id)) and run the matching branch.
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid booking ID." });
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId();
    // Declare booking for use by the surrounding module or function.
    const booking = await populateBookings(
      Booking.findOne(mergeTenantFilter({ _id: id, isDeleted: { $ne: true } }))
    ).lean();
    // Check the condition (!booking) and run the matching branch.
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });
    // Declare safeBookings for use by the surrounding module or function.
    const safeBookings = await filterTenantConsistentBookings([booking], tenantId);
    // Check the condition (!safeBookings.length) and run the matching branch.
    if (!safeBookings.length) return res.status(404).json({ success: false, message: "Booking not found." });
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, data: safeBookings[0], booking: safeBookings[0] });
  } catch (error) {
    // Return the result of next() to the caller.
    return next(error);
  }
};

// Declare getConfirmedBookings for use by the surrounding module or function.
export const getConfirmedBookings = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId();
    // Declare currentPage for use by the surrounding module or function.
    const currentPage = Math.max(Number(req.query.page) || 1, 1);
    // Declare pageSize for use by the surrounding module or function.
    const pageSize = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    // Declare filter for use by the surrounding module or function.
    const filter = mergeTenantFilter({
      paymentStatus: "paid",
      status: { $in: ["confirmed", "assigned", "ongoing"] },
      isDeleted: { $ne: true },
    });
    // Declare candidates for use by the surrounding module or function.
    const candidates = await populateBookings(Booking.find(filter).sort({ travelDate: 1 }).lean());
    // Declare safeBookings for use by the surrounding module or function.
    const safeBookings = await filterTenantConsistentBookings(candidates, tenantId);
    // Declare total for use by the surrounding module or function.
    const total = safeBookings.length;
    // Declare skip for use by the surrounding module or function.
    const skip = (currentPage - 1) * pageSize;
    // Declare bookings for use by the surrounding module or function.
    const bookings = safeBookings.slice(skip, skip + pageSize);
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({
      success: true,
      page: currentPage,
      pages: Math.ceil(total / pageSize),
      total,
      count: bookings.length,
      bookings,
      data: bookings,
    });
  } catch (error) {
    // Return the result of next() to the caller.
    return next(error);
  }
};
