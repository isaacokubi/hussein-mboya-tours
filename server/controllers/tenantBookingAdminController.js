import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import {
  BOOKING_STATUSES,
  BOOKING_PAYMENT_STATUSES,
} from "../constants/bookingConstants.js";

const populateBookings = (query) =>
  query
    .populate("customer", "_id name email phone user tenantId")
    .populate("user", "_id name email phone tenantId")
    .populate("tour", "_id title destination price discountPrice durationDays tenantId")
    .populate("assignedGuide", "_id name email phone tenantId")
    .populate("assignedDriver", "_id name email phone tenantId")
    .populate("assignedVehicle", "_id name registrationNumber plateNumber tenantId");

const sameTenant = (value, tenantId) => {
  if (!value) return true;
  if (!value.tenantId) return true;
  return String(value.tenantId) === String(tenantId);
};

/**
 * A booking's root tenantId is authoritative, but older/imported records can
 * have a stale root tenantId while their referenced Customer/User/Tour belongs
 * to another tenant. Never expose such internally inconsistent records through
 * a tenant admin queue. Missing related tenantIds are allowed for legacy data.
 */
const belongsToTenant = (booking, tenantId) =>
  sameTenant(booking.customer, tenantId) &&
  sameTenant(booking.user, tenantId) &&
  sameTenant(booking.tour, tenantId) &&
  sameTenant(booking.assignedGuide, tenantId) &&
  sameTenant(booking.assignedDriver, tenantId) &&
  sameTenant(booking.assignedVehicle, tenantId);

const filterTenantConsistentBookings = (bookings, tenantId) =>
  bookings.filter((booking) => belongsToTenant(booking, tenantId));

/**
 * Tenant-isolated admin booking reads.
 */
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

    // Fetch the tenant's candidate records first, then enforce tenant
    // consistency across populated references before pagination/counting. This
    // closes the gap where a legacy booking has an AT root tenantId but points
    // to a Customer/User/Tour belonging to another organization.
    const candidates = await populateBookings(
      Booking.find(tenantFilter).sort({ createdAt: -1 }).lean()
    );
    const safeBookings = filterTenantConsistentBookings(candidates, tenantId);
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid booking ID." });
    }

    const tenantId = requireTenantId();
    const booking = await populateBookings(
      Booking.findOne(mergeTenantFilter({ _id: id, isDeleted: { $ne: true } }))
    ).lean();

    if (!booking || !belongsToTenant(booking, tenantId)) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    return res.status(200).json({ success: true, data: booking, booking });
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
      tenantId,
      paymentStatus: "paid",
      status: { $in: ["confirmed", "assigned", "ongoing"] },
      isDeleted: { $ne: true },
    });

    const candidates = await populateBookings(
      Booking.find(filter).sort({ travelDate: 1 }).lean()
    );
    const safeBookings = filterTenantConsistentBookings(candidates, tenantId);
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
