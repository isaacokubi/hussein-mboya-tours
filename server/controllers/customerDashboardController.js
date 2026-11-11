/**
 * Purpose: customer Dashboard Controller HTTP controller. Main declarations: normalizeStatus, normalizePaymentStatus, ownershipFilter, getCustomerBookings.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter } from "../tenancy/context.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Customer.js so this module can use its exported dependencies.
import Customer from "../models/Customer.js";

// Declare normalizeStatus for use by the surrounding module or function.
const normalizeStatus = (booking) =>
  String(booking?.status || booking?.bookingStatus || "pending").trim().toLowerCase();

// Declare normalizePaymentStatus for use by the surrounding module or function.
const normalizePaymentStatus = (booking) =>
  String(
    typeof booking?.paymentStatus === "object"
      ? booking.paymentStatus?.paymentStatus || booking.paymentStatus?.status || "pending"
      : booking?.paymentStatus || "pending"
  )
    .trim()
    .toLowerCase();

// Declare ownershipFilter for use by the surrounding module or function.
const ownershipFilter = async (req) => {
  // Declare customerProfile for use by the surrounding module or function.
  const customerProfile = await Customer.findOne(
    mergeTenantFilter({ user: req.user._id, isDeleted: { $ne: true } })
  )
    .select("_id")
    .lean();

  // Declare ownership for use by the surrounding module or function.
  const ownership = [{ user: req.user._id }];
  // Check the condition (customerProfile?._id) and run the matching branch.
  if (customerProfile?._id) ownership.push({ customer: customerProfile._id });

  // Return the result of mergeTenantFilter() to the caller.
  return mergeTenantFilter({ $or: ownership, isDeleted: { $ne: true } });
};

/**
 * Canonical customer booking feed used by the customer dashboard and My
 * Bookings page. KPIs are calculated over the complete non-deleted customer
 * dataset, never just the current pagination page.
 */
// Declare getCustomerBookings for use by the surrounding module or function.
export const getCustomerBookings = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare page for use by the surrounding module or function.
    const page = Math.max(Number(req.query.page) || 1, 1);
    // Declare limit for use by the surrounding module or function.
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    // Declare skip for use by the surrounding module or function.
    const skip = (page - 1) * limit;
    // Declare filter for use by the surrounding module or function.
    const filter = await ownershipFilter(req);

    // Declare [total, bookings, allBookings] for use by the surrounding module or function.
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

    // Declare now for use by the surrounding module or function.
    const now = new Date();
    // Declare startOfToday for use by the surrounding module or function.
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Declare upcoming for use by the surrounding module or function.
    const upcoming = allBookings.filter((booking) => {
      // Check the condition (!booking.travelDate) and run the matching branch.
      if (!booking.travelDate) return false;
      // Declare travelDate for use by the surrounding module or function.
      const travelDate = new Date(booking.travelDate);
      // Return the expression shown below to the caller.
      return travelDate >= startOfToday && !["cancelled", "refunded"].includes(normalizeStatus(booking));
    });

    // Declare completed for use by the surrounding module or function.
    const completed = allBookings.filter(
      (booking) => normalizeStatus(booking) === "completed"
    );

    // Declare cancelled for use by the surrounding module or function.
    const cancelled = allBookings.filter(
      (booking) => ["cancelled", "refunded"].includes(normalizeStatus(booking))
    );

    // Declare totalSpent for use by the surrounding module or function.
    const totalSpent = allBookings.reduce((sum, booking) => {
      // Declare status for use by the surrounding module or function.
      const status = normalizeStatus(booking);
      // Declare paymentStatus for use by the surrounding module or function.
      const paymentStatus = normalizePaymentStatus(booking);
      // Check the condition (!["confirmed", "completed", "assigned", "ongoing"].includes(status)) and run the matching branch.
      if (!["confirmed", "completed", "assigned", "ongoing"].includes(status)) return sum;
      // Check the condition (!["paid", "completed", "success"].includes(paymentStatus)) and run the matching branch.
      if (!["paid", "completed", "success"].includes(paymentStatus)) return sum;

      // Declare paid for use by the surrounding module or function.
      const paid = Number(
        booking.amountPaid ??
          booking.paidAmount ??
          booking.depositAmount ??
          booking.totalAmount ??
          booking.amount ??
          0
      );
      // Declare refund for use by the surrounding module or function.
      const refund = Number(booking.refundAmount || 0);
      // Return the expression shown below to the caller.
      return sum + Math.max(0, paid - refund);
    }, 0);

    // Return the result of res.status(200).json() to the caller.
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
    // Return the result of next() to the caller.
    return next(error);
  }
};
