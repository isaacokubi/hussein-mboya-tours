/**
 * Purpose: tour Manager Booking Controller HTTP controller. Main declarations: getTourManagerBookings.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";

// Declare customerProjection for use by the surrounding module or function.
const customerProjection = "firstName lastName fullName name email phone user";
// Declare userProjection for use by the surrounding module or function.
const userProjection = "name firstName lastName email phone";

// Declare getTourManagerBookings for use by the surrounding module or function.
export const getTourManagerBookings = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare page for use by the surrounding module or function.
    const page = Math.max(Number(req.query.page) || 1, 1);
    // Declare limit for use by the surrounding module or function.
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    // Declare { status, paymentStatus, search, tour } for use by the surrounding module or function.
    const { status, paymentStatus, search, tour } = req.query;
    // Declare filter for use by the surrounding module or function.
    const filter = mergeTenantFilter(req, { isDeleted: { $ne: true } });

    // Check the condition (status) and run the matching branch.
    if (status) filter.status = status;
    // Check the condition (paymentStatus) and run the matching branch.
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    // Check the condition (tour && mongoose.Types.ObjectId.isValid(tour)) and run the matching branch.
    if (tour && mongoose.Types.ObjectId.isValid(tour)) filter.tour = tour;

    // Check the condition (search?.trim()) and run the matching branch.
    if (search?.trim()) {
      // Declare regex for use by the surrounding module or function.
      const regex = { $regex: search.trim(), $options: "i" };
      // Perform the side effect or state update expressed on the following line.
      filter.$or = [
        { bookingNumber: regex },
        { "customerSnapshot.name": regex },
        { "customerSnapshot.email": regex },
        { "contact.name": regex },
        { "contact.email": regex },
      ];
    }

    // Declare [bookings, total] for use by the surrounding module or function.
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

    // Declare normalizedBookings for use by the surrounding module or function.
    const normalizedBookings = bookings.map((booking) => {
      // Declare customer for use by the surrounding module or function.
      const customer = booking.customer || {};
      // Declare user for use by the surrounding module or function.
      const user = booking.user || {};
      // Declare snapshot for use by the surrounding module or function.
      const snapshot = booking.customerSnapshot || {};
      // Declare contact for use by the surrounding module or function.
      const contact = booking.contact || {};

      // Declare customerName for use by the surrounding module or function.
      const customerName = [
        customer.firstName,
        customer.lastName,
      ].filter(Boolean).join(" ") || customer.fullName || customer.name || user.name || [
        user.firstName,
        user.lastName,
      ].filter(Boolean).join(" ") || snapshot.name || contact.name || "Customer record unavailable";

      // Declare customerEmail for use by the surrounding module or function.
      const customerEmail = customer.email || user.email || snapshot.email || contact.email || "";
      // Declare customerPhone for use by the surrounding module or function.
      const customerPhone = customer.phone || user.phone || snapshot.phone || contact.phone || "";

      // Return the object assembled below to the caller.
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

    // Return the result of res.status(200).json() to the caller.
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
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};
