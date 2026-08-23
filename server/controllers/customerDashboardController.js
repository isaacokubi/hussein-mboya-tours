import { mergeTenantFilter } from "../tenancy/context.js";
import Booking from "../models/Booking.js";
import Customer from "../models/Customer.js";

const normalizeStatus = (booking) => String(booking?.status || booking?.bookingStatus || "pending").trim().toLowerCase();
const normalizePaymentStatus = (booking) => String(
  typeof booking?.paymentStatus === "object"
    ? booking.paymentStatus?.paymentStatus || booking.paymentStatus?.status || "pending"
    : booking?.paymentStatus || "pending"
).trim().toLowerCase();

/**
 * Canonical customer booking feed used by both the customer dashboard and
 * My Bookings page. The legacy bookingController query omitted tenant scope,
 * which could return an empty/mismatched customer dataset in tenant-aware mode.
 */
export const getCustomerBookings = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const customerProfile = await Customer.findOne(
      mergeTenantFilter({ user: req.user._id })
    ).select("_id").lean();

    const ownership = [{ user: req.user._id }];
    if (customerProfile?._id) ownership.push({ customer: customerProfile._id });

    const filter = mergeTenantFilter({ $or: ownership });
    const [total, bookings] = await Promise.all([
      Booking.countDocuments(filter),
      Booking.find(filter)
        .populate("tour")
        .populate("user", "name email phone")
        .populate("customer", "name email phone user")
        .sort({ travelDate: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const upcoming = bookings.filter((booking) => {
      if (!booking.travelDate) return false;
      const travelDate = new Date(booking.travelDate);
      return travelDate >= startOfToday && normalizeStatus(booking) !== "cancelled";
    });
    const completed = bookings.filter((booking) => normalizeStatus(booking) === "completed");
    const cancelled = bookings.filter((booking) => normalizeStatus(booking) === "cancelled");

    const totalSpent = bookings.reduce((sum, booking) => {
      const status = normalizeStatus(booking);
      const paymentStatus = normalizePaymentStatus(booking);
      if (!["confirmed", "completed", "assigned", "ongoing"].includes(status)) return sum;
      if (!["paid", "completed", "success"].includes(paymentStatus)) return sum;

      const paid = Number(booking.amountPaid ?? booking.paidAmount ?? booking.depositAmount ?? booking.totalAmount ?? booking.amount ?? 0);
      const refund = Number(booking.refundAmount || 0);
      return sum + Math.max(0, paid - refund);
    }, 0);

    return res.status(200).json({
      success: true,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
      total,
      count: bookings.length,
      bookings,
      stats: {
        totalTrips: total,
        loadedTrips: bookings.length,
        upcomingTrips: upcoming.length,
        completedTrips: completed.length,
        cancelledTrips: cancelled.length,
        totalSpent,
      },
    });
  } catch (error) {
    return next(error);
  }
};
