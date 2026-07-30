import Tour from "../models/Tour.js";

import Staff from "../models/Staff.js";

import Vehicle from "../models/Vehicle.js";

// ============================================================
// ASSIGN TOUR RESOURCES
// ============================================================

export const assignTourResources = async (req, res) => {
  try {
    const {
      guideId,

      driverId,

      vehicleId,
    } = req.body;

    const tour = await Tour.findById(req.params.id);

    if (!tour) {
      return res.status(404).json({
        success: false,

        message: "Tour not found",
      });
    }

    // CHECK GUIDE

    if (guideId) {
      const guide = await Staff.findOne({
        _id: guideId,

        position: "guide",

        isActive: true,
      });

      if (!guide) {
        return res.status(400).json({
          message: "Invalid guide",
        });
      }
    }

    // CHECK DRIVER

    if (driverId) {
      const driver = await Staff.findOne({
        _id: driverId,

        position: "driver",

        isActive: true,
      });

      if (!driver) {
        return res.status(400).json({
          message: "Invalid driver",
        });
      }
    }

    // CHECK VEHICLE

    if (vehicleId) {
      const vehicle = await Vehicle.findOne({
        _id: vehicleId,

        isActive: true,
      });

      if (!vehicle) {
        return res.status(400).json({
          message: "Invalid vehicle",
        });
      }
    }

    tour.assignedGuide = guideId;

    tour.assignedDriver = driverId;

    tour.assignedVehicle = vehicleId;

    tour.assignmentStatus = "assigned";

    await tour.save();

    res.json({
      success: true,

      message: "Tour assigned successfully",

      tour,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
