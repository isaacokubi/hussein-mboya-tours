import mongoose from "mongoose";

import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";
import Customer from "../models/Customer.js";
import Agent from "../models/Agent.js";
import { createCommission } from "../services/commissionService.js";

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const isValidId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "assigned",
  "ongoing",
  "completed",
  "cancelled",
  "refunded",
];

/*
|--------------------------------------------------------------------------
| CREATE AGENT BOOKING
|--------------------------------------------------------------------------
*/

export const createBooking = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    /*
    |--------------------------------------------------------------------------
    | AGENT
    |--------------------------------------------------------------------------
    */

    const agentProfile = await Agent.findOne({
      user: req.user._id,
    }).session(session);

    if (!agentProfile) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Agent profile not found.",
      });
    }

    if (
      !agentProfile.isApproved ||
      agentProfile.status !== "active"
    ) {
      await session.abortTransaction();

      return res.status(403).json({
        success: false,
        message:
          "Agent account is not approved or active.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | REQUEST
    |--------------------------------------------------------------------------
    */

    const {
      customer,
      tour,
      travelDate,
      travelers,
      pickupLocation,
      pickupTime,
      hotelName,
      roomNumber,
      emergencyContact,
      specialRequests,
      paymentMethod,
      customerNotes,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | VALIDATE IDS
    |--------------------------------------------------------------------------
    */

    if (
      !isValidId(customer) ||
      !isValidId(tour)
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Invalid customer or tour.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE TRAVEL DATE
    |--------------------------------------------------------------------------
    */

    if (!travelDate || Number.isNaN(Date.parse(travelDate))) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "A valid travel date is required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE TRAVELERS
    |--------------------------------------------------------------------------
    */

    if (
      !Array.isArray(travelers) ||
      travelers.length === 0
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "At least one traveler is required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | FIND TOUR + CUSTOMER
    |--------------------------------------------------------------------------
    */

    const [tourData, customerData] =
      await Promise.all([
        Tour.findOne({
          _id: tour,
          isDeleted: false,
        }).session(session),

        Customer.findOne({
          _id: customer,
          agent: agentProfile._id,
          isDeleted: false,
        }).session(session),
      ]);

    /*
    |--------------------------------------------------------------------------
    | TOUR
    |--------------------------------------------------------------------------
    */

    if (!tourData) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Tour not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CUSTOMER
    |--------------------------------------------------------------------------
    */

    if (!customerData) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message:
          "Customer not found or does not belong to this agent.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | TOUR STATUS
    |--------------------------------------------------------------------------
    */

    if (
      tourData.status === "inactive" ||
      tourData.status === "sold_out"
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "This tour is not currently available.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | PRICE
    |--------------------------------------------------------------------------
    */

    const price = Number(
      tourData.agentPrice ??
      tourData.price ??
      0
    );

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Invalid tour price.",
      });
    }

    const travelerCount =
      travelers.length;

    const totalAmount =
      price * travelerCount;

    /*
    |--------------------------------------------------------------------------
    | CUSTOMER NAME
    |--------------------------------------------------------------------------
    */

    const customerName =
      `${customerData.firstName || ""} ${
        customerData.lastName || ""
      }`.trim();

    /*
    |--------------------------------------------------------------------------
    | BOOKING DATA
    |--------------------------------------------------------------------------
    */

    const bookingData = {
      customer: customerData._id,

      user: customerData.user || null,

      customerSnapshot: {
        name: customerName,
        email: customerData.email || "",
        phone: customerData.phone || "",
      },

      bookingSource: "agent",

      contact: {
        name: customerName,
        email: customerData.email || "",
        phone: customerData.phone || "",
      },

      agent: agentProfile._id,

      tour: tourData._id,

      travelDate: new Date(travelDate),

      travelers,

      numberOfGuests: travelerCount,

      pickupLocation:
        pickupLocation || "",

      pickupTime:
        pickupTime
          ? new Date(pickupTime)
          : null,

      hotelName:
        hotelName || "",

      roomNumber:
        roomNumber || "",

      emergencyContact:
        emergencyContact || {},

      specialRequests:
        Array.isArray(specialRequests)
          ? specialRequests
          : [],

      subtotal: totalAmount,

      totalAmount,

      commissionRate:
        Number(agentProfile.commissionRate) || 0,

      paymentMethod:
        paymentMethod || "MPESA",

      paymentStatus: "pending",

      customerNotes:
        customerNotes || "",

      status: "pending",

      createdBy: req.user._id,

      updatedBy: req.user._id,

      isDeleted: false,
    };

    /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    */

    const booking =
      await Booking.create(
        [bookingData],
        { session }
      );

    /*
    |--------------------------------------------------------------------------
    | COMMISSION
    |--------------------------------------------------------------------------
    */

    if (
      typeof createCommission === "function"
    ) {
      await createCommission(
        booking[0],
        session
      );
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE CUSTOMER STATISTICS
    |--------------------------------------------------------------------------
    */

    customerData.totalBookings =
      Number(customerData.totalBookings || 0) + 1;

    customerData.lastBookingDate =
      new Date();

    await customerData.save({
      session,
    });

    /*
    |--------------------------------------------------------------------------
    | COMMIT
    |--------------------------------------------------------------------------
    */

    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message:
        "Agent booking created successfully.",
      booking: booking[0],
    });

  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    await session.endSession();
  }
};

/*
|--------------------------------------------------------------------------
| GET AGENT BOOKINGS
|--------------------------------------------------------------------------
*/

export const getAgentBookings = async (
  req,
  res,
  next
) => {
  try {
    const agentProfile =
      await Agent.findOne({
        user: req.user._id,
      });

    if (!agentProfile) {
      return res.status(404).json({
        success: false,
        message: "Agent profile not found.",
      });
    }

    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number(req.query.limit) || 20,
        1
      ),
      100
    );

    const skip =
      (page - 1) * limit;

    const filter = {
      agent: agentProfile._id,
      isDeleted: false,
    };

    if (
      req.query.status &&
      BOOKING_STATUSES.includes(
        req.query.status
      )
    ) {
      filter.status =
        req.query.status;
    }

    if (req.query.paymentStatus) {
      filter.paymentStatus =
        req.query.paymentStatus;
    }

    if (req.query.search) {
      const search =
        String(req.query.search)
          .trim();

      filter.$or = [
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
        {
          "customerSnapshot.phone": {
            $regex: search,
            $options: "i",
          },
        },
        {
          bookingNumber: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const [
      bookings,
      total,
    ] = await Promise.all([
      Booking.find(filter)
        .populate(
          "tour",
          "title price agentPrice duration destination"
        )
        .populate(
          "customer",
          "firstName lastName email phone"
        )
        .sort({
          createdAt: -1,
        })
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
      pages: Math.ceil(
        total / limit
      ),
      count: bookings.length,
      bookings,
    });

  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE AGENT BOOKING
|--------------------------------------------------------------------------
*/

export const getAgentBooking = async (
  req,
  res,
  next
) => {
  try {
    if (
      !isValidId(req.params.id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    const agentProfile =
      await Agent.findOne({
        user: req.user._id,
      });

    if (!agentProfile) {
      return res.status(404).json({
        success: false,
        message: "Agent profile not found.",
      });
    }

    const booking =
      await Booking.findOne({
        _id: req.params.id,
        agent: agentProfile._id,
        isDeleted: false,
      })
        .populate(
          "tour"
        )
        .populate(
          "customer"
        )
        .populate(
          "user",
          "name email phone"
        );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
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
    if (
      !isValidId(req.params.id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    const { status } =
      req.body;

    if (
      !BOOKING_STATUSES.includes(
        status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid booking status.",
      });
    }

    const agentProfile =
      await Agent.findOne({
        user: req.user._id,
      });

    if (!agentProfile) {
      return res.status(404).json({
        success: false,
        message: "Agent profile not found.",
      });
    }

    const booking =
      await Booking.findOne({
        _id: req.params.id,
        agent: agentProfile._id,
        isDeleted: false,
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (
      booking.status === "completed" &&
      status !== "completed"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Completed bookings cannot be modified.",
      });
    }

    if (
      booking.status === "cancelled" &&
      status !== "cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cancelled bookings cannot be reopened.",
      });
    }

    booking.status = status;

    booking.updatedBy =
      req.user._id;

    await booking.save();

    return res.status(200).json({
      success: true,
      message:
        "Booking status updated successfully.",
      booking,
    });

  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| DELETE / CANCEL AGENT BOOKING
|--------------------------------------------------------------------------
*/

export const cancelAgentBooking = async (
  req,
  res,
  next
) => {
  try {
    if (
      !isValidId(req.params.id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    const agentProfile =
      await Agent.findOne({
        user: req.user._id,
      });

    if (!agentProfile) {
      return res.status(404).json({
        success: false,
        message: "Agent profile not found.",
      });
    }

    const booking =
      await Booking.findOne({
        _id: req.params.id,
        agent: agentProfile._id,
        isDeleted: false,
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (
      booking.status === "completed"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Completed bookings cannot be cancelled.",
      });
    }

    booking.status =
      "cancelled";

    booking.cancelledAt =
      new Date();

    booking.cancelledBy =
      req.user._id;

    booking.cancellationReason =
      req.body.reason || "";

    booking.updatedBy =
      req.user._id;

    await booking.save();

    return res.status(200).json({
      success: true,
      message:
        "Booking cancelled successfully.",
      booking,
    });

  } catch (error) {
    next(error);
  }
};

export default {
  createBooking,
  getAgentBookings,
  getAgentBooking,
  updateBookingStatus,
  cancelAgentBooking,
};
