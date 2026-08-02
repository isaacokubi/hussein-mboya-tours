import mongoose from "mongoose";

import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";

import {
  reserveSlots,
  validateTourCapacity,
  releaseSlots,
} from "../services/inventoryService.js";

import {
  BOOKING_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
} from "../constants/bookingConstants.js";

import { calculateBookingAmounts } from "../utils/bookingPricing.js";

import { successResponse, errorResponse } from "../utils/apiResponse.js";

import withTransaction from "../utils/withTransaction.js";

/*
|--------------------------------------------------------------------------
| CREATE BOOKING
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| CREATE BOOKING
|--------------------------------------------------------------------------
*/
const bookingDocument =
new Booking({

customer:
req.user._id,


customerSnapshot: {

name:
req.user.name || "",

email:
req.user.email || "",

phone:
req.user.phone || ""

},


tour,


travelDate,


travelers,


numberOfGuests:
totalTravellers,


contact,


subtotal,


discountAmount,


totalAmount,


depositAmount,


balanceAmount,


paymentMethod:
paymentMethod || "MPESA",


paymentStatus:
"pending",


status:
"pending",


assigned:false

});
/*
|--------------------------------------------------------------------------
| GET MY BOOKINGS
|--------------------------------------------------------------------------
*/

export const getMyBookings = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 20;

    const skip = (page - 1) * limit;

    const filter = {
      $or: [
        {
          user: req.user._id,
        },

        {
          customer: req.user._id,
        },
      ],
    };

    const total = await Booking.countDocuments(filter);

    const bookings = await Booking.find(filter)

      .populate("tour")

      .sort({
        createdAt: -1,
      })

      .skip(skip)

      .limit(limit)

      .lean();

    return successResponse(res, 200, "Bookings retrieved successfully", {
      page,
      pages: Math.ceil(total / limit),
      total,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| ADMIN GET ALL BOOKINGS
|--------------------------------------------------------------------------
*/

export const getAllBookings = async (req, res, next) => {
  try {
    const { status, paymentStatus, search } = req.query;

    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 20;

    const skip = (page - 1) * limit;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    /*
        |--------------------------------------------------------------------------
        | Database Search
        |--------------------------------------------------------------------------
        */

    if (search) {
      filter.$or = [
        {
          bookingNumber: {
            $regex: search,

            $options: "i",
          },
        },

        {
          "customerSnapshot.name": {
            $regex: search,

            $options: "i",
          },
        },

        {
          "customerSnapshot.email": {
            $regex: search,

            $options: "i",
          },
        },
      ];
    }

    const total = await Booking.countDocuments(filter);

    const bookings = await Booking.find(filter)

     .populate(
  "customer",
  "name email phone"
)

.populate(
  "tour",
  "title destination price"
)

      .populate("assignedGuide", "name email phone")

      .populate("assignedDriver", "name email phone")

      .populate("assignedVehicle")

      .sort({
        createdAt: -1,
      })

      .skip(skip)

      .limit(limit)

      .lean();

    return res.status(200).json({
      success: true,

      page,

      pages: Math.ceil(total / limit),

      total,

      count: bookings.length,

      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// Compatibility
export const getBookings = getAllBookings;

/*
|--------------------------------------------------------------------------
| GET CONFIRMED BOOKINGS FOR TOUR MANAGER
|--------------------------------------------------------------------------
*/

export const getConfirmedBookings = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 20;

    const skip = (page - 1) * limit;

    const filter = {
      paymentStatus: "paid",

      $or: [
        {
          bookingStatus: "confirmed",
        },

        {
          status: "confirmed",
        },
      ],
    };

    const total = await Booking.countDocuments(filter);

    const bookings = await Booking.find(filter)

      .populate("tour")

      .populate(
  "customer",
  "name email phone"
)

      .populate("assignedGuide")

      .populate("assignedDriver")

      .populate("assignedVehicle")

      .sort({
        travelDate: 1,
      })

      .skip(skip)

      .limit(limit)

      .lean();

    return res.status(200).json({
      success: true,

      page,

      pages: Math.ceil(total / limit),

      total,

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

export const getBookingById = async (
req,
res,
next
)=>{

try{


const booking =
await Booking.findById(req.params.id)


.populate(
"tour"
)


.populate(
"customer",
"name email phone"
)


.populate(
"assignedGuide"
)


.populate(
"assignedDriver"
)


.populate(
"assignedVehicle"
)


.lean();



if(!booking){

return res.status(404).json({

success:false,

message:"Booking not found"

});

}



return successResponse(

res,

200,

"Booking retrieved successfully",

{
booking
}

);


}
catch(error){

next(error);

}


};
// Compatibility
export const getBooking = getBookingById; /*
|--------------------------------------------------------------------------
| UPDATE PAYMENT STATUS
|--------------------------------------------------------------------------
|
| Used by:
| - M-Pesa callback
| - Card payment
| - Bank payment
|
|--------------------------------------------------------------------------
*/

export const updateBookingPayment = async (
  bookingId,
  paymentStatus,
  paymentData = {},
) => {
  if (!PAYMENT_STATUSES.includes(paymentStatus)) {
    throw new Error("Invalid payment status");
  }

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error("Booking not found");
  }

  /*
    |--------------------------------------------------------------------------
    | Prevent duplicate payment processing
    |--------------------------------------------------------------------------
    */

  if (booking.paymentStatus === "paid" && paymentStatus === "paid") {
    return booking;
  }

  booking.paymentStatus = paymentStatus;

  /*
    |--------------------------------------------------------------------------
    | SUCCESSFUL PAYMENT
    |--------------------------------------------------------------------------
    */

  if (paymentStatus === "paid") {
    booking.status = "confirmed";

    booking.bookingStatus = "confirmed";

   if(paymentData.mpesaReceiptNumber){

booking.mpesaReceipt =
paymentData.mpesaReceiptNumber;

}

    if (typeof paymentData.amount === "number") {
      booking.paidAmount = paymentData.amount;
    }

    if (paymentData.transactionId) {
      booking.transactionId = paymentData.transactionId;
    }

    if (paymentData.paymentMethod) {
      booking.paymentMethod = paymentData.paymentMethod;
    }

    booking.paidAt = new Date();
  }

  /*
    |--------------------------------------------------------------------------
    | FAILED PAYMENT
    |--------------------------------------------------------------------------
    */

  if (paymentStatus === "failed") {
    if (booking.paymentStatus !== "paid") {
      booking.status = "pending";

      booking.bookingStatus = "pending";
    }
  }

  /*
    |--------------------------------------------------------------------------
    | CANCELLED PAYMENT
    |--------------------------------------------------------------------------
    */

  if (paymentStatus === "cancelled") {
    if (booking.paymentStatus !== "paid") {
      booking.status = "cancelled";

      booking.bookingStatus = "cancelled";
    }
  }

  /*
    |--------------------------------------------------------------------------
    | REFUNDED
    |--------------------------------------------------------------------------
    */

  if (paymentStatus === "refunded") {
    booking.status = "refunded";

    booking.bookingStatus = "refunded";

    booking.refundedAt = new Date();
  }

  await booking.save();

  return booking;
};

/*
|--------------------------------------------------------------------------
| UPDATE BOOKING STATUS (ADMIN)
|--------------------------------------------------------------------------
*/

export const updateBookingStatus = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,

        message: "Booking not found",
      });
    }

    /*
        |--------------------------------------------------------------------------
        | Booking Status Validation
        |--------------------------------------------------------------------------
        */

    if (req.body.status) {
      if (!BOOKING_STATUSES.includes(req.body.status)) {
        return res.status(400).json({
          success: false,

          message: "Invalid booking status",
        });
      }

      booking.status = req.body.status;
    }

    /*
        |--------------------------------------------------------------------------
        | Booking Status Field
        |--------------------------------------------------------------------------
        */

    if (req.body.bookingStatus) {
      if (!BOOKING_STATUSES.includes(req.body.bookingStatus)) {
        return res.status(400).json({
          success: false,

          message: "Invalid booking status",
        });
      }

      booking.bookingStatus = req.body.bookingStatus;
    }

    /*
        |--------------------------------------------------------------------------
        | Payment Status
        |--------------------------------------------------------------------------
        */

    if (req.body.paymentStatus) {
      if (!PAYMENT_STATUSES.includes(req.body.paymentStatus)) {
        return res.status(400).json({
          success: false,

          message: "Invalid payment status",
        });
      }

      booking.paymentStatus = req.body.paymentStatus;
    }

    /*
        |--------------------------------------------------------------------------
        | Assigned Status
        |--------------------------------------------------------------------------
        */

    if (req.body.assigned !== undefined) {
      booking.assigned = req.body.assigned;
    }

    /*
        |--------------------------------------------------------------------------
        | Auto-confirm paid bookings
        |--------------------------------------------------------------------------
        */

    if (booking.paymentStatus === "paid") {
      booking.status = "confirmed";

      booking.bookingStatus = "confirmed";

      if (!booking.paidAt) {
        booking.paidAt = new Date();
      }
    }

    /*
        |--------------------------------------------------------------------------
        | Auto-cancel cancelled payments
        |--------------------------------------------------------------------------
        */

    if (booking.paymentStatus === "cancelled") {
      booking.status = "cancelled";

      booking.bookingStatus = "cancelled";
    }

    await booking.save();

    return res.status(200).json({
      success: true,

      message: "Booking updated successfully",

      booking,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| CANCEL BOOKING
|--------------------------------------------------------------------------
*/

export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,

        message: "Booking not found",
      });
    }

    /*
        |--------------------------------------------------------------------------
        | Prevent duplicate cancellation
        |--------------------------------------------------------------------------
        */

    if (booking.bookingStatus === "cancelled") {
      return res.status(400).json({
        success: false,

        message: "Booking has already been cancelled",
      });
    }

    /*
        |--------------------------------------------------------------------------
        | Prevent cancelling completed bookings
        |--------------------------------------------------------------------------
        */

    if (booking.bookingStatus === "completed") {
      return res.status(400).json({
        success: false,

        message: "Completed bookings cannot be cancelled",
      });
    }

    booking.bookingStatus = "cancelled";

    booking.status = "cancelled";

    if (booking.paymentStatus !== "paid") {
      booking.paymentStatus = "cancelled";
    }

    await releaseSlots(booking.tour, booking.numberOfGuests);
    booking.cancelledAt = new Date();

    await booking.save();

    return res.status(200).json({
      success: true,

      message: "Booking cancelled successfully",

      booking,
    });
  } catch (error) {
    next(error);
  }
};
