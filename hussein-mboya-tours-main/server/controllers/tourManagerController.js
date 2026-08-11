// server/controllers/tourManagerController.js

import mongoose from "mongoose";
import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import {
  validateAndLoadResources,
  applyTourResources,
  releaseTourResources,
} from "../services/tourResourceService.js";
import { assignTourResources } from "./tourAssignmentController.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const loadTour = (id) =>
  Tour.findById(id)
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
    );

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
      Tour.countDocuments({ isDeleted: { $ne: true } }),
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
      User.countDocuments({ role: "customer" }),
      Payment.aggregate([
        { $match: { status: "completed" } },
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
          "name email phone position availability"
        )
        .populate(
          "assignedDriver",
          "name email phone position availability"
        )
        .populate(
          "assignedVehicle",
          "name registrationNumber registration model type capacity status"
        )
        .sort({ startDate: 1, date: 1 })
        .limit(10)
        .lean(),
      Booking.find({ isDeleted: { $ne: true } })
        .populate("customer", "name email")
        .populate("user", "name email")
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
      customer:
        booking.customer ||
        booking.user || {
          name: booking.customerSnapshot?.name || "Unknown",
        },
      tour: booking.tour || { title: "Unknown" },
      guests: booking.numberOfGuests || 0,
      paymentStatus: booking.paymentStatus || "pending",
      amount: booking.totalAmount || 0,
      status: booking.status || "pending",
    }));

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalTours,
          upcomingTours: upcomingToursCount,
          totalCustomers,
          revenue: revenueResult[0]?.total || 0,
        },
        upcomingTours: formattedTours,
        recentBookings: formattedBookings,
      },
    });
  } catch (error) {
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
    const title = String(body.title || "").trim();
    const description = String(body.description || "").trim();
    const country = String(body.country || "").trim();
    const location = String(body.location || "").trim();

    if (
      !title ||
      !description ||
      !body.destination ||
      !country ||
      !location ||
      !body.date ||
      body.price === undefined ||
      Number(body.price) < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, destination, country, location, date and a valid price are required.",
      });
    }

    const guideId = body.assignedGuide || body.guide || null;
    const driverId = body.assignedDriver || body.driver || null;
    const vehicleId = body.assignedVehicle || body.vehicle || null;

    if (guideId || driverId || vehicleId) {
      try {
        await validateAndLoadResources({
          guideId,
          driverId,
          vehicleId,
        });
      } catch (error) {
        return res.status(error.statusCode || 400).json({
          success: false,
          message: error.message,
        });
      }
    }

    const capacity = Math.max(Number(body.capacity) || 20, 1);
    const duration = Math.max(Number(body.duration) || 1, 1);
    const price = Number(body.price);
    const discount = Number(body.discount) || 0;

    if (discount < 0 || discount > 100) {
      return res.status(400).json({
        success: false,
        message: "Discount must be between 0 and 100.",
      });
    }

    const tour = await Tour.create({
      ...body,
      title,
      description,
      country,
      location,
      capacity,
      price,
      duration: String(body.duration ?? duration),
      durationDetails: {
        days: duration,
        nights: Math.max(duration - 1, 0),
      },
      discount,
      assignedGuide: null,
      assignedDriver: null,
      assignedVehicle: null,
      assignmentStatus: "pending",
      status: body.status || "upcoming",
      published: body.published ?? true,
      available: body.available ?? true,
      availabilitySettings: {
        totalSlots: capacity,
        bookedSlots: 0,
        waitlistEnabled: false,
      },
      createdBy: req.user._id,
    });

    if (guideId || driverId || vehicleId) {
      try {
        await applyTourResources(tour, {
          guideId,
          driverId,
          vehicleId,
        });
      } catch (error) {
        await Tour.findByIdAndDelete(tour._id);
        return res.status(error.statusCode || 400).json({
          success: false,
          message: error.message,
        });
      }
    }

    const created = await loadTour(tour._id);

    return res.status(201).json({
      success: true,
      message: "Tour created successfully.",
      data: created,
      tour: created,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET TOURS
|--------------------------------------------------------------------------
*/

export const getTours = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      100
    );

    const filter = {
      isDeleted: { $ne: true },
    };

    if (req.query.status) filter.status = req.query.status;

    if (req.query.upcoming === "true" || req.query.upcoming === "1") {
      const now = new Date();
      filter.$or = [
        { startDate: { $gte: now } },
        { date: { $gte: now } },
      ];
      filter.status = {
        $in: ["scheduled", "upcoming", "ongoing"],
      };
    }

    const [tours, total] = await Promise.all([
      Tour.find(filter)
        .populate("destination")
        .populate("assignedGuide", "name email phone position availability")
        .populate("assignedDriver", "name email phone position availability")
        .populate(
          "assignedVehicle",
          "name registrationNumber registration model type capacity status"
        )
        .populate("createdBy", "name email")
        .sort({ startDate: 1, date: 1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Tour.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: tours.length,
      total,
      data: tours,
      tours,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
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
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tour ID.",
      });
    }

    const tour = await Tour.findOne({
      _id: req.params.id,
      isDeleted: { $ne: true },
    });

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found.",
      });
    }

    const body = req.body || {};
    const allowedFields = [
      "name",
      "title",
      "description",
      "shortDescription",
      "slug",
      "category",
      "destination",
      "country",
      "location",
      "meetingPoint",
      "coordinates",
      "date",
      "startDate",
      "endDate",
      "duration",
      "durationDetails",
      "difficulty",
      "capacity",
      "price",
      "agentPrice",
      "discount",
      "discountPrice",
      "highlights",
      "inclusions",
      "exclusions",
      "languages",
      "minimumAge",
      "maximumAge",
      "itinerary",
      "availability",
      "availableDates",
      "pricingRules",
      "cancellationPolicy",
      "bookingDeadline",
      "instantBooking",
      "featured",
      "published",
      "available",
      "status",
      "seo",
      "tags",
      "video",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) tour[field] = body[field];
    }

    const resourceChanged =
      "assignedGuide" in body ||
      "guide" in body ||
      "assignedDriver" in body ||
      "driver" in body ||
      "assignedVehicle" in body ||
      "vehicle" in body;

    if (resourceChanged) {
      const guideId =
        body.assignedGuide ?? body.guide ?? tour.assignedGuide ?? null;
      const driverId =
        body.assignedDriver ?? body.driver ?? tour.assignedDriver ?? null;
      const vehicleId =
        body.assignedVehicle ?? body.vehicle ?? tour.assignedVehicle ?? null;

      try {
        await validateAndLoadResources({
          guideId,
          driverId,
          vehicleId,
          currentGuideId: tour.assignedGuide,
          currentDriverId: tour.assignedDriver,
          currentVehicleId: tour.assignedVehicle,
        });
      } catch (error) {
        return res.status(error.statusCode || 400).json({
          success: false,
          message: error.message,
        });
      }

      await tour.save();
      await applyTourResources(tour, {
        guideId,
        driverId,
        vehicleId,
      });
    } else {
      await tour.save();
    }

    const updated = await loadTour(tour._id);

    return res.status(200).json({
      success: true,
      message: "Tour updated successfully.",
      data: updated,
      tour: updated,
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
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tour ID.",
      });
    }

    const tour = await Tour.findOne({
      _id: req.params.id,
      isDeleted: { $ne: true },
    });

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found.",
      });
    }

    await releaseTourResources(tour);

    tour.isDeleted = true;
    tour.deletedAt = new Date();
    tour.deletedBy = req.user._id;
    tour.available = false;
    tour.status = "cancelled";
    tour.assignmentStatus = "cancelled";
    tour.assignedGuide = null;
    tour.assignedDriver = null;
    tour.assignedVehicle = null;

    await tour.save();

    return res.status(200).json({
      success: true,
      message: "Tour deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| FRONTEND COMPATIBILITY: ASSIGN GUIDE
|--------------------------------------------------------------------------
*/

export const assignTourGuide = async (req, res, next) => {
  const { tourId, guideId } = req.body || {};

  if (!tourId || !guideId) {
    return res.status(400).json({
      success: false,
      message: "tourId and guideId are required.",
    });
  }

  req.params.id = tourId;
  req.body = { guideId };

  return assignTourResources(req, res, next);
};

/*
|--------------------------------------------------------------------------
| BOOKING STATUS
|--------------------------------------------------------------------------
*/

export const cancelBooking = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (
      ["cancelled", "refunded", "completed"].includes(
        booking.status
      )
    ) {
      return res.status(400).json({
        success: false,
        message: `A ${booking.status} booking cannot be cancelled.`,
      });
    }

    booking.status = "cancelled";
    booking.cancelledAt = new Date();
    booking.cancelledBy = req.user._id;
    booking.cancellationReason = String(
      req.body?.reason || "Cancelled by tour manager"
    );

    await booking.save();

    if (booking.tour && booking.numberOfGuests) {
      const tour = await Tour.findById(booking.tour);

      if (tour) {
        await tour.releaseSlot(
          Number(booking.numberOfGuests || 1)
        );
      }
    }

    const updated = await Booking.findById(booking._id)
      .populate("user", "name email phone")
      .populate("customer", "name email phone")
      .populate("tour", "title")
      .lean();

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully.",
      booking: updated,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const completeBooking = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (["cancelled", "refunded"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `A ${booking.status} booking cannot be completed.`,
      });
    }

    if (
      !["paid", "completed"].includes(
        String(booking.paymentStatus || "").toLowerCase()
      )
    ) {
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
