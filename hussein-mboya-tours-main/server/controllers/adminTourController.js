// server/controllers/adminTourController.js

import mongoose from "mongoose";
import Tour from "../models/Tour.js";
import {
  validateAndLoadResources,
  applyTourResources,
  releaseTourResources,
} from "../services/tourResourceService.js";
import { assignTourResources } from "./tourAssignmentController.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const TOUR_STATUSES = [
  "draft",
  "scheduled",
  "upcoming",
  "ongoing",
  "fully-booked",
  "completed",
  "cancelled",
];

const cleanString = (value) =>
  typeof value === "string" ? value.trim() : value;

const buildImages = (files = []) =>
  files.map((file) => ({
    url: file.path,
    publicId: file.filename || null,
  }));

const loadTour = (id) =>
  Tour.findOne({
    _id: id,
    isDeleted: { $ne: true },
  })
    .populate("destination", "name slug")
    .populate(
      "createdBy",
      "name email"
    )
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
      status: TOUR_STATUSES.includes(body.status)
        ? body.status
        : "draft",
      published: body.published ?? false,
      available: body.available ?? true,
      discount,
      assignedGuide: null,
      assignedDriver: null,
      assignedVehicle: null,
      assignmentStatus: "pending",
      featuredImage:
        images[0] || body.featuredImage || { url: "", publicId: "" },
      gallery:
        images.length > 1
          ? images.slice(1)
          : Array.isArray(body.gallery)
            ? body.gallery
            : [],
      availabilitySettings: {
        totalSlots: capacity,
        bookedSlots: 0,
        waitlistEnabled: false,
      },
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
| GET ALL TOURS
|--------------------------------------------------------------------------
*/

export const getAllTours = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      100
    );
    const skip = (page - 1) * limit;

    const filter = {
      isDeleted: false,
    };

    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.destination) filter.destination = req.query.destination;
    if (req.query.featured === "true") filter.featured = true;
    if (req.query.available === "true") filter.available = true;

    if (req.query.search?.trim()) {
      const search = req.query.search.trim();
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    const [tours, total] = await Promise.all([
      Tour.find(filter)
        .populate("destination", "name slug")
        .populate("assignedGuide", "name email phone position availability")
        .populate("assignedDriver", "name email phone position availability")
        .populate(
          "assignedVehicle",
          "name registrationNumber model type capacity status"
        )
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Tour.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      count: tours.length,
      tours,
      data: tours,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE TOUR
|--------------------------------------------------------------------------
*/

export const getTour = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tour ID.",
      });
    }

    const tour = await loadTour(req.params.id);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found.",
      });
    }

    return res.status(200).json({
      success: true,
      tour,
      data: tour,
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
    }

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
      "available",
      "published",
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

    if (tour.title) tour.title = cleanString(tour.title);
    if (tour.description) tour.description = cleanString(tour.description);
    if (tour.country) tour.country = cleanString(tour.country);
    if (tour.location) tour.location = cleanString(tour.location);
    if (tour.slug) tour.slug = cleanString(tour.slug).toLowerCase();

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
      tour: updated,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| SOFT DELETE
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
      isDeleted: false,
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
| RESTORE
|--------------------------------------------------------------------------
*/

export const restoreTour = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tour ID.",
      });
    }

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

    tour.isDeleted = false;
    tour.deletedAt = null;
    tour.deletedBy = null;

    if (tour.status === "cancelled") {
      tour.status = "draft";
    }

    tour.available = true;

    // Deleted tours have their resources cleared by deleteTour.
    // Do not mark unrelated resources busy during restore.
    tour.assignmentStatus =
      tour.assignedGuide ||
      tour.assignedDriver ||
      tour.assignedVehicle
        ? "assigned"
        : "pending";

    await tour.save();

    const restored = await loadTour(tour._id);

    return res.status(200).json({
      success: true,
      message: "Tour restored successfully.",
      tour: restored,
      data: restored,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| ASSIGNMENT COMPATIBILITY ROUTES
|--------------------------------------------------------------------------
*/

export const assignGuide = async (req, res, next) => {
  const { guideId } = req.body || {};

  if (!guideId) {
    return res.status(400).json({
      success: false,
      message: "Guide ID is required.",
    });
  }

  req.body = { guideId };
  return assignTourResources(req, res, next);
};

export const assignDriver = async (req, res, next) => {
  const { driverId } = req.body || {};

  if (!driverId) {
    return res.status(400).json({
      success: false,
      message: "Driver ID is required.",
    });
  }

  req.body = { driverId };
  return assignTourResources(req, res, next);
};

export const assignVehicle = async (req, res, next) => {
  const { vehicleId } = req.body || {};

  if (!vehicleId) {
    return res.status(400).json({
      success: false,
      message: "Vehicle ID is required.",
    });
  }

  req.body = { vehicleId };
  return assignTourResources(req, res, next);
};
