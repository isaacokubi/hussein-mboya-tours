import { requireTenantId } from "../tenancy/context.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Tour from "../models/Tour.js";
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
import Review from "../models/Review.js";
import { generateTravelAdvice } from "../services/aiService.js";

export const getAIDashboard = async (req, res, next) => {
  try {
    requireTenantId();
    const filter = tenantFilter(req);
    const [bookings, revenue, pendingPayments, tours, customers, vehicles, reviews] = await Promise.all([
      Booking.countDocuments({ ...filter, isDeleted: { $ne: true } }),
      Payment.aggregate([{ $match: { ...filter, status: "completed" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      Booking.countDocuments({ ...filter, paymentStatus: "pending", isDeleted: { $ne: true } }),
      Tour.countDocuments({ ...filter, isDeleted: { $ne: true } }),
      User.countDocuments({ ...filter, $or: [{ role: "customer" }, { legacyRole: "customer" }] }),
      Vehicle.countDocuments({ ...filter, isDeleted: { $ne: true } }),
      Review.countDocuments(filter),
    ]);
    return res.json({ success: true, data: { bookings, revenue: revenue[0]?.total || 0, pendingPayments, tours, customers, vehicles, reviews } });
  } catch (error) { next(error); }
};

export const adminAIQuery = async (req, res, next) => {
  try {
    requireTenantId();
    const filter = tenantFilter(req);
    const { message } = req.body;
    const [bookings, payments, tours, vehicles, reviews] = await Promise.all([
      Booking.countDocuments({ ...filter, isDeleted: { $ne: true } }),
      Payment.countDocuments(filter),
      Tour.countDocuments({ ...filter, isDeleted: { $ne: true } }),
      Vehicle.countDocuments({ ...filter, isDeleted: { $ne: true } }),
      Review.countDocuments(filter),
    ]);
    const context = `You are an AI operations assistant for a tour company.\n\nBusiness data:\nBookings: ${bookings}\nPayments: ${payments}\nTours: ${tours}\nVehicles: ${vehicles}\nReviews: ${reviews}\n\nAdmin question:\n${message}\n\nGive practical business advice.`;
    const reply = await generateTravelAdvice(context, req.user);
    return res.json({ success: true, data: { reply } });
  } catch (error) { next(error); }
};
