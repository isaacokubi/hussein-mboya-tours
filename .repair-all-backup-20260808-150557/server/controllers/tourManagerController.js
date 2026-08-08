import mongoose from "mongoose";
import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
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
    ] = await Promise.all([
      Tour.countDocuments({
        isDeleted: false,
      }),

      Tour.countDocuments({
        isDeleted: false,
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

      Booking.aggregate([
        {
          $match: {
            paymentStatus: "paid",
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$totalAmount",
            },
          },
        },
      ]),
    ]);

    const revenue = revenueResult[0]?.total || 0;

    const upcomingTours = await Tour.find({
      isDeleted: false,
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
      .lean();

    const formattedTours = upcomingTours.map((tour) => ({
      id: tour._id,
      _id: tour._id,

      name: tour.title || "Untitled Tour",
      title: tour.title || "Untitled Tour",

      date: tour.startDate
        ? new Date(tour.startDate).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : tour.date
        ? new Date(tour.date).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "No date",

      guests:
        tour.availabilitySettings?.bookedSlots ??
        tour.capacity ??
        0,

      guide:
        tour.assignedGuide?.name ||
        "Not Assigned",

      driver:
        tour.assignedDriver?.name ||
        "Not Assigned",

      vehicle:
        tour.assignedVehicle?.registrationNumber ||
        tour.assignedVehicle?.registration ||
        tour.assignedVehicle?.name ||
        "Not Assigned",

      status: tour.status || "draft",

      assignmentStatus:
        tour.assignmentStatus || "pending",

      assignedGuide: tour.assignedGuide || null,
      assignedDriver: tour.assignedDriver || null,
      assignedVehicle: tour.assignedVehicle || null,
    }));

    const recentBookings = await Booking.find()
      .populate("customer", "name email")
      .populate("tour", "title")
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    const formattedBookings = recentBookings.map((booking) => ({
      id: booking._id,
      _id: booking._id,

      customer:
        booking.customer?.name ||
        booking.customerSnapshot?.name ||
        "Unknown",

      tour:
        booking.tour?.title ||
        "Unknown",

      guests:
        booking.numberOfGuests ||
        booking.guests ||
        0,

      payment:
        booking.paymentStatus ||
        "pending",

      amount:
        booking.totalAmount ||
        0,
    }));

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
    console.error(
      "TOUR MANAGER DASHBOARD ERROR:",
      error
    );

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
        const tour = await Tour.create({
            ...req.body,
            createdBy: req.user._id,
        });

        return res.status(201).json({
            success: true,
            message: "Tour created successfully",
            data: tour,
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
        const tours = await Tour.find()
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
            "name registrationNumber type capacity status"
        )
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .lean();

        return res.status(200).json({
            success: true,
            count: tours.length,
            data: tours,
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
            return res.status(400).json({
                success: false,
                message: "Invalid tour ID",
            });
        }

        const tour = await Tour.findByIdAndDelete(req.params.id);

        if (!tour) {
            return res.status(404).json({
                success: false,
                message: "Tour not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Tour deleted successfully",
        });
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