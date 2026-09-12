import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Customer from "../models/Customer.js";
import User from "../models/User.js";
import Tour from "../models/Tour.js";
import Staff from "../models/Staff.js";
import Vehicle from "../models/Vehicle.js";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import { BOOKING_STATUSES, BOOKING_PAYMENT_STATUSES } from "../constants/bookingConstants.js";

const populateBookings = (query) => query
  .populate("customer", "_id name email phone user tenantId")
  .populate("user", "_id name email phone tenantId")
  .populate("tour", "_id title destination price discountPrice durationDays tenantId")
  .populate("assignedGuide", "_id name email phone tenantId")
  .populate("assignedDriver", "_id name email phone tenantId")
  .populate("assignedVehicle", "_id name registrationNumber plateNumber tenantId");

const refId = (value) => {
  if (!value) return null;
  if (typeof value === "object" && value._id) return value._id;
  return value;
};

const loadOwnership = async (model, ids) => {
  const validIds = [...new Set(ids.filter((id) => id && mongoose.Types.ObjectId.isValid(id)).map(String))]
    .map((id) => new mongoose.Types.ObjectId(id));
  if (!validIds.length) return new Map();
  const rows = await model.collection.find(
    { _id: { $in: validIds } },
    { projection: { _id: 1, tenantId: 1 } },
  ).toArray();
  return new Map(rows.map((row) => [String(row._id), row.tenantId ? String(row.tenantId) : null]));
};

const getReferenceOwnership = async (bookings) => {
  const customerIds = bookings.map((b) => refId(b.customer)).filter(Boolean);
  const userIds = bookings.map((b) => refId(b.user)).filter(Boolean);
  const tourIds = bookings.map((b) => refId(b.tour)).filter(Boolean);
  const guideIds = bookings.map((b) => refId(b.assignedGuide)).filter(Boolean);
  const driverIds = bookings.map((b) => refId(b.assignedDriver)).filter(Boolean);
  const vehicleIds = bookings.map((b) => refId(b.assignedVehicle)).filter(Boolean);
  const [customers, users, tours, guides, drivers, vehicles] = await Promise.all([
    loadOwnership(Customer, customerIds),
    loadOwnership(User, userIds),
    loadOwnership(Tour, tourIds),
    loadOwnership(Staff, guideIds),
    loadOwnership(Staff, driverIds),
    loadOwnership(Vehicle, vehicleIds),
  ]);
  return { customers, users, tours, guides, drivers, vehicles };
};

const belongsToTenant = (booking, tenantId, ownership) => {
  const expected = String(tenantId);
  const checks = [
    [booking.customer, ownership.customers],
    [booking.user, ownership.users],
    [booking.tour, ownership.tours],
    [booking.assignedGuide, ownership.guides],
    [booking.assignedDriver, ownership.drivers],
    [booking.assignedVehicle, ownership.vehicles],
  ];
  return checks.every(([reference, owners]) => {
    const id = refId(reference);
    if (!id) return true;
    const ownerTenantId = owners.get(String(id));
    // A referenced document must have an explicit tenant owner. Legacy/null
    // ownership is not safe to expose in another tenant's admin queue.
    if (ownerTenantId === undefined || ownerTenantId === null) return false;
    return ownerTenantId === expected;
  });
};

const filterTenantConsistentBookings = async (bookings, tenantId) => {
  const ownership = await getReferenceOwnership(bookings);
  return bookings.filter((booking) => belongsToTenant(booking, tenantId, ownership));
};

export const getAllBookings = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const { page = 1, limit = 20, search, status, paymentStatus } = req.query;
    const currentPage = Math.max(Number(page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const filter = { tenantId, isDeleted: { $ne: true } };
    if (search) {
      const regex = { $regex: String(search).trim(), $options: "i" };
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
    if (status && BOOKING_STATUSES.includes(status)) filter.status = status;
    if (paymentStatus && BOOKING_PAYMENT_STATUSES.includes(paymentStatus)) filter.paymentStatus = paymentStatus;
    const tenantFilter = mergeTenantFilter(filter);
    const candidates = await populateBookings(Booking.find(tenantFilter).sort({ createdAt: -1 }).lean());
    const safeBookings = await filterTenantConsistentBookings(candidates, tenantId);
    const total = safeBookings.length;
    const skip = (currentPage - 1) * pageSize;
    const bookings = safeBookings.slice(skip, skip + pageSize);
    return res.status(200).json({
      success: true,
      count: bookings.length,
      pagination: { total, page: currentPage, pages: Math.ceil(total / pageSize), limit: pageSize },
      data: bookings,
      bookings,
    });
  } catch (error) {
    return next(error);
  }
};

export const getBookings = getAllBookings;

export const getBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid booking ID." });
    const tenantId = requireTenantId();
    const booking = await populateBookings(
      Booking.findOne(mergeTenantFilter({ _id: id, isDeleted: { $ne: true } }))
    ).lean();
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });
    const safeBookings = await filterTenantConsistentBookings([booking], tenantId);
    if (!safeBookings.length) return res.status(404).json({ success: false, message: "Booking not found." });
    return res.status(200).json({ success: true, data: safeBookings[0], booking: safeBookings[0] });
  } catch (error) {
    return next(error);
  }
};

export const getConfirmedBookings = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const currentPage = Math.max(Number(req.query.page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const filter = mergeTenantFilter({
      paymentStatus: "paid",
      status: { $in: ["confirmed", "assigned", "ongoing"] },
      isDeleted: { $ne: true },
    });
    const candidates = await populateBookings(Booking.find(filter).sort({ travelDate: 1 }).lean());
    const safeBookings = await filterTenantConsistentBookings(candidates, tenantId);
    const total = safeBookings.length;
    const skip = (currentPage - 1) * pageSize;
    const bookings = safeBookings.slice(skip, skip + pageSize);
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
    return next(error);
  }
};
