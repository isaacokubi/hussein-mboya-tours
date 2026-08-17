// server/controllers/itineraryController.js

import Itinerary from "../models/Itinerary.js";
import Tour from "../models/Tour.js";

// ============================================================
// CREATE ITINERARY
// ============================================================

export const createItinerary = async (req, res, next) => {
  try {
    const { tour } = req.body;

    const existingTour = await Tour.findById(tour);

    if (!existingTour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    const itinerary = await Itinerary.create({
      ...req.body,
      createdBy: req.user._id,
    });

    const populated = await Itinerary.findById(itinerary._id)
      .populate("tour", "title destination")
      .populate("createdBy", "name email");

    return res.status(201).json({
      success: true,
      message: "Itinerary created successfully",
      itinerary: populated,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET ALL ITINERARIES
// ============================================================

export const getItineraries = async (req, res, next) => {
  try {
    const itineraries = await Itinerary.find()
      .populate("tour", "title destination")
      .populate("createdBy", "name email")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: itineraries.length,
      itineraries,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET SINGLE ITINERARY
// ============================================================

export const getItinerary = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id)
      .populate("tour", "title destination")
      .populate("createdBy", "name email");

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: "Itinerary not found",
      });
    }

    return res.status(200).json({
      success: true,
      itinerary,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE ITINERARY
// ============================================================

export const updateItinerary = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("tour", "title destination")
      .populate("createdBy", "name email");

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: "Itinerary not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Itinerary updated successfully",
      itinerary,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DELETE ITINERARY
// ============================================================

export const deleteItinerary = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findByIdAndDelete(req.params.id);

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: "Itinerary not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Itinerary deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};