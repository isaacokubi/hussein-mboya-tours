import { mergeTenantFilter } from "../tenancy/context.js";
import Booking from "../models/Booking.js";
import Customer from "../models/Customer.js";

const normalizeStatus = (booking) =>
  String(booking?.status || booking?.bookingStatus || "pending").trim().toLowerCase();

const normalizePaymentStatus = (booking) =>
  String(
    typeof booking?.paymentStatus === "object"
      ? booking.paymentStatus?.paymentStatus || booking.paymentStatus?.status || "pending"
      : booking?.paymentStatus || "pending"
  )
    .trim()
    .toLowerCase();

const ownershipFilter = async (req) => {
  const customerProfile = await Customer.findOne(
    mergeTenantFilter({ user: req.user._id })
  )
    .select("_id")
    .lean();

  const ownership = [{ user: req.user._id }];
  if (customerProfile?._id) ownership.push({ customer: customerProfile._id });

  return mergeTenantFilter({ $or: ownership });
};

/**
 * Canonical customer booking feed used by the customer dashboard and My
 * Bookings page. Counts are calculated over the complete customer dataset,
 * not just the current pagination page, so dashboard KPIs never under-report.
 */
export const getCustomerBookings = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;
    const filter = await ownershipFilter(req);

    const [total, bookings, allBookings] = await Promise.all([
      Booking.countDocuments(filter),
      Booking.find(filter)
        .populate("tour")
        .populate("user", "name email phone")
        .populate("customer", "name email phone user")
        .sort({ travelDate: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Booking.find(filter)
        .select("status bookingStatus paymentStatus amountPaid paidAmount depositAmount totalAmount amount refundAmount travelDate")
        .lean(),
    ]);

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const upcoming = allBookings.filter((booking) => {
      if (!booking.travelDate) return false;
      const travelDate = new Date(booking.travelDate);
      return travelDate >= startOfToday && normalizeStatus(booking) !== "cancelled";
    });

    const completed = allBookings.filter(
      (booking) => normalizeStatus(booking) === "completed"
    );

    const cancelled = allBookings.filter(
      (booking) => normalizeStatus(booking) === "cancelled"
    );

    const totalSpent = allBookings.reduce((sum, booking) => {
      const status = normalizeStatus(booking);
      const paymentStatus = normalizePaymentStatus(booking);
      if (!["confirmed", "completed", "assigned", "ongoing"].includes(status)) return sum;
      if (!["paid", "completed", "success"].includes(paymentStatus)) return sum;

      const paid = Number(
        booking.amountPaid ??
          booking.paidAmount ??
          booking.depositAmount ??
          booking.totalAmount ??
          booking.amount ??
          0
      );
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
