// server/controllers/tourAssignmentController.js

import Tour from "../models/Tour.js";
import Staff from "../models/Staff.js";
import Vehicle from "../models/Vehicle.js";

/*
|--------------------------------------------------------------------------
| ASSIGN TOUR RESOURCES
|--------------------------------------------------------------------------
| Assign Guide + Driver + Vehicle to a Tour
|--------------------------------------------------------------------------
*/

export const assignTourResources = async (req, res, next) => {
  try {
    const { guideId, driverId, vehicleId } = req.body;

    const tour = await Tour.findById(req.params.id);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | LOAD RESOURCES
    |--------------------------------------------------------------------------
    */

    const [guide, driver, vehicle] = await Promise.all([
      guideId
        ? Staff.findOne({
            _id: guideId,
            position: "guide",
            isActive: true,
          })
        : null,

      driverId
        ? Staff.findOne({
            _id: driverId,
            position: "driver",
            isActive: true,
          })
        : null,

      vehicleId
        ? Vehicle.findOne({
            _id: vehicleId,
            isActive: true,
          })
        : null,
    ]);

    /*
    |--------------------------------------------------------------------------
    | VALIDATE GUIDE
    |--------------------------------------------------------------------------
    */

    if (guideId && !guide) {
      return res.status(400).json({
        success: false,
        message: "Guide not found or inactive",
      });
    }

    if (guide && guide.availability !== "available") {
      return res.status(400).json({
        success: false,
        message: "Selected guide is unavailable",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE DRIVER
    |--------------------------------------------------------------------------
    */

    if (driverId && !driver) {
      return res.status(400).json({
        success: false,
        message: "Driver not found or inactive",
      });
    }

    if (driver && driver.availability !== "available") {
      return res.status(400).json({
        success: false,
        message: "Selected driver is unavailable",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE VEHICLE
    |--------------------------------------------------------------------------
    */

    if (vehicleId && !vehicle) {
      return res.status(400).json({
        success: false,
        message: "Vehicle not found or inactive",
      });
    }

    if (
      vehicle &&
      vehicle.availability &&
      vehicle.availability !== "available"
    ) {
      return res.status(400).json({
        success: false,
        message: "Selected vehicle is unavailable",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | ASSIGN RESOURCES
    |--------------------------------------------------------------------------
    */

    tour.assignedGuide = guideId || null;
    tour.assignedDriver = driverId || null;
    tour.assignedVehicle = vehicleId || null;
    tour.assignmentStatus = "assigned";

    await tour.save();

    /*
    |--------------------------------------------------------------------------
    | UPDATE STAFF / VEHICLE STATUS
    |--------------------------------------------------------------------------
    */

    const updates = [];

    if (guide) {
      updates.push(
        Staff.findByIdAndUpdate(guide._id, {
          availability: "assigned",
          $addToSet: {
            assignedTours: tour._id,
          },
        })
      );
    }

    if (driver) {
      updates.push(
        Staff.findByIdAndUpdate(driver._id, {
          availability: "assigned",
          $addToSet: {
            assignedTours: tour._id,
          },
        })
      );
    }

    if (vehicle) {
      updates.push(
        Vehicle.findByIdAndUpdate(vehicle._id, {
          availability: "assigned",
          assignedTour: tour._id,
        })
      );
    }

    await Promise.all(updates);

    /*
    |--------------------------------------------------------------------------
    | RETURN UPDATED TOUR
    |--------------------------------------------------------------------------
    */

    const updatedTour = await Tour.findById(tour._id)
      .populate("assignedGuide", "name phone email")
      .populate("assignedDriver", "name phone email")
      .populate("assignedVehicle", "registrationNumber model capacity");

    return res.status(200).json({
      success: true,
      message: "Tour resources assigned successfully",
      data: updatedTour,
    });
  } catch (error) {
    next(error);
  }
};