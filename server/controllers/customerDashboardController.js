import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Booking from "../models/Booking.js";
import Customer from "../models/Customer.js";

const normalizeStatus = (booking) => String(booking?.status || booking?.bookingStatus || "pending").trim().toLowerCase();
const normalizePaymentStatus = (booking) => String(typeof booking?.paymentStatus === "object" ? booking.paymentStatus?.paymentStatus || booking.paymentStatus?.status || "pending" : booking?.paymentStatus || "pending").trim().toLowerCase();

const ownershipFilter = async (req) => {
  requireTenantId();
  const customerProfile = await Customer.findOne(mergeTenantFilter(req, { user: req.user._id })).select("_id").lean();
  const ownership = [{ user: req.user._id }];
  if (customerProfile?._id) ownership.push({ customer: customerProfile._id });
  return mergeTenantFilter(req, { $or: ownership });
};

export const getCustomerBookings = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;
    const filter = await ownershipFilter(req);

    const [total, bookings, allBookings] = await Promise.all([
      Booking.countDocuments(filter),
      Booking.find(filter).populate("tour").populate("user", "name email phone").populate("customer", "name email phone user").sort({ travelDate: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      Booking.find(filter).select("status bookingStatus paymentStatus amountPaid paidAmount depositAmount totalAmount amount refundAmount travelDate").lean(),
    ]);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const upcoming = allBookings.filter((b) => b.travelDate && new Date(b.travelDate) >= startOfToday && normalizeStatus(b) !== "cancelled");
    const completed = allBookings.filter((b) => normalizeStatus(b) === "completed");
    const cancelled = allBookings.filter((b) => normalizeStatus(b) === "cancelled");
    const totalSpent = allBookings.reduce((sum, b) => {
      const status = normalizeStatus(b);
      const paymentStatus = normalizePaymentStatus(b);
      if (!["confirmed", "completed", "assigned", "ongoing"].includes(status) || !["paid", "completed", "success"].includes(paymentStatus)) return sum;
      const paid = Number(b.amountPaid ?? b.paidAmount ?? b.depositAmount ?? b.totalAmount ?? b.amount ?? 0);
      return sum + Math.max(0, paid - Number(b.refundAmount || 0));
    }, 0);

    return res.status(200).json({
      success: true,
      tenantId: tenantId.toString(),
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
      total,
      count: bookings.length,
      bookings,
      stats: { totalTrips: total, loadedTrips: bookings.length, upcomingTrips: upcoming.length, completedTrips: completed.length, cancelledTrips: cancelled.length, totalSpent },
    });
  } catch (error) {
    return next(error);
  }
};
