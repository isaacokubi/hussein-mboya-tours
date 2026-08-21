import mongoose from "mongoose";

import {
  BOOKING_STATUSES,
  BOOKING_PAYMENT_STATUSES,
} from "../constants/bookingConstants.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";

const normalizePaymentStatus = (value) => {
  if (typeof value === "string") return value.toLowerCase();
  return String(value?.status || "pending").toLowerCase();
};

/*
|--------------------------------------------------------------------------
| GET ALL BOOKINGS
|--------------------------------------------------------------------------
| The Booking document is the operational record, but Payment is the
| financial source of truth. Completed Payment records therefore reconcile
| the booking response so the admin dashboard cannot show Paid=0 while a
| completed payment for one of its bookings exists.
|--------------------------------------------------------------------------
*/
export const getAllBookings = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const filter = {};

    if (
      req.query.status &&
      BOOKING_STATUSES.includes(req.query.status)
    ) {
      filter.status = req.query.status;
    }

    // Payment filtering is reconciled below because completed Payment
    // documents can be authoritative even when Booking.paymentStatus is stale.
    const requestedPaymentStatus =
      req.query.paymentStatus &&
      BOOKING_PAYMENT_STATUSES.includes(req.query.paymentStatus)
        ? req.query.paymentStatus
        : null;

    if (requestedPaymentStatus && requestedPaymentStatus !== "paid") {
      filter.paymentStatus = requestedPaymentStatus;
    }

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate("customer", "name email phone")
        .populate("user", "name firstName lastName email phone")
        .populate("tour", "title name destination price")
        .populate("assignedGuide", "name email phone")
        .populate("assignedDriver", "name email phone")
        .populate("assignedVehicle")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Booking.countDocuments(filter),
    ]);

    const bookingIds = bookings.map((booking) => booking._id);

    const completedPayments = bookingIds.length
      ? await Payment.find({
          booking: { $in: bookingIds },
          status: "completed",
        })
          .sort({ createdAt: -1 })
          .lean()
      : [];

    const paymentByBooking = new Map();

    for (const payment of completedPayments) {
      const key = String(payment.booking);
      if (!paymentByBooking.has(key)) {
        paymentByBooking.set(key, payment);
      }
    }

    const reconciledBookings = bookings
      .map((booking) => {
        const payment = paymentByBooking.get(String(booking._id));
        const bookingPaymentStatus = normalizePaymentStatus(
          booking.paymentStatus
        );

        if (!payment) {
          return {
            ...booking,
            effectivePaymentStatus: bookingPaymentStatus,
          };
        }

        const effectivePaymentStatus = "paid";

        return {
          ...booking,
          paymentStatus: effectivePaymentStatus,
          effectivePaymentStatus,
          payment: {
            ...payment,
            status: payment.status,
          },
          // Keep the booking's historical amount while exposing the actual
          // completed payment amount for financial dashboard calculations.
          paidAmount: Number(payment.amount || 0),
          paymentDate: payment.paidAt || payment.updatedAt || payment.createdAt,
          mpesaReceiptNumber:
            payment.mpesaReceiptNumber || booking.mpesaReceiptNumber || "",
        };
      })
      .filter((booking) => {
        if (!requestedPaymentStatus || requestedPaymentStatus === "all") {
          return true;
        }

        return (
          normalizePaymentStatus(booking.effectivePaymentStatus) ===
          requestedPaymentStatus
        );
      });

    return res.status(200).json({
      success: true,
      page,
      limit,
      total: reconciledBookings.length,
      pages: Math.max(1, Math.ceil(reconciledBookings.length / limit)),
      count: reconciledBookings.length,
      bookings: reconciledBookings,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET BOOKING BY ID
|--------------------------------------------------------------------------
*/
export const getBookingById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findById(req.params.id)
      .populate("customer", "name email phone")
      .populate("user", "name firstName lastName email phone")
      .populate("tour")
      .populate("assignedGuide", "name email phone")
      .populate("assignedDriver", "name email phone")
      .populate("assignedVehicle")
      .lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const payment = await Payment.findOne({
      booking: booking._id,
      status: "completed",
    })
      .sort({ createdAt: -1 })
      .lean();

    const reconciledBooking = payment
      ? {
          ...booking,
          paymentStatus: "paid",
          effectivePaymentStatus: "paid",
          paidAmount: Number(payment.amount || 0),
          paymentDate: payment.paidAt || payment.updatedAt || payment.createdAt,
          mpesaReceiptNumber:
            payment.mpesaReceiptNumber || booking.mpesaReceiptNumber || "",
          payment,
        }
      : {
          ...booking,
          effectivePaymentStatus: normalizePaymentStatus(booking.paymentStatus),
        };

    return res.status(200).json({
      success: true,
      booking: reconciledBooking,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE BOOKING STATUS
|--------------------------------------------------------------------------
*/
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!BOOKING_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status",
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      booking,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| ASSIGN BOOKING RESOURCES
|--------------------------------------------------------------------------
*/
export const assignResources = async (req, res, next) => {
  try {
    const { guide, driver, vehicle } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.assignedGuide = guide || null;
    booking.assignedDriver = driver || null;
    booking.assignedVehicle = vehicle || null;

    if (guide || driver || vehicle) {
      booking.status = "assigned";
    }

    await booking.save();

    await booking.populate([
      { path: "assignedGuide", select: "name email phone" },
      { path: "assignedDriver", select: "name email phone" },
      { path: "assignedVehicle" },
    ]);

    return res.status(200).json({
      success: true,
      message: "Resources assigned successfully",
      booking,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE PAYMENT STATUS
|--------------------------------------------------------------------------
*/
export const updatePaymentStatus = async (req, res, next) => {
  try {
    const { status, mpesaReceipt } = req.body;

    if (!BOOKING_PAYMENT_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.paymentStatus = status;

    if (mpesaReceipt) {
      booking.mpesaReceipt = mpesaReceipt.trim();
    }

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking payment status updated successfully",
      booking,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| DOWNLOAD BOOKING INVOICE
|--------------------------------------------------------------------------
*/
export const downloadBookingInvoice = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("customer", "name email phone")
      .populate("tour", "title price")
      .lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const payment = await Payment.findOne({
      booking: booking._id,
      status: "completed",
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Invoice data generated",
      invoice: {
        bookingNumber: booking.bookingNumber,
        customer: booking.customer,
        tour: booking.tour,
        amount: booking.totalAmount,
        paidAmount: payment?.amount || booking.depositAmount || 0,
        status: payment ? "paid" : booking.paymentStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET BOOKING TIMELINE
|--------------------------------------------------------------------------
*/
export const getBookingTimeline = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .select("createdAt updatedAt status paymentStatus")
      .lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const timeline = [
      {
        event: "Booking created",
        date: booking.createdAt,
        status: "created",
      },
      {
        event: "Booking status updated",
        date: booking.updatedAt,
        status: booking.status,
      },
      {
        event: "Payment status",
        date: booking.updatedAt,
        status: booking.paymentStatus,
      },
    ];

    return res.status(200).json({
      success: true,
      timeline,
    });
  } catch (error) {
    next(error);
  }
};
