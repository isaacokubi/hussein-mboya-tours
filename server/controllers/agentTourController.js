import mongoose from "mongoose";
import slugify from "slugify";

import Tour from "../models/Tour.js";

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const isValidId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

const buildImages = (files = []) =>
  files.map((file) => ({
    url: file.path,
    publicId: file.filename || "",
  }));

const cleanString = (value = "") =>
  value.trim().replace(/\s+/g, " ");

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
| CREATE AGENT TOUR
|--------------------------------------------------------------------------
*/

export const createAgentTour = async (req, res, next) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | Validate User
    |--------------------------------------------------------------------------
    */

    if (!req.user || !isValidId(req.user._id)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate Required Fields
    |--------------------------------------------------------------------------
    */

    if (!req.body.title) {
      return res.status(400).json({
        success: false,
        message: "Tour title is required.",
      });
    }

    if (!req.body.destination) {
      return res.status(400).json({
        success: false,
        message: "Destination is required.",
      });
    }

    if (!req.body.price) {
      return res.status(400).json({
        success: false,
        message: "Price is required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Generate Slug
    |--------------------------------------------------------------------------
    */

    const title = cleanString(req.body.title);

    const slug = slugify(title, {
      lower: true,
      strict: true,
    });

    /*
    |--------------------------------------------------------------------------
    | Prevent Duplicate Slug
    |--------------------------------------------------------------------------
    */

    const exists = await Tour.exists({
      slug,
      isDeleted: false,
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "A tour with this title already exists.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Whitelist Fields
    |--------------------------------------------------------------------------
    */

    const tourData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        tourData[field] = req.body[field];
      }
    }

    tourData.title = title;
    tourData.slug = slug;

    /*
    |--------------------------------------------------------------------------
    | Images
    |--------------------------------------------------------------------------
    */

    if (req.files?.length) {
      tourData.images = buildImages(req.files);
    } else {
      tourData.images = [];
    }

    /*
    |--------------------------------------------------------------------------
    | System Fields
    |--------------------------------------------------------------------------
    */

    tourData.createdBy = req.user._id;
    tourData.agentCreated = true;
    tourData.isDeleted = false;

    /*
    |--------------------------------------------------------------------------
    | Create Tour
    |--------------------------------------------------------------------------
    */

    const tour = await Tour.create(tourData);

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
};