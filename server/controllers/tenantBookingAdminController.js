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

/**
 * Tenant-isolated admin booking reads.
 *
 * The tenant filter is applied explicitly at the controller boundary and
 * again through mergeTenantFilter(). This prevents cross-company booking
 * leakage even if a caller reaches this controller with an unexpected query
 * context.
 */
export const getAllBookings = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const {
      page = 1,
      limit = 20,
      search,
      status,
      paymentStatus,
    } = req.query;

    const currentPage = Math.max(Number(page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const skip = (currentPage - 1) * pageSize;
    const filter = { tenantId };

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
    if (paymentStatus && BOOKING_PAYMENT_STATUSES.includes(paymentStatus)) {
      filter.paymentStatus = paymentStatus;
    }

    const tenantFilter = mergeTenantFilter(filter);
    const [bookings, total] = await Promise.all([
      populateBookings(
        Booking.find(tenantFilter, { tenantId: 1 })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(pageSize)
      ).lean(),
      Booking.countDocuments(tenantFilter),
    ]);

    return res.status(200).json({
      success: true,
      count: bookings.length,
      pagination: {
        total,
        page: currentPage,
        pages: Math.ceil(total / pageSize),
        limit: pageSize,
      },
      data: bookings,
      bookings,
    });
  } catch (error) {
    return next(error);
  }
};

export const getBookings = getAllBookings;

export const getConfirmedBookings = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const currentPage = Math.max(Number(req.query.page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const skip = (currentPage - 1) * pageSize;

    const filter = mergeTenantFilter({
      tenantId,
      paymentStatus: "paid",
      status: { $in: ["confirmed", "assigned", "ongoing"] },
      isDeleted: { $ne: true },
    });

    const [bookings, total] = await Promise.all([
      populateBookings(
        Booking.find(filter, { tenantId: 1 })
          .sort({ travelDate: 1 })
          .skip(skip)
          .limit(pageSize)
      ).lean(),
      Booking.countDocuments(filter),
    ]);

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
