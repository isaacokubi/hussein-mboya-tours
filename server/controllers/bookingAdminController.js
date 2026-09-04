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

    /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | FILTERS
    |--------------------------------------------------------------------------
    */

    if (
      status &&
      BOOKING_STATUSES.includes(
        status
      )
    ) {
      filter.status =
        status;
    }

    if (
      paymentStatus &&
      BOOKING_PAYMENT_STATUSES.includes(
        paymentStatus
      )
    ) {
      filter.paymentStatus =
        paymentStatus;
    }

    /*
    |--------------------------------------------------------------------------
    | QUERY
    |--------------------------------------------------------------------------
    */

    const [bookings, total] =
      await Promise.all([

        Booking.find(filter)

          .populate(
            "customer",
            "name email phone user"
          )

          .populate(
            "user",
            "name email phone"
          )

          .populate(
            "tour",
            "title"
          )

          .populate(
            "assignedGuide",
            "name"
          )

          .populate(
            "assignedDriver",
            "name"
          )

          .populate(
            "assignedVehicle",
            "name registrationNumber"
          )

          .sort({
            createdAt: -1,
          })

          .skip(skip)

          .limit(pageSize)

          .lean(),

        Booking.countDocuments(filter),

      ]);

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    res.status(200).json({

      success: true,

      count: bookings.length,

      pagination: {

        total,

        page: currentPage,

        pages: Math.ceil(
          total / pageSize
        ),

        limit: pageSize,

      },

      data: bookings,

    });

  } catch (error) {

    next(error);

  }
};

/*
|--------------------------------------------------------------------------
| ROUTE ALIAS
|--------------------------------------------------------------------------
*/

export const getBookings =
  getAllBookings;

/*
|--------------------------------------------------------------------------
| GET SINGLE BOOKING
|--------------------------------------------------------------------------
*/

export const getBookingById = async (
  req,
  res,
  next
) => {
  try {
