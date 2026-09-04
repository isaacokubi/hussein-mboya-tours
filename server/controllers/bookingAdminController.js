import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import { getSystemSettings } from "../services/settingsService.js";

import {
  BOOKING_STATUSES,
  BOOKING_PAYMENT_STATUSES,
  isValidBookingStatus,
  isValidBookingPaymentStatus,
  canTransitionBookingStatus,
  canTransitionBookingPaymentStatus,
} from "../constants/bookingConstants.js";

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const isValidId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

/*
|--------------------------------------------------------------------------
| GET ALL BOOKINGS (ADMIN)
|--------------------------------------------------------------------------
|
| Supports:
| • Pagination
| • Search
| • Booking Status Filter
| • Payment Status Filter
|--------------------------------------------------------------------------
*/

export const getAllBookings = async (req, res, next) => {
  requireTenantId();
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      paymentStatus,
    } = req.query;

    const currentPage = Math.max(Number(page), 1);

    const pageSize = Math.min(
      Math.max(Number(limit), 1),
      100
    );

    const skip =
      (currentPage - 1) * pageSize;

    const filter = {};

    if (search) {
      const regex = {
        $regex: String(search).trim(),
        $options: "i",
      };

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
    if (paymentStatus && BOOKING_PAYMENT_STATUSES.includes(paymentStatus)) filter.paymentStatus = paymentStatus;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate("customer", "name email phone user")
        .populate("user", "name email phone")
        .populate("tour", "title")
        .populate("assignedGuide", "name")
        .populate("assignedDriver", "name")
        .populate("assignedVehicle", "name registrationNumber")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Booking.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: bookings.length,
      pagination: { total, page: currentPage, pages: Math.ceil(total / pageSize), limit: pageSize },
      data: bookings,
    });
  } catch (error) { next(error); }
};

export const getBookings = getAllBookings;

export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: "Invalid booking ID" });
    const booking = await Booking.findOne(mergeTenantFilter({ _id: id }))
      .populate("customer", "name email phone user")
      .populate("user", "name email phone")
      .populate("tour", "title")
      .populate("assignedGuide", "name")
      .populate("assignedDriver", "name")
      .populate("assignedVehicle", "name registrationNumber")
      .lean();
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    return res.status(200).json({ success: true, data: booking });
  } catch (error) { next(error); }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    if (!isValidId(id)) return res.status(400).json({ success: false, message: "Invalid booking ID" });
    if (!isValidBookingStatus(status)) return res.status(400).json({ success: false, message: "Invalid booking status.", allowedStatuses: BOOKING_STATUSES });
    const booking = await Booking.findOne(mergeTenantFilter({ _id: id }));
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (!canTransitionBookingStatus(booking.status, status)) return res.status(400).json({ success: false, message: `Cannot transition booking from ${booking.status} to ${status}.` });
    booking.status = status;
    await booking.save();
    return res.status(200).json({ success: true, data: booking });
  } catch (error) { next(error); }
};

export const updateBookingPaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body || {};
    if (!isValidId(id)) return res.status(400).json({ success: false, message: "Invalid booking ID" });
    if (!isValidBookingPaymentStatus(paymentStatus)) return res.status(400).json({ success: false, message: "Invalid booking payment status.", allowedStatuses: BOOKING_PAYMENT_STATUSES });
    const booking = await Booking.findOne(mergeTenantFilter({ _id: id }));
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (!canTransitionBookingPaymentStatus(booking.paymentStatus, paymentStatus)) return res.status(400).json({ success: false, message: `Cannot transition payment from ${booking.paymentStatus} to ${paymentStatus}.` });
    booking.paymentStatus = paymentStatus;
    await booking.save();
    return res.status(200).json({ success: true, data: booking });
  } catch (error) { next(error); }
};

export const deleteBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: "Invalid booking ID" });
    const booking = await Booking.findOneAndDelete(mergeTenantFilter({ _id: id }));
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    return res.status(200).json({ success: true, message: "Booking deleted successfully" });
  } catch (error) { next(error); }
};

export const getBookingInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: "Invalid booking ID" });
    const booking = await Booking.findOne(mergeTenantFilter({ _id: id }))
      .populate("customer", "name email phone")
      .populate("tour", "title")
      .lean();
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    const settings = await getSystemSettings({ tenantId: booking.tenantId });
    const companyName = settings.companyName || "Global Tours";

    res.setHeader("Content-Type", "text/plain");
    res.send(`
${companyName}

BOOKING INVOICE

Booking ID:
${booking._id}

Customer:
${booking.customer?.name || ""}

Tour:
${booking.tour?.title || ""}

Amount:
KES ${booking.totalAmount || 0}

Payment:
${booking.paymentStatus}

Status:
${booking.status}

Generated:
${new Date().toISOString()}
`);
  } catch (error) { next(error); }
};
