import Booking from "../models/Booking.js";

/*
|--------------------------------------------------------------------------
| GET ALL BOOKINGS
|--------------------------------------------------------------------------
*/

export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()

      .populate("customer", "name email phone")

      .populate("user", "name email phone")

      .populate("tour", "title name destination price")

      .populate("assignedGuide", "name email phone")

      .populate("assignedDriver", "name email phone")

      .populate("assignedVehicle")

      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,

      count: bookings.length,

      bookings,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE BOOKING
|--------------------------------------------------------------------------
*/

export const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)

      .populate("customer", "name email phone")

      .populate("tour")

      .populate("assignedGuide", "name")

      .populate("assignedDriver", "name")

      .populate("assignedVehicle");

    if (!booking) {
      return res.status(404).json({
        success: false,

        message: "Booking not found",
      });
    }

    res.status(200).json({
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

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,

      {
        bookingStatus: status,
      },

      {
        new: true,
      },
    );

    if (!booking) {
      return res.status(404).json({
        success: false,

        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,

      message: "Booking status updated",

      booking,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| ASSIGN GUIDE DRIVER VEHICLE
|--------------------------------------------------------------------------
*/

export const assignResources = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,

      {
        assignedGuide: req.body.guide || null,

        assignedDriver: req.body.driver || null,

        assignedVehicle: req.body.vehicle || null,

        bookingStatus: "assigned",
      },

      {
        new: true,
      },
    );

    if (!booking) {
      return res.status(404).json({
        success: false,

        message: "Booking not found",
      });
    }

    res.status(200).json({
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
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,

      {
        paymentStatus: req.body.status,

        mpesaReceipt: req.body.mpesaReceipt || "",
      },

      {
        new: true,
      },
    );

    if (!booking) {
      return res.status(404).json({
        success: false,

        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,

      message: "Payment updated",

      booking,
    });
  } catch (error) {
    next(error);
  }
};
