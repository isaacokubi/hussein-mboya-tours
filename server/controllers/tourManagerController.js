import mongoose from "mongoose";
import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import Staff from "../models/Staff.js";
import Vehicle from "../models/Vehicle.js";
import { assignTourResources } from "./tourAssignmentController.js";

/*
|--------------------------------------------------------------------------
| TOUR MANAGER DASHBOARD
|--------------------------------------------------------------------------
*/

export const getTourManagerDashboard = async (req, res, next) => {
  try {
    const now = new Date();

    const [
      totalTours,
      upcomingToursCount,
      totalCustomers,
      revenueResult,
      upcomingTours,
      recentBookings,
    ] = await Promise.all([
      Tour.countDocuments({
        isDeleted: { $ne: true },
      }),

      Tour.countDocuments({
        isDeleted: { $ne: true },
        $or: [
          { startDate: { $gte: now } },
          { date: { $gte: now } },
        ],
        status: {
          $in: ["scheduled", "upcoming", "ongoing"],
        },
      }),

      User.countDocuments({
        role: "customer",
      }),

      // Revenue is actual completed payments, not booking value.
      Payment.aggregate([
        {
          $match: {
            status: "completed",
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $max: [
                  0,
                  {
                    $subtract: [
                      { $ifNull: ["$amount", 0] },
                      { $ifNull: ["$refundedAmount", 0] },
                    ],
                  },
                ],
              },
            },
          },
        },
      ]),

      Tour.find({
        isDeleted: { $ne: true },
        $or: [
          { startDate: { $gte: now } },
          { date: { $gte: now } },
        ],
        status: {
          $in: ["scheduled", "upcoming", "ongoing"],
        },
      })
        .populate(
          "assignedGuide",
          "name email phone position availability assignedTours"
        )
        .populate(
          "assignedDriver",
          "name email phone position availability assignedTours"
        )
        .populate(
          "assignedVehicle",
          "name registrationNumber registration model type capacity status assignedTour"
        )
        .sort({ startDate: 1, date: 1 })
        .limit(10)
        .lean(),

      Booking.find({
        isDeleted: { $ne: true },
      })
        .populate("customer", "name email")
        .populate("tour", "title")
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
    ]);

    const tourIds = upcomingTours.map((tour) => tour._id);

    const guestStats = tourIds.length
      ? await Booking.aggregate([
          {
            $match: {
              tour: { $in: tourIds },
              isDeleted: { $ne: true },
              status: {
                $in: ["confirmed", "assigned", "ongoing"],
              },
            },
          },
          {
            $group: {
              _id: "$tour",
              guests: {
                $sum: { $ifNull: ["$numberOfGuests", 1] },
              },
            },
          },
        ])
      : [];

    const guestMap = new Map(
      guestStats.map((item) => [
        item._id.toString(),
        item.guests || 0,
      ])
    );

    const formattedTours = upcomingTours.map((tour) => ({
      id: tour._id,
      _id: tour._id,

      name: tour.title || "Untitled Tour",
      title: tour.title || "Untitled Tour",

      date: tour.startDate || tour.date || null,

      // This is the real number of guests from non-cancelled bookings.
      guests: guestMap.get(tour._id.toString()) || 0,

      capacity: tour.capacity || 0,

      guide: tour.assignedGuide || null,
      driver: tour.assignedDriver || null,
      vehicle: tour.assignedVehicle || null,

      status: tour.status || "draft",
      assignmentStatus: tour.assignmentStatus || "pending",

      assignedGuide: tour.assignedGuide || null,
      assignedDriver: tour.assignedDriver || null,
      assignedVehicle: tour.assignedVehicle || null,
    }));

    const formattedBookings = recentBookings.map((booking) => ({
      id: booking._id,
      _id: booking._id,

      customer: booking.customer || {
        name: booking.customerSnapshot?.name || "Unknown",
      },

      tour: booking.tour || {
        title: "Unknown",
      },

      guests: booking.numberOfGuests || 0,

      paymentStatus: booking.paymentStatus || "pending",

      amount: booking.totalAmount || 0,

      status: booking.status || "pending",
    }));

    const revenue = revenueResult[0]?.total || 0;

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalTours,
          upcomingTours: upcomingToursCount,
          totalCustomers,
          revenue,
        },
        upcomingTours: formattedTours,
        recentBookings: formattedBookings,
      },
    });
  } catch (error) {
    console.error("TOUR MANAGER DASHBOARD ERROR:", error);
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| CREATE TOUR
|--------------------------------------------------------------------------
*/

export const createTour = async (req, res, next) => {
  try {
    const body = req.body || {};
    const {
      guide,
      assignedGuide,
      driver,
      assignedDriver,
      vehicle,
      assignedVehicle,
      capacity,
      duration,
      price,
      ...rest
    } = body;

    if (
      !rest.title?.trim() ||
      !rest.description?.trim() ||
      !rest.destination ||
      !rest.country?.trim() ||
      !rest.location?.trim() ||
      !rest.date ||
      price === undefined ||
      Number(price) < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, destination, country, location, date and a valid price are required.",
      });
    }

    const guideId = assignedGuide || guide || null;
    const driverId = assignedDriver || driver || null;
    const vehicleId = assignedVehicle || vehicle || null;

    const [guideDoc, driverDoc, vehicleDoc] = await Promise.all([
      guideId
        ? Staff.findOne({
            _id: guideId,
            position: "guide",
            isActive: true,
            isDeleted: { $ne: true },
          })
        : null,
      driverId
        ? Staff.findOne({
            _id: driverId,
            position: "driver",
            isActive: true,
            isDeleted: { $ne: true },
          })
        : null,
      vehicleId
        ? Vehicle.findOne({
            _id: vehicleId,
            isActive: true,
            isDeleted: { $ne: true },
          })
        : null,
    ]);

    if (guideId && (!guideDoc || guideDoc.availability !== "available")) {
      return res.status(400).json({
        success: false,
        message: "Selected guide is unavailable.",
      });
    }

    if (driverId && (!driverDoc || driverDoc.availability !== "available")) {
      return res.status(400).json({
        success: false,
        message: "Selected driver is unavailable.",
      });
    }

    if (vehicleId && (!vehicleDoc || vehicleDoc.status !== "available")) {
      return res.status(400).json({
        success: false,
        message: "Selected vehicle is unavailable.",
      });
    }

    const numericCapacity = Number(capacity) || 20;
    const numericDuration = Number(duration) || 1;
    const numericPrice = Number(price);
    const numericDiscount = Number(rest.discount) || 0;

    const tour = await Tour.create({
      ...rest,
      title: rest.title.trim(),
      description: rest.description.trim(),
      country: rest.country.trim(),
      location: rest.location.trim(),
      price: numericPrice,
      capacity: numericCapacity,
      duration: String(duration ?? numericDuration),
      durationDetails: {
        days: numericDuration,
        nights: 0,
      },
      discount: numericDiscount,
      assignedGuide: guideDoc?._id || null,
      assignedDriver: driverDoc?._id || null,
      assignedVehicle: vehicleDoc?._id || null,
      assignmentStatus:
        guideDoc || driverDoc || vehicleDoc ? "assigned" : "pending",
      status: rest.status || "upcoming",
      published: rest.published ?? true,
      available: true,
      availabilitySettings: {
        totalSlots: numericCapacity,
        bookedSlots: 0,
        waitlistEnabled: false,
      },
      createdBy: req.user._id,
    });

    if (guideDoc) {
      await Staff.findByIdAndUpdate(guideDoc._id, {
        $set: { availability: "busy" },
        $addToSet: { assignedTours: tour._id },
      });
    }

    if (driverDoc) {
      await Staff.findByIdAndUpdate(driverDoc._id, {
        $set: { availability: "busy" },
        $addToSet: { assignedTours: tour._id },
      });
    }

    if (vehicleDoc) {
      await Vehicle.findByIdAndUpdate(vehicleDoc._id, {
        $set: {
          status: "assigned",
          assignedTour: tour._id,
        },
      });
    }

    const createdTour = await Tour.findById(tour._id)
      .populate("destination")
      .populate("assignedGuide", "name email phone position availability")
      .populate("assignedDriver", "name email phone position availability")
      .populate(
        "assignedVehicle",
        "name registrationNumber registration model type capacity status"
      )
      .lean();

    return res.status(201).json({
      success: true,
      message: "Tour created successfully",
      data: createdTour,
      tour: createdTour,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL TOURS
|--------------------------------------------------------------------------
*/

export const getTours = async (req, res, next) => {
    try {
        const { upcoming, page = 1, limit = 10, status } = req.query;
        const filter = { isDeleted: { $ne: true } };

        if (status) filter.status = status;

        if (upcoming === "true" || upcoming === "1") {
            const now = new Date();
            filter.$or = [
                { startDate: { $gte: now } },
                { date: { $gte: now } },
            ];
            filter.status = {
                $in: ["scheduled", "upcoming", "confirmed", "active", "ongoing"],
            };
        }

        const currentPage = Math.max(Number(page) || 1, 1);
        const pageLimit = Math.min(Math.max(Number(limit) || 10, 1), 10);

        const [tours, total] = await Promise.all([
          Tour.find(filter)
            .populate("assignedGuide", "name email phone position availability")
            .populate("assignedDriver", "name email phone position availability")
            .populate("assignedVehicle", "name registrationNumber type capacity status")
            .populate("createdBy", "name email")
            .sort({ startDate: 1, date: 1, createdAt: -1 })
            .skip((currentPage - 1) * pageLimit)
            .limit(pageLimit)
            .lean(),
          Tour.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            count: tours.length,
            total,
            data: tours,
            tours,
            pagination: { total, page: currentPage, limit: pageLimit, pages: Math.ceil(total / pageLimit) },
        });
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| UPDATE TOUR
|--------------------------------------------------------------------------
*/

export const updateTour = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid tour ID",
            });
        }

        const tour = await Tour.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!tour) {
            return res.status(404).json({
                success: false,
                message: "Tour not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Tour updated successfully",
            data: tour,
        });
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| DELETE TOUR
|--------------------------------------------------------------------------
*/

export const deleteTour = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid tour ID" });
    }

    const tour = await Tour.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!tour) {
      return res.status(404).json({ success: false, message: "Tour not found" });
    }

    tour.isDeleted = true;
    tour.deletedAt = new Date();
    tour.status = "cancelled";
    tour.assignmentStatus = "cancelled";
    await tour.save();

    if (tour.assignedGuide) {
      const guide = await Staff.findById(tour.assignedGuide);
      if (guide) {
        guide.assignedTours = (guide.assignedTours || []).filter(id => id.toString() !== tour._id.toString());
        if (!guide.assignedTours.length) guide.availability = "available";
        await guide.save();
      }
    }
    if (tour.assignedDriver) {
      const driver = await Staff.findById(tour.assignedDriver);
      if (driver) {
        driver.assignedTours = (driver.assignedTours || []).filter(id => id.toString() !== tour._id.toString());
        if (!driver.assignedTours.length) driver.availability = "available";
        await driver.save();
      }
    }
    if (tour.assignedVehicle) {
      await Vehicle.findByIdAndUpdate(tour.assignedVehicle, {
        status: "available",
        assignedTour: null,
      });
    }

    return res.status(200).json({ success: true, message: "Tour deleted successfully" });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| FRONTEND-COMPATIBLE GUIDE ASSIGNMENT
|--------------------------------------------------------------------------
|
| The manager UI sends { tourId, guideId } to /tourmanager/assign-guide.
| Reuse the same assignment rules as the general tour assignment flow.
|--------------------------------------------------------------------------
*/

export const assignTourGuide = async (req, res, next) => {
    try {
        const { tourId, guideId } = req.body;

        if (!tourId) {
            return res.status(400).json({
                success: false,
                message: "tourId is required",
            });
        }

        if (!guideId) {
            return res.status(400).json({
                success: false,
                message: "guideId is required",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(tourId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid tour ID",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(guideId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid guide ID",
            });
        }

        /*
         * Compatibility adapter for the existing manager frontend.
         *
         * Frontend:
         * POST /api/tourmanager/assign-guide
         * { tourId, guideId }
         *
         * Canonical assignment:
         * PUT /api/tour-assignments/:id/assign
         * { guideId }
         */

        req.params.id = tourId;
        req.body = {
            guideId,
        };

        return assignTourResources(req, res, next);
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| MARK BOOKING COMPLETED
|--------------------------------------------------------------------------
|
| Tour managers can complete a paid/confirmed booking after the trip is
| finished. This keeps the booking status consistent across dashboards.
|--------------------------------------------------------------------------
*/

export const completeBooking = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID",
            });
        }

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        if (["cancelled", "refunded"].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: `A ${booking.status} booking cannot be completed.`,
            });
        }

        if (booking.paymentStatus !== "paid") {
            return res.status(400).json({
                success: false,
                message: "Only paid bookings can be marked as completed.",
            });
        }

        booking.status = "completed";
        booking.completedAt = new Date();

        await booking.save();

        const updatedBooking = await Booking.findById(booking._id)
            .populate("user", "name email phone")
            .populate("customer", "name email phone")
            .populate("tour", "title")
            .populate("assignedGuide", "name email phone")
            .populate("assignedDriver", "name email phone")
            .populate("assignedVehicle", "name registrationNumber")
            .lean();

        return res.status(200).json({
            success: true,
            message: "Booking marked as completed.",
            data: updatedBooking,
            booking: updatedBooking,
        });
    } catch (error) {
        next(error);
    }
};
