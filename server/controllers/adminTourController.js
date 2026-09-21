import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
import mongoose from "mongoose";
import { getSystemSettings } from "../services/settingsService.js";
import Tour from "../models/Tour.js";
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
import Staff from "../models/Staff.js";
import Notification from "../models/Notification.js";
import { sendSMS } from "../services/smsService.js";
import { sendWhatsApp } from "../services/whatsappService.js";
import { cancelTourAndBookings } from "../services/tourCancellationService.js";


/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

const TOUR_STATUSES = [
  "draft",
  "upcoming",
  "ongoing",
  "fully-booked",
  "completed",
  "cancelled",
];

const ASSIGNMENT_STATUSES = [
  "pending",
  "assigned",
  "completed",
  "cancelled",
];/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const cleanString = (value) =>
  typeof value === "string" ? value.trim() : value;

const buildImages = (files = []) =>
  files.map((file) => ({
    url: file.path,
    publicId: file.filename || null,
  }));const validateTourData = (body) => {
  const errors = [];

  if (!body.title?.trim()) {
    errors.push("Title is required.");
  }

  if (!body.description?.trim()) {
    errors.push("Description is required.");
  }

  if (!body.destination) {
    errors.push("Destination is required.");
  }

  if (!body.country?.trim()) {
    errors.push("Country is required.");
  }

  if (!body.location?.trim()) {
    errors.push("Location is required.");
  }

  if (!body.date) {
    errors.push("Tour date is required.");
  }

  if (body.price === undefined || Number(body.price) < 0) {
    errors.push("Valid price is required.");
  }

  return errors;
};const checkDuplicateSlug = async (slug, id = null) => {
  if (!slug) return false;

  const existing = await Tour.findOne({
    slug: slug.trim().toLowerCase(),
  });

  if (!existing) {
    return false;
  }

  if (id && existing._id.toString() === id.toString()) {
    return false;
  }

  return true;
};/*
|--------------------------------------------------------------------------
| CREATE TOUR
|--------------------------------------------------------------------------
*/

export const getAllTours = async (req, res, next) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | Pagination
    |--------------------------------------------------------------------------
    */

    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(Number(req.query.limit) || 10, 10);

    const skip = (page - 1) * limit;

    /*
    |--------------------------------------------------------------------------
    | Filters
    |--------------------------------------------------------------------------
    */

    const filter = {
      isDeleted: false,
    };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.featured === "true") {
      filter.featured = true;
    }

    if (req.query.destination) {
      filter.destination = req.query.destination;
    }

    if (req.query.available === "true") {
      filter.available = true;
    }

    /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

    if (req.query.search) {
      filter.$or = [
        {
          title: {
            $regex: req.query.search,
            $options: "i",
          },
        },
        {
          country: {
            $regex: req.query.search,
            $options: "i",
          },
        },
        {
          location: {
            $regex: req.query.search,
            $options: "i",
          },
        },
      ];
    }

    /*
    |--------------------------------------------------------------------------
    | Fetch
    |--------------------------------------------------------------------------
    */

    const [tours, total] = await Promise.all([
      Tour.find(filter)
        .populate("destination", "name slug")
        .populate("assignedGuide", "name email")
        .populate("assignedDriver", "name email")
        .populate("assignedVehicle", "name registrationNumber")
        .populate("createdBy", "name email")
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      Tour.countDocuments(filter),
    ]);

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    res.status(200).json({
      success: true,

      page,

      limit,

      total,

      pages: Math.ceil(total / limit),

      count: tours.length,

      tours,
    });
  } catch (error) {
    next(error);
  }
};/*
|--------------------------------------------------------------------------
| GET SINGLE TOUR
|--------------------------------------------------------------------------
*/

export const getTour = async (req, res, next) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | Validate ID
    |--------------------------------------------------------------------------
    */

    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tour ID.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Fetch Tour
    |--------------------------------------------------------------------------
    */

    const tour = await Tour.findOne({
      _id: req.params.id,
      isDeleted: false,
    })
      .populate("destination")
      .populate("createdBy", "name email")
      .populate("assignedGuide", "name email phone")
      .populate("assignedDriver", "name email phone")
      .populate(
        "assignedVehicle",
        "name registrationNumber model capacity type status"
      )
      .lean();

    /*
    |--------------------------------------------------------------------------
    | Not Found
    |--------------------------------------------------------------------------
    */

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    res.status(200).json({
      success: true,
      tour,
    });

  } catch (error) {
    next(error);
  }
};/*
|--------------------------------------------------------------------------
| UPDATE TOUR
|--------------------------------------------------------------------------
*/

export const restoreTour = async (req, res, next) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | Validate ID
    |--------------------------------------------------------------------------
    */

    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tour ID.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Find Deleted Tour
    |--------------------------------------------------------------------------
    */

    const tour = await Tour.findOne({
      _id: req.params.id,
      isDeleted: true,
    });

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Deleted tour not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Restore Tour
    |--------------------------------------------------------------------------
    */

    tour.isDeleted = false;

    if ("deletedAt" in tour) {
      tour.deletedAt = null;
    }

    if ("deletedBy" in tour) {
      tour.deletedBy = null;
    }

    await tour.save();

    /*
    |--------------------------------------------------------------------------
    | Restore Vehicle Availability
    |--------------------------------------------------------------------------
    */

    if (tour.assignedVehicle) {
      const vehicle = await Vehicle.findById(
        tour.assignedVehicle
      );

      if (vehicle) {
        vehicle.status = "available";
        vehicle.assignedTour = null;
        await vehicle.save();
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Populate
    |--------------------------------------------------------------------------
    */

    await tour.populate([
      {
        path: "assignedGuide",
        select: "name email phone",
      },
      {
        path: "assignedDriver",
        select: "name phone",
      },
      {
        path: "assignedVehicle",
        select: "name registrationNumber model",
      },
    ]);

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    res.status(200).json({
      success: true,
      message: "Tour restored successfully.",
      tour,
    });

  } catch (error) {
    next(error);
  }
};
