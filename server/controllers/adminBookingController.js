/**
 * Purpose: admin Booking Controller HTTP controller. Main declarations: normalizePaymentStatus, getAllBookings, getBookingById, updateBookingStatus, assignResources.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";

// Load ../constants/bookingConstants.js so this module can use its exported dependencies.
import {
  BOOKING_STATUSES,
  BOOKING_PAYMENT_STATUSES,
  canTransitionBookingStatus,
} from "../constants/bookingConstants.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";

// Declare normalizePaymentStatus for use by the surrounding module or function.
const normalizePaymentStatus = (value) => {
  // Check the condition (typeof value === "string") and run the matching branch.
  if (typeof value === "string") return value.toLowerCase();
  // Return the result of String(value?.status || "pending").toLowerCase() to the caller.
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
// Declare getAllBookings for use by the surrounding module or function.
export const getAllBookings = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare page for use by the surrounding module or function.
    const page = Math.max(Number(req.query.page) || 1, 1);
    // Declare limit for use by the surrounding module or function.
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    // Declare skip for use by the surrounding module or function.
    const skip = (page - 1) * limit;

    // Declare filter for use by the surrounding module or function.
    const filter = {};

    // Check the condition (req.query.status && BOOKING_STATUSES.includes(req.query.status)) and run the matching branch.
    if (
      req.query.status &&
      BOOKING_STATUSES.includes(req.query.status)
    ) {
      // Perform the side effect or state update expressed on the following line.
      filter.status = req.query.status;
    }

    // Payment filtering is reconciled below because completed Payment
    // documents can be authoritative even when Booking.paymentStatus is stale.
    // Declare requestedPaymentStatus for use by the surrounding module or function.
    const requestedPaymentStatus =
      req.query.paymentStatus &&
      BOOKING_PAYMENT_STATUSES.includes(req.query.paymentStatus)
        ? req.query.paymentStatus
        : null;

    // Check the condition (requestedPaymentStatus && requestedPaymentStatus !== "paid") and run the matching branch.
    if (requestedPaymentStatus && requestedPaymentStatus !== "paid") {
      // Perform the side effect or state update expressed on the following line.
      filter.paymentStatus = requestedPaymentStatus;
    }

    // Declare [bookings, total] for use by the surrounding module or function.
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

    // Declare bookingIds for use by the surrounding module or function.
    const bookingIds = bookings.map((booking) => booking._id);

    // Declare completedPayments for use by the surrounding module or function.
    const completedPayments = bookingIds.length
      ? await Payment.find({
          booking: { $in: bookingIds },
          status: "completed",
        })
          .sort({ createdAt: -1 })
          .lean()
      : [];

    // Declare paymentByBooking for use by the surrounding module or function.
    const paymentByBooking = new Map();

    // Repeat the enclosed work for each required iteration.
    for (const payment of completedPayments) {
      // Declare key for use by the surrounding module or function.
      const key = String(payment.booking);
      // Check the condition (!paymentByBooking.has(key)) and run the matching branch.
      if (!paymentByBooking.has(key)) {
        // Perform the side effect or state update expressed on the following line.
        paymentByBooking.set(key, payment);
      }
    }

    // Declare reconciledBookings for use by the surrounding module or function.
    const reconciledBookings = bookings
      .map((booking) => {
        // Declare payment for use by the surrounding module or function.
        const payment = paymentByBooking.get(String(booking._id));
        // Declare bookingPaymentStatus for use by the surrounding module or function.
        const bookingPaymentStatus = normalizePaymentStatus(
          booking.paymentStatus
        );

        // Check the condition (!payment) and run the matching branch.
        if (!payment) {
          // Return the object assembled below to the caller.
          return {
            ...booking,
            effectivePaymentStatus: bookingPaymentStatus,
          };
        }

        // Declare effectivePaymentStatus for use by the surrounding module or function.
        const effectivePaymentStatus = "paid";

        // Return the object assembled below to the caller.
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
        // Check the condition (!requestedPaymentStatus || requestedPaymentStatus === "all") and run the matching branch.
        if (!requestedPaymentStatus || requestedPaymentStatus === "all") {
          // Return the expression shown below to the caller.
          return true;
        }

        // Return the expression shown below to the caller.
        return (
          normalizePaymentStatus(booking.effectivePaymentStatus) ===
          requestedPaymentStatus
        );
      });

    // Return the result of res.status(200).json() to the caller.
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
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET BOOKING BY ID
|--------------------------------------------------------------------------
*/
// Declare getBookingById for use by the surrounding module or function.
export const getBookingById = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!mongoose.Types.ObjectId.isValid(req.params.id)) and run the matching branch.
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    // Declare booking for use by the surrounding module or function.
    const booking = await Booking.findOne(
mergeTenantFilter(req,{
_id:req.params.id
})
)
      .populate("customer", "name email phone")
      .populate("user", "name firstName lastName email phone")
      .populate("tour")
      .populate("assignedGuide", "name email phone")
      .populate("assignedDriver", "name email phone")
      .populate("assignedVehicle")
      .lean();

    // Check the condition (!booking) and run the matching branch.
    if (!booking) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Declare payment for use by the surrounding module or function.
    const payment = await Payment.findOne({
      booking: booking._id,
      status: "completed",
    })
      .sort({ createdAt: -1 })
      .lean();

    // Declare reconciledBooking for use by the surrounding module or function.
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

    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({
      success: true,
      booking: reconciledBooking,
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE BOOKING STATUS
|--------------------------------------------------------------------------
*/
// Declare updateBookingStatus for use by the surrounding module or function.
export const updateBookingStatus = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare requestedStatus for use by the surrounding module or function.
    const requestedStatus = String(req.body?.status || "").trim().toLowerCase();
    // Check the condition (!BOOKING_STATUSES.includes(requestedStatus)) and run the matching branch.
    if (!BOOKING_STATUSES.includes(requestedStatus)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "Invalid booking status", allowedStatuses: BOOKING_STATUSES });
    }

    // Declare booking for use by the surrounding module or function.
    const booking = await Booking.findOne(
      mergeTenantFilter(req, { _id: req.params.id })
    );
    // Check the condition (!booking) and run the matching branch.
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    // Check the condition (requestedStatus === booking.status) and run the matching branch.
    if (requestedStatus === booking.status) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: `Booking is already ${requestedStatus}.` });
    }

    // Check the condition (!canTransitionBookingStatus(booking.status, requestedStatus)) and run the matching branch.
    if (!canTransitionBookingStatus(booking.status, requestedStatus)) {
      // Return the result of res.status(409).json() to the caller.
      return res.status(409).json({
        success: false,
        message: `Booking cannot transition from "${booking.status}" to "${requestedStatus}".`,
        currentStatus: booking.status,
        requestedStatus,
      });
    }

    // Check the condition (["ongoing", "completed"].includes(requestedStatus) && String(booking.p) and run the matching branch.
    if (["ongoing", "completed"].includes(requestedStatus) && String(booking.paymentStatus || "").toLowerCase() !== "paid") {
      // Return the result of res.status(409).json() to the caller.
      return res.status(409).json({
        success: false,
        code: "PAYMENT_REQUIRED_BEFORE_COMPLETION",
        message: "Only fully paid bookings can be moved into an active or completed trip state.",
      });
    }

    // Perform the side effect or state update expressed on the following line.
    booking.status = requestedStatus;
    // Perform the side effect or state update expressed on the following line.
    await booking.save();

    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      booking,
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| ASSIGN BOOKING RESOURCES
|--------------------------------------------------------------------------
*/
// Declare assignResources for use by the surrounding module or function.
export const assignResources = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { guide, driver, vehicle } for use by the surrounding module or function.
    const { guide, driver, vehicle } = req.body;
    // Declare booking for use by the surrounding module or function.
    const booking = await Booking.findOne(
mergeTenantFilter(req,{
_id:req.params.id
})
);

    // Check the condition (!booking) and run the matching branch.
    if (!booking) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Perform the side effect or state update expressed on the following line.
    booking.assignedGuide = guide || null;
    // Perform the side effect or state update expressed on the following line.
    booking.assignedDriver = driver || null;
    // Perform the side effect or state update expressed on the following line.
    booking.assignedVehicle = vehicle || null;

    // Check the condition (guide || driver || vehicle) and run the matching branch.
    if (guide || driver || vehicle) {
      // Perform the side effect or state update expressed on the following line.
      booking.status = "assigned";
    }

    // Perform the side effect or state update expressed on the following line.
    await booking.save();

    // Perform the side effect or state update expressed on the following line.
    await booking.populate([
      { path: "assignedGuide", select: "name email phone" },
      { path: "assignedDriver", select: "name email phone" },
      { path: "assignedVehicle" },
    ]);

    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({
      success: true,
      message: "Resources assigned successfully",
      booking,
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE PAYMENT STATUS
|--------------------------------------------------------------------------
*/
// Declare updatePaymentStatus for use by the surrounding module or function.
export const updatePaymentStatus = async (req, res) => {
  // Return the result of res.status(410).json() to the caller.
  return res.status(410).json({
    success: false,
    code: "BOOKING_PAYMENT_STATUS_READ_ONLY",
    message: "Booking payment status is derived from the verified Payment ledger. Use the payment lifecycle workflow instead of editing booking.paymentStatus directly.",
  });
};

/*
|--------------------------------------------------------------------------
| DOWNLOAD BOOKING INVOICE
|--------------------------------------------------------------------------
*/
// Declare downloadBookingInvoice for use by the surrounding module or function.
export const downloadBookingInvoice = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare booking for use by the surrounding module or function.
    const booking = await Booking.findOne(
mergeTenantFilter(req,{
_id:req.params.id
})
)
      .populate("customer", "name email phone")
      .populate("tour", "title price")
      .lean();

    // Check the condition (!booking) and run the matching branch.
    if (!booking) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Declare payment for use by the surrounding module or function.
    const payment = await Payment.findOne({
      booking: booking._id,
      status: "completed",
    })
      .sort({ createdAt: -1 })
      .lean();

    // Return the result of res.status(200).json() to the caller.
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
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET BOOKING TIMELINE
|--------------------------------------------------------------------------
*/
// Declare getBookingTimeline for use by the surrounding module or function.
export const getBookingTimeline = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare booking for use by the surrounding module or function.
    const booking = await Booking.findOne(
mergeTenantFilter(req,{
_id:req.params.id
})
)
      .select("createdAt updatedAt status paymentStatus")
      .lean();

    // Check the condition (!booking) and run the matching branch.
    if (!booking) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Declare timeline for use by the surrounding module or function.
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

    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({
      success: true,
      timeline,
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};
