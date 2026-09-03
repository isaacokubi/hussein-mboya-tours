import mongoose from "mongoose";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Booking from "../models/Booking.js";

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
      filter.$or = [{ bookingNumber: regex }, { "customerSnapshot.name": regex }, { "customerSnapshot.email": regex }];
    }
    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate("customer", "name email phone user")
        .populate("user", "name email phone")
        .populate("tour", "title destination price startDate endDate")
        .populate("assignedGuide", "name email phone")
        .populate("assignedDriver", "name email phone")
        .populate("assignedVehicle", "name registrationNumber registration model type capacity")
        .sort({ travelDate: 1, createdAt: -1 })
        .skip((page - 1) * limit).limit(limit).lean(),
      Booking.countDocuments(filter),
    ]);
    return res.status(200).json({ success: true, page, pages: Math.ceil(total / limit), total, count: bookings.length, bookings, data: bookings });
  } catch (error) { next(error); }
};
