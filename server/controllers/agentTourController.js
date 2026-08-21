import { mergeTenantFilter } from "../tenancy/context.js";
import mongoose from "mongoose";
import slugify from "slugify";

import Tour from "../models/Tour.js";
import Agent from "../models/Agent.js";

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const isValidId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

const cleanString = (value = "") =>
  String(value)
    .trim()
    .replace(/\s+/g, " ");

const buildImages = (files = []) =>
  files.map((file) => ({
    url: file.path,
    publicId: file.filename || "",
  }));

const allowedFields = [
  "title",
  "description",
  "shortDescription",
  "destination",
  "country",
  "location",
  "category",
  "duration",
  "difficulty",
  "capacity",
  "maxGuests",
  "price",
  "agentPrice",
  "discount",
  "startDate",
  "endDate",
  "tourStatus",
  "status",
  "featured",
  "available",
  "included",
  "excluded",
  "itinerary",
  "highlights",
];

/*
|--------------------------------------------------------------------------
| AGENT PROFILE
|--------------------------------------------------------------------------
*/

const getAgentProfile = async (userId) => {
  return Agent.findOne({
    user: userId,
  });
};

/*
|--------------------------------------------------------------------------
| CREATE AGENT TOUR
|--------------------------------------------------------------------------
*/

export const createAgentTour = async (
  req,
  res,
  next
) => {
  try {
    if (
      !req.user ||
      !isValidId(req.user._id)
    ) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const agentProfile =
      await getAgentProfile(
        req.user._id
      );

    if (!agentProfile) {
      return res.status(404).json({
        success: false,
        message: "Agent profile not found.",
      });
    }

    if (
      !agentProfile.isApproved ||
      agentProfile.status !== "active"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Agent account is not approved or active.",
      });
    }

    if (!req.body.title) {
      return res.status(400).json({
        success: false,
        message:
          "Tour title is required.",
      });
    }

    if (!req.body.destination) {
      return res.status(400).json({
        success: false,
        message:
          "Destination is required.",
      });
    }

    if (
      req.body.price === undefined &&
      req.body.agentPrice === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Tour price is required.",
      });
    }

    const title =
      cleanString(req.body.title);

    const slug =
      slugify(title, {
        lower: true,
        strict: true,
      });

    const exists =
      await Tour.exists({
        slug,
        isDeleted: false,
      });

    if (exists) {
      return res.status(409).json({
        success: false,
        message:
          "A tour with this title already exists.",
      });
    }

    const tourData = {};

    for (
      const field of allowedFields
    ) {
      if (
        req.body[field] !== undefined
      ) {
        tourData[field] =
          req.body[field];
      }
    }

    tourData.title = title;
    tourData.slug = slug;

    if (
      tourData.price === undefined &&
      tourData.agentPrice !== undefined
    ) {
      tourData.price =
        Number(tourData.agentPrice);
    }

    if (
      tourData.agentPrice === undefined &&
      tourData.price !== undefined
    ) {
      tourData.agentPrice =
        Number(tourData.price);
    }

    if (
      req.files &&
      req.files.length
    ) {
      tourData.images =
        buildImages(req.files);
    }

    tourData.createdBy =
      req.user._id;

    tourData.agentCreated =
      true;

    tourData.isDeleted =
      false;

    if (!tourData.status) {
      tourData.status =
        "draft";
    }

    const tour =
      await Tour.create(
        tourData
      );

    return res.status(201).json({
      success: true,
      message:
        "Tour created successfully.",
      tour,
    });

  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET AGENT TOURS
|--------------------------------------------------------------------------
*/

export const getAgentTours = async (
  req,
  res,
  next
) => {
  try {
    if (
      !req.user ||
      !isValidId(req.user._id)
    ) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const filter = {
      createdBy: req.user._id,
      isDeleted: false,
    };

    if (req.query.status) {
      filter.status =
        req.query.status;
    }

    const tours =
      await Tour.find(filter)
        .sort({
          createdAt: -1,
        })
        .lean();

    return res.status(200).json({
      success: true,
      count: tours.length,
      tours,
    });

  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE AGENT TOUR
|--------------------------------------------------------------------------
*/

export const getAgentTour = async (
  req,
  res,
  next
) => {
  try {
    if (
      !isValidId(req.params.id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid tour ID.",
      });
    }

    const tour =
      await Tour.findOne({
        _id: req.params.id,
        createdBy: req.user._id,
        isDeleted: false,
      });

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found.",
      });
    }

    return res.status(200).json({
      success: true,
      tour,
    });

  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE AGENT TOUR
|--------------------------------------------------------------------------
*/

export const updateAgentTour = async (
  req,
  res,
  next
) => {
  try {
    if (
      !isValidId(req.params.id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid tour ID.",
      });
    }

    const tour =
      await Tour.findOne({
        _id: req.params.id,
        createdBy: req.user._id,
        isDeleted: false,
      });

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found.",
      });
    }

    for (
      const field of allowedFields
    ) {
      if (
        req.body[field] !== undefined
      ) {
        tour[field] =
          req.body[field];
      }
    }

    if (req.body.title) {
      tour.title =
        cleanString(
          req.body.title
        );
    }

    if (
      req.body.title &&
      tour.isModified("title")
    ) {
      let baseSlug =
        slugify(
          tour.title,
          {
            lower: true,
            strict: true,
          }
        );

      let slug =
        baseSlug;

      let counter = 1;

      while (
        await Tour.exists({
          _id: {
            $ne: tour._id,
          },
          slug,
          isDeleted: false,
        })
      ) {
        counter += 1;

        slug =
          `${baseSlug}-${counter}`;
      }

      tour.slug =
        slug;
    }

    if (
      req.body.price !== undefined
    ) {
      tour.price =
        Number(req.body.price);
    }

    if (
      req.body.agentPrice !== undefined
    ) {
      tour.agentPrice =
        Number(
          req.body.agentPrice
        );
    }

    if (
      req.files &&
      req.files.length
    ) {
      tour.images =
        buildImages(req.files);
    }

    tour.updatedBy =
      req.user._id;

    await tour.save();

    return res.status(200).json({
      success: true,
      message:
        "Tour updated successfully.",
      tour,
    });

  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| DELETE AGENT TOUR
|--------------------------------------------------------------------------
*/

export const deleteAgentTour = async (
  req,
  res,
  next
) => {
  try {
    if (
      !isValidId(req.params.id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid tour ID.",
      });
    }

    const tour =
      await Tour.findOne({
        _id: req.params.id,
        createdBy: req.user._id,
        isDeleted: false,
      });

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found.",
      });
    }

    tour.isDeleted =
      true;

    tour.deletedAt =
      new Date();

    if (
      "updatedBy" in tour
    ) {
      tour.updatedBy =
        req.user._id;
    }

    await tour.save();

    return res.status(200).json({
      success: true,
      message:
        "Tour deleted successfully.",
    });

  } catch (error) {
    next(error);
  }
};

export default {
  createAgentTour,
  getAgentTours,
  getAgentTour,
  updateAgentTour,
  deleteAgentTour,
};
