import mongoose from "mongoose";
import Booking from "../models/Booking.js";

/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "assigned",
  "completed",
  "cancelled",
  "refunded",
];

const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "failed",
  "cancelled",
  "refunded",
];


/*
|--------------------------------------------------------------------------
| GET ALL BOOKINGS
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
      filter.bookingStatus = req.query.status;
    }

    if (
      req.query.paymentStatus &&
      PAYMENT_STATUSES.includes(req.query.paymentStatus)
    ) {
      filter.paymentStatus = req.query.paymentStatus;
    }

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate("customer", "name email phone")
        
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

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      count: bookings.length,
      bookings,
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


    return res.status(200).json({
      success: true,
      booking,
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

export const updateBookingStatus = async (
  req,
  res,
  next
) => {

  try {

    const { status } = req.body;


    if (!BOOKING_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status",
      });
    }


    const booking =
      await Booking.findByIdAndUpdate(
        req.params.id,
        {
          bookingStatus: status,
        },
        {
          new: true,
          runValidators: true,
        }
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
| Assign:
| - Tour Guide
| - Driver
| - Vehicle
|--------------------------------------------------------------------------
*/

export const assignBookingResources = async (
  req,
  res,
  next
) => {

  try {

    const {
      guide,
      driver,
      vehicle,
    } = req.body;


    const booking =
      await Booking.findById(req.params.id);


    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }


    booking.assignedGuide =
      guide || null;

    booking.assignedDriver =
      driver || null;

    booking.assignedVehicle =
      vehicle || null;


    if (
      guide ||
      driver ||
      vehicle
    ) {
      booking.bookingStatus = "assigned";
    }


    await booking.save();


    await booking.populate([
      {
        path: "assignedGuide",
        select: "name email phone",
      },
      {
        path: "assignedDriver",
        select: "name email phone",
      },
      {
        path: "assignedVehicle",
      },
    ]);


    return res.status(200).json({
      success: true,
      message:
        "Resources assigned successfully",
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

export const updatePaymentStatus = async (
  req,
  res,
  next
) => {

  try {

    const {
      status,
      mpesaReceipt,
    } = req.body;


    if (!PAYMENT_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }


    const booking =
      await Booking.findById(req.params.id);


    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }


    booking.paymentStatus = status;


    if (mpesaReceipt) {
      booking.mpesaReceipt =
        mpesaReceipt.trim();
    }


    await booking.save();


    return res.status(200).json({
      success: true,
      message:
        "Payment status updated successfully",
      booking,
    });


  } catch (error) {
    next(error);
  }

};