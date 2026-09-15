import mongoose from "mongoose";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Booking from "../models/Booking.js";

const customerProjection = "firstName lastName fullName name email phone user";
const userProjection = "name firstName lastName email phone";

export const getTourManagerBookings = async (req, res, next) => {
  requireTenantId();
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const { status, paymentStatus, search, tour } = req.query;
    const filter = mergeTenantFilter(req, { isDeleted: { $ne: true } });

    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (tour && mongoose.Types.ObjectId.isValid(tour)) filter.tour = tour;

    if (search?.trim()) {
      const regex = { $regex: search.trim(), $options: "i" };
      filter.$or = [
        { bookingNumber: regex },
        { "customerSnapshot.name": regex },
        { "customerSnapshot.email": regex },
        { "contact.name": regex },
        { "contact.email": regex },
      ];
    }

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate("customer", customerProjection)
        .populate("user", userProjection)
        .populate("tour", "title destination price startDate endDate")
        .populate("assignedGuide", "name firstName lastName email phone")
        .populate("assignedDriver", "name firstName lastName email phone")
        .populate("assignedVehicle", "name registrationNumber registration model type capacity")
        .sort({ travelDate: 1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Booking.countDocuments(filter),
    ]);

    const normalizedBookings = bookings.map((booking) => {
      const customer = booking.customer || {};
      const user = booking.user || {};
      const snapshot = booking.customerSnapshot || {};
      const contact = booking.contact || {};

      const customerName = [
        customer.firstName,
        customer.lastName,
      ].filter(Boolean).join(" ") || customer.fullName || customer.name || user.name || [
        user.firstName,
        user.lastName,
      ].filter(Boolean).join(" ") || snapshot.name || contact.name || "Customer record unavailable";

      const customerEmail = customer.email || user.email || snapshot.email || contact.email || "";
      const customerPhone = customer.phone || user.phone || snapshot.phone || contact.phone || "";

      return {
        ...booking,
        customer: booking.customer
          ? { ...customer, name: customerName, email: customerEmail, phone: customerPhone }
          : booking.customer,
        customerDisplay: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          source: booking.customer ? "customer_record" : snapshot.name || contact.name ? "booking_snapshot" : "unavailable",
        },
      };
    });

    return res.status(200).json({
      success: true,
      page,
      pages: Math.ceil(total / limit),
      total,
      count: normalizedBookings.length,
      bookings: normalizedBookings,
      data: normalizedBookings,
    });
  } catch (error) {
    next(error);
  }
};
