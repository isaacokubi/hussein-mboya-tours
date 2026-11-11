/**
 * Purpose: admin AIController HTTP controller. Main declarations: getAIDashboard, adminAIQuery.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { requireTenantId } from "../tenancy/context.js";
// Load ../tenancy/tenantQuery.js so this module can use its exported dependencies.
import { tenantFilter } from "../tenancy/tenantQuery.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Vehicle.js so this module can use its exported dependencies.
import Vehicle from "../models/Vehicle.js";
// Load ../models/Review.js so this module can use its exported dependencies.
import Review from "../models/Review.js";
// Load ../services/aiService.js so this module can use its exported dependencies.
import { generateTravelAdvice } from "../services/aiService.js";
// Load ../services/bookingRevenueService.js so this module can use its exported dependencies.
import { getBookingRevenueMetrics } from "../services/bookingRevenueService.js";

// Declare getAIDashboard for use by the surrounding module or function.
export const getAIDashboard = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Declare filter for use by the surrounding module or function.
    const filter = tenantFilter(req);
    // Declare [bookings, revenue, pendingPayments, tours, customers, vehicles, reviews] for use by the surrounding module or function.
    const [bookings, revenue, pendingPayments, tours, customers, vehicles, reviews] = await Promise.all([
      Booking.countDocuments({ ...filter, isDeleted: { $ne: true } }),
      getBookingRevenueMetrics(req),
      Booking.countDocuments({ ...filter, paymentStatus: "pending", isDeleted: { $ne: true } }),
      Tour.countDocuments({ ...filter, isDeleted: { $ne: true } }),
      User.countDocuments({ ...filter, $or: [{ role: "customer" }, { legacyRole: "customer" }] }),
      Vehicle.countDocuments({ ...filter, isDeleted: { $ne: true } }),
      Review.countDocuments(filter),
    ]);
    // Return the result of res.json() to the caller.
    return res.json({ success: true, data: { bookings, revenue: revenue?.revenue || 0, pendingPayments, tours, customers, vehicles, reviews } });
  } catch (error) { next(error); }
};

// Declare adminAIQuery for use by the surrounding module or function.
export const adminAIQuery = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Declare filter for use by the surrounding module or function.
    const filter = tenantFilter(req);
    // Declare { message } for use by the surrounding module or function.
    const { message } = req.body;
    // Declare [bookings, payments, tours, vehicles, reviews] for use by the surrounding module or function.
    const [bookings, payments, tours, vehicles, reviews] = await Promise.all([
      Booking.countDocuments({ ...filter, isDeleted: { $ne: true } }),
      Payment.countDocuments(filter),
      Tour.countDocuments({ ...filter, isDeleted: { $ne: true } }),
      Vehicle.countDocuments({ ...filter, isDeleted: { $ne: true } }),
      Review.countDocuments(filter),
    ]);
    // Declare context for use by the surrounding module or function.
    const context = `You are an AI operations assistant for a tour company.\n\nBusiness data:\nBookings: ${bookings}\nPayments: ${payments}\nTours: ${tours}\nVehicles: ${vehicles}\nReviews: ${reviews}\n\nAdmin question:\n${message}\n\nGive practical business advice.`;
    // Declare reply for use by the surrounding module or function.
    const reply = await generateTravelAdvice(context, req.user);
    // Return the result of res.json() to the caller.
    return res.json({ success: true, data: { reply } });
  } catch (error) { next(error); }
};
