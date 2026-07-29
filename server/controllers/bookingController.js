// server/controllers/bookingController.js

import Booking from "../models/Booking.js";

import Tour from "../models/Tour.js";

import { reserveSlots } from "../services/inventoryService.js";

/*
|--------------------------------------------------------------------------
| CHECK TOUR CAPACITY
|--------------------------------------------------------------------------
*/

const validateTourCapacity = async (
  tourId,

  requestedGuests,
) => {
  const bookings = await Booking.aggregate([
    {
      $match: {
        tour: tourId,

        bookingStatus: {
          $in: ["pending", "confirmed"],
        },
      },
    },

    {
      $group: {
        _id: null,

        bookedGuests: {
          $sum: "$travelerCount",
        },
      },
    },
  ]);

  const bookedGuests = bookings.length ? bookings[0].bookedGuests : 0;

  const tour = await Tour.findById(tourId);

  if (!tour) {
    throw new Error("Tour not found");
  }

  return bookedGuests + requestedGuests <= tour.capacity;
};

/*
|--------------------------------------------------------------------------
| CREATE BOOKING
|--------------------------------------------------------------------------
*/

export const createBooking = async (
  req,

  res,

  next,
) => {
  try {
    const {
      tour,

      travelDate,

      travelers,

      contact,

      paymentMethod,

      amount,
    } = req.body;

    const tourData = await Tour.findById(tour);

    if (!tourData) {
      return res.status(404).json({
        success: false,

        message: "Tour not found",
      });
    }

    const travelerCount = travelers?.length || 1;

    const available = await validateTourCapacity(
      tour,

      travelerCount,
    );

    if (!available) {
      return res.status(400).json({
        success: false,

        message: "No available slots",
      });
    }

    const subtotal = tourData.price * travelerCount;

    let discountAmount = 0;

    if (tourData.discount) {
      discountAmount = (subtotal * tourData.discount) / 100;
    }

    const finalAmount = amount || subtotal - discountAmount;

    const depositAmount = tourData.depositRequired || 0;

    const balanceAmount = finalAmount - depositAmount;

    const booking = await Booking.create({
      customer: req.user._id,

      user: req.user._id,

      customerSnapshot: {
        name: req.user.name,

        email: req.user.email,

        phone: req.user.phone,
      },

      tour,

      travelDate,

      travelers,

      travelerCount,

      numberOfGuests: travelerCount,

      contact,

      subtotal,

      discountAmount,

      totalAmount: finalAmount,

      amount: finalAmount,

      depositAmount,

      balanceAmount,

      paymentMethod: paymentMethod || "MPESA",

      paymentStatus: "pending",

      bookingStatus: "pending",

      status: "pending",

      assigned: false,
    });

    await reserveSlots(
      tour,

      travelerCount,
    );

    const populatedBooking = await Booking.findById(booking._id)

      .populate("tour")

      .populate(
        "customer",

        "-password",
      )

      .populate(
        "user",

        "-password",
      );

    res.status(201).json({
      success: true,

      message: "Booking created successfully",

      booking: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET MY BOOKINGS
|--------------------------------------------------------------------------
*/

export const getMyBookings = async (
  req,

  res,

  next,
) => {
  try {
    const bookings = await Booking.find({
      $or: [
        {
          user: req.user._id,
        },

        {
          customer: req.user._id,
        },
      ],
    })

      .populate("tour")

      .sort({
        createdAt: -1,
      });

    res.json({
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
| ADMIN GET ALL BOOKINGS
|--------------------------------------------------------------------------
|
| Filters:
| - status
| - paymentStatus
| - search
|
|--------------------------------------------------------------------------
*/

export const getAllBookings = async (
  req,

  res,

  next,
) => {
  try {
    const {
      status,

      paymentStatus,

      search,
    } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    let bookings = await Booking.find(filter)

      .populate(
        "customer",

        "name email phone",
      )

      .populate(
        "user",

        "name email",
      )

      .populate(
        "tour",

        "title destination price",
      )

      .populate(
        "assignedGuide",

        "name email phone",
      )

      .populate(
        "assignedDriver",

        "name email phone",
      )

      .populate("assignedVehicle")

      .sort({
        createdAt: -1,
      });

    if (search) {
      const keyword = search.toLowerCase();

      bookings = bookings.filter(
        (booking) =>
          booking.customer?.name

            ?.toLowerCase()

            .includes(keyword) ||
          booking.bookingNumber

            ?.toLowerCase()

            .includes(keyword) ||
          booking.tour?.title

            ?.toLowerCase()

            .includes(keyword) ||
          booking.customer?.email

            ?.toLowerCase()

            .includes(keyword),
      );
    }

    res.status(200).json({
      success: true,

      count: bookings.length,

      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// compatibility

export const getBookings = getAllBookings;

/*
|--------------------------------------------------------------------------
| GET CONFIRMED BOOKINGS FOR TOUR MANAGER
|--------------------------------------------------------------------------
*/

export const getConfirmedBookings = async (
  req,

  res,

  next,
) => {
  try {
    const bookings = await Booking.find({
      paymentStatus: "paid",

      $or: [
        {
          bookingStatus: "confirmed",
        },

        {
          status: "confirmed",
        },
      ],
    })

      .populate("tour")

      .populate(
        "customer",

        "name email phone",
      )

      .populate(
        "user",

        "name email phone",
      )

      .populate("assignedGuide")

      .populate("assignedDriver")

      .populate("assignedVehicle")

      .sort({
        travelDate: 1,
      });

    res.json({
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

export const getBookingById = async (
  req,

  res,

  next,
) => {
  try {
    const booking = await Booking.findById(req.params.id)

      .populate("tour")

      .populate(
        "customer",

        "name email phone",
      )

      .populate(
        "user",

        "name email phone",
      )

      .populate("assignedGuide")

      .populate("assignedDriver")

      .populate("assignedVehicle");

    if (!booking) {
      return res.status(404).json({
        success: false,

        message: "Booking not found",
      });
    }

    res.json({
      success: true,

      booking,
    });
  } catch (error) {
    next(error);
  }
};

// compatibility

export const getBooking = getBookingById;

/*
|--------------------------------------------------------------------------
| UPDATE PAYMENT STATUS
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| UPDATE PAYMENT STATUS
|--------------------------------------------------------------------------
*/

export const updateBookingPayment = async (
  bookingId,

  paymentStatus,
) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error("Booking not found");
  }

  booking.paymentStatus = paymentStatus;

  if (paymentStatus === "paid") {
    booking.status = "confirmed";

    booking.bookingStatus = "confirmed";
  }

  if (paymentStatus === "failed") {
    booking.status = "pending";

    booking.bookingStatus = "pending";
  }

  await booking.save();

  return booking;
};

/*
|--------------------------------------------------------------------------
| UPDATE BOOKING STATUS ADMIN
|--------------------------------------------------------------------------
*/

export const updateBookingStatus = async (
  req,

  res,

  next,
) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,

        message: "Booking not found",
      });
    }

    booking.status = req.body.status || booking.status;

    booking.bookingStatus = req.body.bookingStatus || booking.bookingStatus;

    booking.paymentStatus = req.body.paymentStatus || booking.paymentStatus;

    if (req.body.assigned !== undefined) {
      booking.assigned = req.body.assigned;
    }

    if (booking.paymentStatus === "paid") {
      booking.status = "confirmed";

      booking.bookingStatus = "confirmed";
    }

    await booking.save();

    res.json({
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

export const cancelBooking = async (
  req,

  res,

  next,
) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,

        message: "Booking not found",
      });
    }

    booking.bookingStatus = "cancelled";

    booking.status = "cancelled";

    await booking.save();

    res.json({
      success: true,

      message: "Booking cancelled successfully",

      booking,
    });
  } catch (error) {
    next(error);
  }
};
