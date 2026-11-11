/**
 * Purpose: admin Tour Controller HTTP controller. Main declarations: isValidId, cleanString, buildImages, validateTourData, checkDuplicateSlug.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../services/settingsService.js so this module can use its exported dependencies.
import { getSystemSettings } from "../services/settingsService.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Vehicle.js so this module can use its exported dependencies.
import Vehicle from "../models/Vehicle.js";
// Load ../models/Staff.js so this module can use its exported dependencies.
import Staff from "../models/Staff.js";
// Load ../models/Notification.js so this module can use its exported dependencies.
import Notification from "../models/Notification.js";
// Load ../services/smsService.js so this module can use its exported dependencies.
import { sendSMS } from "../services/smsService.js";
// Load ../services/whatsappService.js so this module can use its exported dependencies.
import { sendWhatsApp } from "../services/whatsappService.js";
// Load ../services/tourCancellationService.js so this module can use its exported dependencies.
import { cancelTourAndBookings } from "../services/tourCancellationService.js";


/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

// Declare TOUR_STATUSES for use by the surrounding module or function.
const TOUR_STATUSES = [
  "draft",
  "upcoming",
  "ongoing",
  "fully-booked",
  "completed",
  "cancelled",
];

// Declare ASSIGNMENT_STATUSES for use by the surrounding module or function.
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

// Declare isValidId for use by the surrounding module or function.
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Declare cleanString for use by the surrounding module or function.
const cleanString = (value) =>
  typeof value === "string" ? value.trim() : value;

// Declare buildImages for use by the surrounding module or function.
const buildImages = (files = []) =>
  files.map((file) => ({
    url: file.path,
    publicId: file.filename || null,
  }));const validateTourData = (body) => {
  // Declare errors for use by the surrounding module or function.
  const errors = [];

  // Check the condition (!body.title?.trim()) and run the matching branch.
  if (!body.title?.trim()) {
    // Perform the side effect or state update expressed on the following line.
    errors.push("Title is required.");
  }

  // Check the condition (!body.description?.trim()) and run the matching branch.
  if (!body.description?.trim()) {
    // Perform the side effect or state update expressed on the following line.
    errors.push("Description is required.");
  }

  // Check the condition (!body.destination) and run the matching branch.
  if (!body.destination) {
    // Perform the side effect or state update expressed on the following line.
    errors.push("Destination is required.");
  }

  // Check the condition (!body.country?.trim()) and run the matching branch.
  if (!body.country?.trim()) {
    // Perform the side effect or state update expressed on the following line.
    errors.push("Country is required.");
  }

  // Check the condition (!body.location?.trim()) and run the matching branch.
  if (!body.location?.trim()) {
    // Perform the side effect or state update expressed on the following line.
    errors.push("Location is required.");
  }

  // Check the condition (!body.date) and run the matching branch.
  if (!body.date) {
    // Perform the side effect or state update expressed on the following line.
    errors.push("Tour date is required.");
  }

  // Check the condition (body.price === undefined || Number(body.price) < 0) and run the matching branch.
  if (body.price === undefined || Number(body.price) < 0) {
    // Perform the side effect or state update expressed on the following line.
    errors.push("Valid price is required.");
  }

  // Return the value of errors to the caller.
  return errors;
};const checkDuplicateSlug = async (slug, id = null) => {
  // Check the condition (!slug) and run the matching branch.
  if (!slug) return false;

  // Declare existing for use by the surrounding module or function.
  const existing = await Tour.findOne({
    slug: slug.trim().toLowerCase(),
  });

  // Check the condition (!existing) and run the matching branch.
  if (!existing) {
    // Return the expression shown below to the caller.
    return false;
  }

  // Check the condition (id && existing._id.toString() === id.toString()) and run the matching branch.
  if (id && existing._id.toString() === id.toString()) {
    // Return the expression shown below to the caller.
    return false;
  }

  // Return the expression shown below to the caller.
  return true;
};/*
|--------------------------------------------------------------------------
| CREATE TOUR
|--------------------------------------------------------------------------
*/

// Declare getAllTours for use by the surrounding module or function.
export const getAllTours = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    /*
    |--------------------------------------------------------------------------
    | Pagination
    |--------------------------------------------------------------------------
    */

    // Declare page for use by the surrounding module or function.
    const page = Math.max(Number(req.query.page) || 1, 1);

    // Declare limit for use by the surrounding module or function.
    const limit = Math.min(Number(req.query.limit) || 10, 10);

    // Declare skip for use by the surrounding module or function.
    const skip = (page - 1) * limit;

    /*
    |--------------------------------------------------------------------------
    | Filters
    |--------------------------------------------------------------------------
    */

    // Declare filter for use by the surrounding module or function.
    const filter = {
      isDeleted: false,
    };

    // Check the condition (req.query.status) and run the matching branch.
    if (req.query.status) {
      // Perform the side effect or state update expressed on the following line.
      filter.status = req.query.status;
    }

    // Check the condition (req.query.category) and run the matching branch.
    if (req.query.category) {
      // Perform the side effect or state update expressed on the following line.
      filter.category = req.query.category;
    }

    // Check the condition (req.query.featured === "true") and run the matching branch.
    if (req.query.featured === "true") {
      // Perform the side effect or state update expressed on the following line.
      filter.featured = true;
    }

    // Check the condition (req.query.destination) and run the matching branch.
    if (req.query.destination) {
      // Perform the side effect or state update expressed on the following line.
      filter.destination = req.query.destination;
    }

    // Check the condition (req.query.available === "true") and run the matching branch.
    if (req.query.available === "true") {
      // Perform the side effect or state update expressed on the following line.
      filter.available = true;
    }

    /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

    // Check the condition (req.query.search) and run the matching branch.
    if (req.query.search) {
      // Perform the side effect or state update expressed on the following line.
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

    // Declare [tours, total] for use by the surrounding module or function.
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

    // Perform the side effect or state update expressed on the following line.
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
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};/*
|--------------------------------------------------------------------------
| GET SINGLE TOUR
|--------------------------------------------------------------------------
*/

// Declare getTour for use by the surrounding module or function.
export const getTour = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    /*
    |--------------------------------------------------------------------------
    | Validate ID
    |--------------------------------------------------------------------------
    */

    // Check the condition (!isValidId(req.params.id)) and run the matching branch.
    if (!isValidId(req.params.id)) {
      // Return the result of res.status(400).json() to the caller.
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

    // Declare tour for use by the surrounding module or function.
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

    // Check the condition (!tour) and run the matching branch.
    if (!tour) {
      // Return the result of res.status(404).json() to the caller.
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

    // Perform the side effect or state update expressed on the following line.
    res.status(200).json({
      success: true,
      tour,
    });

  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};/*
|--------------------------------------------------------------------------
| UPDATE TOUR
|--------------------------------------------------------------------------
*/

// Declare restoreTour for use by the surrounding module or function.
export const restoreTour = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    /*
    |--------------------------------------------------------------------------
    | Validate ID
    |--------------------------------------------------------------------------
    */

    // Check the condition (!isValidId(req.params.id)) and run the matching branch.
    if (!isValidId(req.params.id)) {
      // Return the result of res.status(400).json() to the caller.
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

    // Declare tour for use by the surrounding module or function.
    const tour = await Tour.findOne({
      _id: req.params.id,
      isDeleted: true,
    });

    // Check the condition (!tour) and run the matching branch.
    if (!tour) {
      // Return the result of res.status(404).json() to the caller.
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

    // Perform the side effect or state update expressed on the following line.
    tour.isDeleted = false;

    // Check the condition ("deletedAt" in tour) and run the matching branch.
    if ("deletedAt" in tour) {
      // Perform the side effect or state update expressed on the following line.
      tour.deletedAt = null;
    }

    // Check the condition ("deletedBy" in tour) and run the matching branch.
    if ("deletedBy" in tour) {
      // Perform the side effect or state update expressed on the following line.
      tour.deletedBy = null;
    }

    // Perform the side effect or state update expressed on the following line.
    await tour.save();

    /*
    |--------------------------------------------------------------------------
    | Restore Vehicle Availability
    |--------------------------------------------------------------------------
    */

    // Check the condition (tour.assignedVehicle) and run the matching branch.
    if (tour.assignedVehicle) {
      // Declare vehicle for use by the surrounding module or function.
      const vehicle = await Vehicle.findById(
        tour.assignedVehicle
      );

      // Check the condition (vehicle) and run the matching branch.
      if (vehicle) {
        // Perform the side effect or state update expressed on the following line.
        vehicle.status = "available";
        // Perform the side effect or state update expressed on the following line.
        vehicle.assignedTour = null;
        // Perform the side effect or state update expressed on the following line.
        await vehicle.save();
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Populate
    |--------------------------------------------------------------------------
    */

    // Perform the side effect or state update expressed on the following line.
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

    // Perform the side effect or state update expressed on the following line.
    res.status(200).json({
      success: true,
      message: "Tour restored successfully.",
      tour,
    });

  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};
