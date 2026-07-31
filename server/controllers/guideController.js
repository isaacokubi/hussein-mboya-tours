// server/controllers/guideController.js

import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";
import TourReport from "../models/TourReport.js";
import Staff from "../models/Staff.js";

const TOUR_STATUSES = [
  "scheduled",
  "ongoing",
  "completed",
  "cancelled",
];

// ============================================================
// GUIDE DASHBOARD
// ============================================================

export const guideDashboard = async (req, res, next) => {
  try {
    const guide = await Staff.findOne({
      email: req.user.email,
      position: "guide",
      isActive: true,
    });

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: "Guide profile not found",
      });
    }

    const tours = await Tour.find({
      assignedGuide: guide._id,
      isDeleted: false,
    })
      .populate("destination")
      .populate("assignedVehicle")
      .populate("assignedDriver")
      .sort({
        startDate: 1,
      });

    res.status(200).json({
      success: true,
      count: tours.length,
      tours,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET ASSIGNED TOURS
// ============================================================

export const getAssignedTours = async (req, res, next) => {
  try {
    const guide = await Staff.findOne({
      email: req.user.email,
      position: "guide",
      isActive: true,
    });

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: "Guide profile not found",
      });
    }

    const tours = await Tour.find({
      assignedGuide: guide._id,
      isDeleted: false,
    })
      .populate("destination")
      .populate("assignedVehicle")
      .populate("assignedDriver")
      .sort({
        startDate: 1,
      });

    res.status(200).json({
      success: true,
      count: tours.length,
      tours,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET TOUR DETAILS
// ============================================================

export const getTourDetails = async (req, res, next) => {
  try {
    const guide = await Staff.findOne({
      email: req.user.email,
      position: "guide",
      isActive: true,
    });

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: "Guide profile not found",
      });
    }

    const tour = await Tour.findOne({
      _id: req.params.id,
      assignedGuide: guide._id,
      isDeleted: false,
    })
      .populate("destination")
      .populate("assignedVehicle")
      .populate("assignedDriver");

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    res.status(200).json({
      success: true,
      tour,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET TOUR GUESTS
// ============================================================

export const getTourGuests = async (req, res, next) => {
  try {
    const guide = await Staff.findOne({
      email: req.user.email,
      position: "guide",
      isActive: true,
    });

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: "Guide profile not found",
      });
    }

    const assignedTour = await Tour.findOne({
      _id: req.params.id,
      assignedGuide: guide._id,
    });

    if (!assignedTour) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this tour",
      });
    }

    const bookings = await Booking.find({
      tour: assignedTour._id,
      bookingStatus: {
        $in: ["confirmed", "assigned", "completed"],
      },
    })
      .populate("customer", "name email phone")
      .populate("user", "name email phone");

    res.status(200).json({
      success: true,
      count: bookings.length,
      guests: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE TOUR STATUS
// ============================================================

export const updateTourStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!TOUR_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tour status",
      });
    }

    const guide = await Staff.findOne({
      email: req.user.email,
      position: "guide",
      isActive: true,
    });

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: "Guide profile not found",
      });
    }

    const tour = await Tour.findOneAndUpdate(
      {
        _id: req.params.id,
        assignedGuide: guide._id,
      },
      {
        tourStatus: status,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found or not assigned to you",
      });
    }

    res.status(200).json({
      success: true,
      message: "Tour status updated successfully",
      tour,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// SUBMIT TOUR REPORT
// ============================================================

export const submitTourReport = async (req, res, next) => {
  try {
    const guide = await Staff.findOne({
      email: req.user.email,
      position: "guide",
      isActive: true,
    });

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: "Guide profile not found",
      });
    }

    const assignedTour = await Tour.findOne({
      _id: req.params.id,
      assignedGuide: guide._id,
    });

    if (!assignedTour) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this tour",
      });
    }

    const report = await TourReport.create({
      tour: assignedTour._id,
      guide: guide._id,
      summary: req.body.summary,
      issues: req.body.issues || [],
      photos: req.body.photos || [],
    });

    assignedTour.tourStatus = "completed";
    await assignedTour.save();

    res.status(201).json({
      success: true,
      message: "Tour report submitted successfully",
      report,
    });
  } catch (error) {
    next(error);
  }
};