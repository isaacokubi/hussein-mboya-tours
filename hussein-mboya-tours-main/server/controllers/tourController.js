// server/controllers/tourController.js

import mongoose from "mongoose";
import Tour from "../models/Tour.js";
import Vehicle from "../models/Vehicle.js";
import Booking from "../models/Booking.js";
import Staff from "../models/Staff.js";
import {
  validateAndLoadResources,
  applyTourResources,
  releaseTourResources,
} from "../services/tourResourceService.js";

const PUBLIC_STATUSES = ["scheduled", "upcoming", "ongoing"];

const publicTourFilter = {
  available: true,
  isDeleted: { $ne: true },
  published: true,
  status: { $in: PUBLIC_STATUSES },
};

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const parsePositiveNumber = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const parseNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const buildImages = (files = []) =>
  files.map((file) => ({
    url: file.path,
    publicId: file.filename || null,
  }));

const cleanString = (value) =>
  typeof value === "string" ? value.trim() : value;

const loadTour = (id) =>
  Tour.findOne({
    _id: id,
    isDeleted: { $ne: true },
  })
    .populate("destination")
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
    .populate("createdBy", "name email");

/*
|--------------------------------------------------------------------------
| PUBLIC TOURS
|--------------------------------------------------------------------------
*/

export const getTours = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(
      Math.max(Number(req.query.limit) || 12, 1),
      100
    );

    const filter = { ...publicTourFilter };

    if (req.query.destination) filter.destination = req.query.destination;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.featured === "true") filter.featured = true;

    if (req.query.search?.trim()) {
      const search = req.query.search.trim();
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [tours, total] = await Promise.all([
      Tour.find(filter)
        .populate("destination")
        .populate("assignedGuide", "name")
        .populate("assignedDriver", "name")
        .populate(
          "assignedVehicle",
          "name registrationNumber model type capacity status"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Tour.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      count: tours.length,
      data: tours,
      tours,
    });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedTours = async (req, res, next) => {
  try {
    const tours = await Tour.find({
      ...publicTourFilter,
      featured: true,
    })
      .populate("destination")
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    return res.status(200).json({
      success: true,
      data: tours,
      tours,
    });
  } catch (error) {
    next(error);
  }
};

export const searchTours = async (req, res, next) => {
  try {
    const filter = { ...publicTourFilter };
    const keyword = req.query.keyword?.trim();

    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { location: { $regex: keyword, $options: "i" } },
        { country: { $regex: keyword, $options: "i" } },
      ];
    }

    if (req.query.category) filter.category = req.query.category;
    if (req.query.country) filter.country = req.query.country;
    if (req.query.destination) filter.destination = req.query.destination;

    const tours = await Tour.find(filter)
      .populate("destination")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: tours.length,
      data: tours,
      tours,
    });
  } catch (error) {
    next(error);
  }
};

export const getTourById = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tour ID.",
      });
    }

    const tour = await Tour.findOne({
      _id: req.params.id,
      ...publicTourFilter,
    })
      .populate("destination")
      .populate("assignedGuide", "name email phone position")
      .populate("assignedDriver", "name email phone position")
      .populate(
        "assignedVehicle",
        "name registrationNumber model type capacity status"
      )
      .lean();

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: tour,
      tour,
    });
  } catch (error) {
    next(error);
  }
};

export const getTourBySlug = async (req, res, next) => {
  try {
    const tour = await Tour.findOne({
      slug: req.params.slug,
      ...publicTourFilter,
    })
      .populate("destination")
      .populate("assignedGuide", "name email phone position")
      .populate("assignedDriver", "name email phone position")
      .populate(
        "assignedVehicle",
        "name registrationNumber model type capacity status"
      )
      .lean();

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: tour,
      tour,
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

    const title = cleanString(body.title);
    const description = cleanString(body.description);
    const country = cleanString(body.country);
    const location = cleanString(body.location);

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

    const capacity = parsePositiveNumber(body.capacity, 20);
    const durationDays = parsePositiveNumber(body.duration, 1);
    const price = parseNumber(body.price);
    const discount = parseNumber(body.discount);

    if (discount < 0 || discount > 100) {
      return res.status(400).json({
        success: false,
        message: "Discount must be between 0 and 100.",
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

    const images = buildImages(req.files);

    const excluded = new Set([
      "assignedGuide",
      "guide",
      "assignedDriver",
      "driver",
      "assignedVehicle",
      "vehicle",
      "capacity",
      "duration",
      "price",
      "discount",
      "published",
      "status",
    ]);

    const extraFields = Object.fromEntries(
      Object.entries(body).filter(([key]) => !excluded.has(key))
    );

    const tour = await Tour.create({
      ...extraFields,
      title,
      description,
      destination: body.destination,
      country,
      location,
      date: body.date,
      price,
      capacity,
      duration: String(body.duration ?? durationDays),
      durationDetails: {
        days: durationDays,
        nights: Math.max(durationDays - 1, 0),
      },
      difficulty: body.difficulty || "easy",
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
      featuredImage:
        images[0] || body.featuredImage || { url: "", publicId: "" },
      gallery:
        images.length > 1
          ? images.slice(1)
          : Array.isArray(body.gallery)
            ? body.gallery
            : [],
      createdBy: req.user?._id || null,
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

    const createdTour = await loadTour(tour._id);

    return res.status(201).json({
      success: true,
      message: "Tour created successfully.",
      data: createdTour,
      tour: createdTour,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| MANAGER TOURS
|--------------------------------------------------------------------------
*/

export const getManagerTours = async (req, res, next) => {
  try {
    const filter = {
      isDeleted: { $ne: true },
      createdBy: req.user._id,
    };

    const tours = await Tour.find(filter)
      .populate("destination")
      .populate("assignedGuide", "name email phone position availability")
      .populate("assignedDriver", "name email phone position availability")
      .populate(
        "assignedVehicle",
        "name registrationNumber model type capacity status"
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: tours.length,
      data: tours,
      tours,
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
      if (body[field] !== undefined) {
        tour[field] = body[field];
      }
    }

    if (body.slug !== undefined) {
      const duplicate = await Tour.findOne({
        slug: String(body.slug).trim().toLowerCase(),
        _id: { $ne: tour._id },
        isDeleted: { $ne: true },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Another tour already uses this slug.",
        });
      }

      tour.slug = String(body.slug).trim().toLowerCase();
    }

    if (tour.title) tour.title = cleanString(tour.title);
    if (tour.description) tour.description = cleanString(tour.description);
    if (tour.country) tour.country = cleanString(tour.country);
    if (tour.location) tour.location = cleanString(tour.location);

    if (body.capacity !== undefined) {
      const capacity = Number(body.capacity);
      if (!Number.isFinite(capacity) || capacity < 1) {
        return res.status(400).json({
          success: false,
          message: "Capacity must be at least 1.",
        });
      }
      tour.capacity = capacity;
      tour.availabilitySettings.totalSlots = capacity;
    }

    if (body.price !== undefined) {
      const price = Number(body.price);
      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message: "Price must be a valid non-negative number.",
        });
      }
      tour.price = price;
    }

    if (body.discount !== undefined) {
      const discount = Number(body.discount);
      if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
        return res.status(400).json({
          success: false,
          message: "Discount must be between 0 and 100.",
        });
      }
      tour.discount = discount;
    }

    if (req.files?.length) {
      const images = buildImages(req.files);
      tour.featuredImage = images[0] || tour.featuredImage;
      tour.gallery = images.slice(1);
    }

    const hasGuideChange = Object.prototype.hasOwnProperty.call(
      body,
      "assignedGuide"
    ) || Object.prototype.hasOwnProperty.call(body, "guide");

    const hasDriverChange = Object.prototype.hasOwnProperty.call(
      body,
      "assignedDriver"
    ) || Object.prototype.hasOwnProperty.call(body, "driver");

    const hasVehicleChange = Object.prototype.hasOwnProperty.call(
      body,
      "assignedVehicle"
    ) || Object.prototype.hasOwnProperty.call(body, "vehicle");

    const resourceChange =
      hasGuideChange || hasDriverChange || hasVehicleChange;

    if (resourceChange) {
      const guideId = hasGuideChange
        ? body.assignedGuide ?? body.guide ?? null
        : tour.assignedGuide;

      const driverId = hasDriverChange
        ? body.assignedDriver ?? body.driver ?? null
        : tour.assignedDriver;

      const vehicleId = hasVehicleChange
        ? body.assignedVehicle ?? body.vehicle ?? null
        : tour.assignedVehicle;

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

      try {
        await applyTourResources(tour, {
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
    } else {
      await tour.save();
    }

    const updatedTour = await loadTour(tour._id);

    return res.status(200).json({
      success: true,
      message: "Tour updated successfully.",
      data: updatedTour,
      tour: updatedTour,
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
    tour.deletedBy = req.user?._id || null;
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
| VEHICLE COMPATIBILITY ROUTES
|--------------------------------------------------------------------------
*/

export const assignVehicle = async (req, res, next) => {
  const vehicleId = req.body?.vehicleId;

  if (!vehicleId) {
    return res.status(400).json({
      success: false,
      message: "Vehicle ID is required.",
    });
  }

  req.body = { vehicleId };
  const { assignTourResources } = await import(
    "./tourAssignmentController.js"
  );
  return assignTourResources(req, res, next);
};

export const removeVehicle = async (req, res, next) => {
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

    const { assignedVehicle } = tour;
    if (assignedVehicle) {
      await releaseTourResources({
        _id: tour._id,
        assignedVehicle,
        assignedGuide: null,
        assignedDriver: null,
      });
    }

    tour.assignedVehicle = null;
    tour.assignmentStatus =
      tour.assignedGuide || tour.assignedDriver
        ? "assigned"
        : "pending";

    await tour.save();

    const updatedTour = await loadTour(tour._id);

    return res.status(200).json({
      success: true,
      message: "Vehicle removed successfully.",
      data: updatedTour,
      tour: updatedTour,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| REPORTS
|--------------------------------------------------------------------------
*/

export const getReports = async (req, res, next) => {
  try {
    const tours = await Tour.find({
      createdBy: req.user._id,
      isDeleted: { $ne: true },
    }).lean();

    const ids = tours.map((tour) => tour._id);

    const [totalBookings, revenue] = await Promise.all([
      Booking.countDocuments({
        tour: { $in: ids },
        isDeleted: { $ne: true },
      }),
      Booking.aggregate([
        {
          $match: {
            tour: { $in: ids },
            isDeleted: { $ne: true },
            paymentStatus: { $in: ["paid", "completed"] },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: { $ifNull: ["$totalAmount", 0] },
            },
          },
        },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalTours: tours.length,
        totalBookings,
        totalRevenue: revenue[0]?.totalRevenue || 0,
        tours,
      },
    });
  } catch (error) {
    next(error);
  }
};
