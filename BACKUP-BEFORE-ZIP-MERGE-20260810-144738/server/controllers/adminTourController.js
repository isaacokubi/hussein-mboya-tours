import mongoose from "mongoose";
import Tour from "../models/Tour.js";
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
import Staff from "../models/Staff.js";


/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

const TOUR_STATUSES = [
  "draft",
  "upcoming",
  "active",
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

export const createTour = async (req, res, next) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | Validate Required Fields
    |--------------------------------------------------------------------------
    */

    const errors = validateTourData(req.body);

    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: errors.join(" "),
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Prevent Duplicate Slug
    |--------------------------------------------------------------------------
    */

    if (req.body.slug) {
      const exists = await checkDuplicateSlug(req.body.slug);

      if (exists) {
        return res.status(409).json({
          success: false,
          message: "A tour with this slug already exists.",
        });
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Process Images
    |--------------------------------------------------------------------------
    */

    const images = buildImages(req.files);

    /*
    |--------------------------------------------------------------------------
    | Build Tour Payload
    |--------------------------------------------------------------------------
    */

    const payload = {
      title: cleanString(req.body.title),
      name: cleanString(req.body.name),

      slug: req.body.slug
        ? cleanString(req.body.slug).toLowerCase()
        : undefined,

      description: cleanString(req.body.description),

      shortDescription: cleanString(req.body.shortDescription),

      category: req.body.category,

      destination: req.body.destination,

      country: cleanString(req.body.country),

      location: cleanString(req.body.location),

      date: req.body.date,

      startDate: req.body.startDate || null,

      endDate: req.body.endDate || null,

      duration: req.body.duration,

      difficulty: req.body.difficulty,

      capacity: Number(req.body.capacity || 20),

      maxGuests: Number(req.body.maxGuests || 20),

      maxTravelers: Number(req.body.maxTravelers || 20),

      price: Number(req.body.price),

      agentPrice: Number(req.body.agentPrice || 0),

      discount: Number(req.body.discount || 0),

      discountPrice: req.body.discountPrice
        ? Number(req.body.discountPrice)
        : null,

      highlights: req.body.highlights || [],

      included: req.body.included || [],

      excluded: req.body.excluded || [],

      inclusions: req.body.inclusions || [],

      exclusions: req.body.exclusions || [],

      itinerary: req.body.itinerary || [],

      availableDates: req.body.availableDates || [],

      availability: req.body.availability || [],

      pricingRules: req.body.pricingRules || [],

      cancellationPolicy: req.body.cancellationPolicy,

      depositRequired: Number(req.body.depositRequired || 0),

      featured: req.body.featured || false,

      available:
        req.body.available === undefined
          ? true
          : req.body.available,

      status:
        TOUR_STATUSES.includes(req.body.status)
          ? req.body.status
          : "draft",

      images,

      createdBy: req.user._id,
    };

    /*
    |--------------------------------------------------------------------------
    | Create Tour
    |--------------------------------------------------------------------------
    */

    const tour = await Tour.create(payload);

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    res.status(201).json({
      success: true,
      message: "Tour created successfully.",
      tour,
    });

  } catch (error) {
    next(error);
  }
};/*
|--------------------------------------------------------------------------
| GET ALL TOURS (ADMIN)
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

    const limit = Math.min(Number(req.query.limit) || 20, 100);

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

export const updateTour = async (req, res, next) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | Validate Tour ID
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
    | Find Tour
    |--------------------------------------------------------------------------
    */

    const tour = await Tour.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Duplicate Slug Check
    |--------------------------------------------------------------------------
    */

    if (req.body.slug) {
      const exists = await checkDuplicateSlug(
        req.body.slug,
        tour._id
      );

      if (exists) {
        return res.status(409).json({
          success: false,
          message: "Another tour already uses this slug.",
        });
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Update Allowed Fields Only
    |--------------------------------------------------------------------------
    */

    const allowedFields = [
      "name",
      "title",
      "slug",
      "description",
      "shortDescription",
      "category",
      "destination",
      "country",
      "location",
      "date",
      "startDate",
      "endDate",
      "tourStatus",
      "duration",
      "difficulty",
      "capacity",
      "maxGuests",
      "maxTravelers",
      "price",
      "agentPrice",
      "discount",
      "discountPrice",
      "highlights",
      "included",
      "excluded",
      "inclusions",
      "exclusions",
      "itinerary",
      "availableDates",
      "availability",
      "pricingRules",
      "cancellationPolicy",
      "depositRequired",
      "featured",
      "available",
      "status",
      "seo",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        tour[field] = req.body[field];
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Normalize Fields
    |--------------------------------------------------------------------------
    */

    if (tour.title) {
      tour.title = cleanString(tour.title);
    }

    if (tour.slug) {
      tour.slug = cleanString(tour.slug).toLowerCase();
    }

    if (tour.country) {
      tour.country = cleanString(tour.country);
    }

    if (tour.location) {
      tour.location = cleanString(tour.location);
    }

    /*
    |--------------------------------------------------------------------------
    | Replace Images
    |--------------------------------------------------------------------------
    |
    | If using Cloudinary, delete the previous images here
    | before assigning the new ones.
    |--------------------------------------------------------------------------
    */

    if (req.files?.length) {
      tour.images = buildImages(req.files);
    }

    /*
    |--------------------------------------------------------------------------
    | Save
    |--------------------------------------------------------------------------
    */

    await tour.save();

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    res.status(200).json({
      success: true,
      message: "Tour updated successfully.",
      tour,
    });

  } catch (error) {
    next(error);
  }
};/*
|--------------------------------------------------------------------------
| SOFT DELETE TOUR
|--------------------------------------------------------------------------
*/

export const deleteTour = async (req, res, next) => {
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
    | Find Tour
    |--------------------------------------------------------------------------
    */

    const tour = await Tour.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Soft Delete
    |--------------------------------------------------------------------------
    */

    tour.isDeleted = true;

    tour.deletedAt = new Date();

    if (req.user?._id) {
      tour.deletedBy = req.user._id;
    }
/*
|--------------------------------------------------------------------------
| Release Assigned Vehicle
|--------------------------------------------------------------------------
*/

if (tour.assignedVehicle) {

    const vehicle = await Vehicle.findById(
        tour.assignedVehicle
    );

    if (vehicle) {

        vehicle.status = "Available";

        await vehicle.save();

    }

}

/*
|--------------------------------------------------------------------------
| Release Assigned Driver
|--------------------------------------------------------------------------
*/

if (tour.assignedDriver) {

    const driver = await Staff.findById(
        tour.assignedDriver
    );

    if (driver) {

        driver.assignedTours =
            driver.assignedTours.filter(

                (id) => id.toString() !== tour._id.toString()

            );

        driver.availability = "available";

        await driver.save();

    }

}
    await tour.save();

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    res.status(200).json({
      success: true,
      message: "Tour deleted successfully.",
    });

  } catch (error) {
    next(error);
  }
};/*
|--------------------------------------------------------------------------
| ASSIGN GUIDE
|--------------------------------------------------------------------------
*/

export const assignGuide = async (req, res, next) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | Validate IDs
    |--------------------------------------------------------------------------
    */

    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tour ID.",
      });
    }

    const { guideId } = req.body;

    if (!guideId) {
      return res.status(400).json({
        success: false,
        message: "Guide ID is required.",
      });
    }

    if (!isValidId(guideId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid guide ID.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Find Tour
    |--------------------------------------------------------------------------
    */

    const tour = await Tour.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Find Guide
    |--------------------------------------------------------------------------
    */

    const guide = await User.findById(guideId);

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: "Guide not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Verify Role
    |--------------------------------------------------------------------------
    */

    if (guide.role !== "guide") {
      return res.status(400).json({
        success: false,
        message: "Selected user is not a guide.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Assign Guide
    |--------------------------------------------------------------------------
    */

    tour.assignedGuide = guide._id;

    await tour.save();

    /*
    |--------------------------------------------------------------------------
    | Return Updated Tour
    |--------------------------------------------------------------------------
    */

    await tour.populate("assignedGuide", "name email phone");

    res.status(200).json({
      success: true,
      message: "Guide assigned successfully.",
      tour,
    });

  } catch (error) {
    next(error);
  }
};/*
|--------------------------------------------------------------------------
| ASSIGN DRIVER
|--------------------------------------------------------------------------
*/


export const assignDriver = async (req, res, next) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | Validate IDs
    |--------------------------------------------------------------------------
    */

    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tour ID.",
      });
    }

    const { driverId } = req.body;

    if (!driverId) {
      return res.status(400).json({
        success: false,
        message: "Driver ID is required.",
      });
    }

    if (!isValidId(driverId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid driver ID.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Find Tour
    |--------------------------------------------------------------------------
    */

    const tour = await Tour.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Find Driver
    |--------------------------------------------------------------------------
    */

    const driver = await Staff.findById(driverId);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Driver Validation
    |--------------------------------------------------------------------------
    */

    if (driver.position !== "driver") {
      return res.status(400).json({
        success: false,
        message: "Selected staff member is not a driver.",
      });
    }

    if (!driver.isActive) {
      return res.status(400).json({
        success: false,
        message: "Driver account is inactive.",
      });
    }

    if (driver.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Driver is not active.",
      });
    }

    if (driver.availability !== "available") {
      return res.status(400).json({
        success: false,
        message: "Driver is currently unavailable.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Assign Driver
    |--------------------------------------------------------------------------
    */

    tour.assignedDriver = driver._id;

    await tour.save();

    /*
    |--------------------------------------------------------------------------
    | Update Driver Assignment
    |--------------------------------------------------------------------------
    */

    if (!driver.assignedTours.includes(tour._id)) {
      driver.assignedTours.push(tour._id);
      await driver.save();
    }

    /*
    |--------------------------------------------------------------------------
    | Return Updated Tour
    |--------------------------------------------------------------------------
    */

    await tour.populate(
      "assignedDriver",
      "name phone email licenseNumber experience"
    );

    res.status(200).json({
      success: true,
      message: "Driver assigned successfully.",
      tour,
    });

  } catch (error) {
    next(error);
  }
};/*
|--------------------------------------------------------------------------
| ASSIGN VEHICLE
|--------------------------------------------------------------------------
*/

export const assignVehicle = async (req, res, next) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | Validate IDs
    |--------------------------------------------------------------------------
    */

    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tour ID.",
      });
    }

    const { vehicleId } = req.body;

    if (!vehicleId) {
      return res.status(400).json({
        success: false,
        message: "Vehicle ID is required.",
      });
    }

    if (!isValidId(vehicleId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle ID.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Find Tour
    |--------------------------------------------------------------------------
    */

    const tour = await Tour.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Find Vehicle
    |--------------------------------------------------------------------------
    */

    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate Vehicle
    |--------------------------------------------------------------------------
    */

    if (!vehicle.isActive) {
      return res.status(400).json({
        success: false,
        message: "Vehicle is inactive.",
      });
    }

    if (vehicle.status !== "Available") {
      return res.status(400).json({
        success: false,
        message: "Vehicle is not available.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Prevent Double Assignment
    |--------------------------------------------------------------------------
    */

    const existingAssignment = await Tour.findOne({
      assignedVehicle: vehicle._id,
      isDeleted: false,
      _id: { $ne: tour._id },
    });

    if (existingAssignment) {
      return res.status(409).json({
        success: false,
        message: "Vehicle is already assigned to another tour.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Assign Vehicle
    |--------------------------------------------------------------------------
    */

    tour.assignedVehicle = vehicle._id;

    await tour.save();

    /*
    |--------------------------------------------------------------------------
    | Update Vehicle Status
    |--------------------------------------------------------------------------
    */

    vehicle.status = "Assigned";

    await vehicle.save();

    /*
    |--------------------------------------------------------------------------
    | Populate Response
    |--------------------------------------------------------------------------
    */

    await tour.populate(
      "assignedVehicle",
      "name registrationNumber model type capacity status"
    );

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    res.status(200).json({
      success: true,
      message: "Vehicle assigned successfully.",
      tour,
    });

  } catch (error) {
    next(error);
  }
};/*
|--------------------------------------------------------------------------
| RESTORE DELETED TOUR
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
        vehicle.status = "Available";
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