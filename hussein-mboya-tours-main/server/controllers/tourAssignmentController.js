// server/controllers/tourAssignmentController.js

import mongoose from "mongoose";
import Tour from "../models/Tour.js";
import Staff from "../models/Staff.js";
import Vehicle from "../models/Vehicle.js";

const isValidId = (id) =>
  id === null || id === undefined || id === ""
    ? true
    : mongoose.Types.ObjectId.isValid(id);

const normalizeId = (value) =>
  value === undefined || value === null || value === ""
    ? null
    : value;

const sameId = (a, b) =>
  a && b && a.toString() === b.toString();

const getActiveGuide = async (id) => {
  if (!id) return null;
  return Staff.findOne({
    _id: id,
    position: "guide",
    isActive: true,
    status: "active",
    isDeleted: { $ne: true },
  });
};

const getActiveDriver = async (id) => {
  if (!id) return null;
  return Staff.findOne({
    _id: id,
    position: "driver",
    isActive: true,
    status: "active",
    isDeleted: { $ne: true },
  });
};

const getActiveVehicle = async (id) => {
  if (!id) return null;
  return Vehicle.findOne({
    _id: id,
    isActive: true,
    isDeleted: { $ne: true },
  });
};

const releaseStaffFromTour = async (staffId, tourId) => {
  if (!staffId) return;

  const staff = await Staff.findById(staffId);
  if (!staff) return;

  staff.assignedTours = (staff.assignedTours || []).filter(
    (id) => id.toString() !== tourId.toString()
  );

  if (staff.assignedTours.length === 0) {
    staff.availability = "available";
  }

  await staff.save();
};

const releaseVehicleFromTour = async (vehicleId, tourId) => {
  if (!vehicleId) return;

  await Vehicle.findOneAndUpdate(
    {
      _id: vehicleId,
      assignedTour: tourId,
    },
    {
      $set: {
        status: "available",
        assignedTour: null,
      },
    }
  );
};

/*
|--------------------------------------------------------------------------
| ASSIGN / REPLACE / REMOVE TOUR RESOURCES
|--------------------------------------------------------------------------
|
| Undefined field = keep existing assignment.
| null / ""       = remove assignment.
| valid ObjectId  = assign resource.
|--------------------------------------------------------------------------
*/

export const assignTourResources = async (req, res, next) => {
  try {
    const tourId = req.params.id;
    const { guideId, driverId, vehicleId } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(tourId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tour ID.",
      });
    }

    const tour = await Tour.findOne({
      _id: tourId,
      isDeleted: { $ne: true },
    });

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found.",
      });
    }

    const nextGuideId =
      guideId === undefined
        ? tour.assignedGuide
        : normalizeId(guideId);

    const nextDriverId =
      driverId === undefined
        ? tour.assignedDriver
        : normalizeId(driverId);

    const nextVehicleId =
      vehicleId === undefined
        ? tour.assignedVehicle
        : normalizeId(vehicleId);

    if (!isValidId(nextGuideId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid guide ID.",
      });
    }

    if (!isValidId(nextDriverId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid driver ID.",
      });
    }

    if (!isValidId(nextVehicleId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle ID.",
      });
    }

    const [guide, driver, vehicle] = await Promise.all([
      getActiveGuide(nextGuideId),
      getActiveDriver(nextDriverId),
      getActiveVehicle(nextVehicleId),
    ]);

    if (nextGuideId && !guide) {
      return res.status(400).json({
        success: false,
        message: "Guide not found or inactive.",
      });
    }

    if (
      guide &&
      guide.availability !== "available" &&
      !sameId(guide._id, tour.assignedGuide)
    ) {
      return res.status(400).json({
        success: false,
        message: "Selected guide is unavailable.",
      });
    }

    if (nextDriverId && !driver) {
      return res.status(400).json({
        success: false,
        message: "Driver not found or inactive.",
      });
    }

    if (
      driver &&
      driver.availability !== "available" &&
      !sameId(driver._id, tour.assignedDriver)
    ) {
      return res.status(400).json({
        success: false,
        message: "Selected driver is unavailable.",
      });
    }

    if (nextVehicleId && !vehicle) {
      return res.status(400).json({
        success: false,
        message: "Vehicle not found or inactive.",
      });
    }

    if (
      vehicle &&
      vehicle.status !== "available" &&
      !sameId(vehicle._id, tour.assignedVehicle)
    ) {
      return res.status(400).json({
        success: false,
        message: "Selected vehicle is unavailable.",
      });
    }

    const oldGuideId = tour.assignedGuide;
    const oldDriverId = tour.assignedDriver;
    const oldVehicleId = tour.assignedVehicle;

    if (oldGuideId && !sameId(oldGuideId, nextGuideId)) {
      await releaseStaffFromTour(oldGuideId, tour._id);
    }

    if (oldDriverId && !sameId(oldDriverId, nextDriverId)) {
      await releaseStaffFromTour(oldDriverId, tour._id);
    }

    if (oldVehicleId && !sameId(oldVehicleId, nextVehicleId)) {
      await releaseVehicleFromTour(oldVehicleId, tour._id);
    }

    tour.assignedGuide = nextGuideId || null;
    tour.assignedDriver = nextDriverId || null;
    tour.assignedVehicle = nextVehicleId || null;

    const hasAssignment =
      Boolean(tour.assignedGuide) ||
      Boolean(tour.assignedDriver) ||
      Boolean(tour.assignedVehicle);

    tour.assignmentStatus = hasAssignment ? "assigned" : "pending";

    await tour.save();

    if (guide) {
      await Staff.findByIdAndUpdate(guide._id, {
        $set: { availability: "busy" },
        $addToSet: { assignedTours: tour._id },
      });
    }

    if (driver) {
      await Staff.findByIdAndUpdate(driver._id, {
        $set: { availability: "busy" },
        $addToSet: { assignedTours: tour._id },
      });
    }

    if (vehicle) {
      await Vehicle.findByIdAndUpdate(vehicle._id, {
        $set: {
          status: "assigned",
          assignedTour: tour._id,
        },
      });
    }

    const updatedTour = await Tour.findById(tour._id)
      .populate(
        "assignedGuide",
        "name phone email position availability assignedTours"
      )
      .populate(
        "assignedDriver",
        "name phone email position availability assignedTours"
      )
      .populate(
        "assignedVehicle",
        "name registrationNumber registration model type capacity status assignedTour"
      );

    return res.status(200).json({
      success: true,
      message: hasAssignment
        ? "Tour resources assigned successfully."
        : "Tour resources cleared successfully.",
      data: updatedTour,
      tour: updatedTour,
    });
  } catch (error) {
    console.error("ASSIGN TOUR RESOURCES ERROR:", error);
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| COMPATIBILITY ADAPTERS
|--------------------------------------------------------------------------
*/

export const assignTourGuide = async (req, res, next) => {
  const tourId = req.body?.tourId;
  const guideId = req.body?.guideId;

  if (!tourId || !guideId) {
    return res.status(400).json({
      success: false,
      message: "tourId and guideId are required.",
    });
  }

  req.params.id = tourId;
  req.body = { guideId };

  return assignTourResources(req, res, next);
};

export const assignTourDriver = async (req, res, next) => {
  const tourId = req.body?.tourId;
  const driverId = req.body?.driverId;

  if (!tourId || !driverId) {
    return res.status(400).json({
      success: false,
      message: "tourId and driverId are required.",
    });
  }

  req.params.id = tourId;
  req.body = { driverId };

  return assignTourResources(req, res, next);
};

export const assignTourVehicle = async (req, res, next) => {
  const tourId = req.body?.tourId;
  const vehicleId = req.body?.vehicleId;

  if (!tourId || !vehicleId) {
    return res.status(400).json({
      success: false,
      message: "tourId and vehicleId are required.",
    });
  }

  req.params.id = tourId;
  req.body = { vehicleId };

  return assignTourResources(req, res, next);
};
