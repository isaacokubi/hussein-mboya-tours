// server/services/tourResourceService.js
// Canonical synchronization of Tour <-> Staff <-> Vehicle assignments.

import mongoose from "mongoose";
import Staff from "../models/Staff.js";
import Vehicle from "../models/Vehicle.js";

const sameId = (a, b) =>
  a && b && a.toString() === b.toString();

export const releaseStaffFromTour = async (staffId, tourId) => {
  if (!staffId) return null;

  const staff = await Staff.findById(staffId);
  if (!staff) return null;

  staff.assignedTours = (staff.assignedTours || []).filter(
    (id) => id.toString() !== tourId.toString()
  );

  if (staff.assignedTours.length === 0) {
    staff.availability = "available";
  }

  await staff.save();
  return staff;
};

export const releaseVehicleFromTour = async (vehicleId, tourId) => {
  if (!vehicleId) return null;

  return Vehicle.findOneAndUpdate(
    {
      _id: vehicleId,
      assignedTour: tourId,
    },
    {
      $set: {
        status: "available",
        assignedTour: null,
      },
    },
    { new: true }
  );
};

export const releaseTourResources = async (tour) => {
  if (!tour) return;

  if (tour.assignedGuide) {
    await releaseStaffFromTour(tour.assignedGuide, tour._id);
  }

  if (tour.assignedDriver) {
    await releaseStaffFromTour(tour.assignedDriver, tour._id);
  }

  if (tour.assignedVehicle) {
    await releaseVehicleFromTour(tour.assignedVehicle, tour._id);
  }
};

export const validateAndLoadResources = async ({
  guideId = null,
  driverId = null,
  vehicleId = null,
  currentGuideId = null,
  currentDriverId = null,
  currentVehicleId = null,
}) => {
  const ids = { guideId, driverId, vehicleId };

  for (const [key, id] of Object.entries(ids)) {
    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      const label = key.replace("Id", "");
      throw Object.assign(
        new Error(`Invalid ${label} ID.`),
        { statusCode: 400 }
      );
    }
  }

  const [guide, driver, vehicle] = await Promise.all([
    guideId
      ? Staff.findOne({
          _id: guideId,
          position: "guide",
          status: "active",
          isActive: true,
          isDeleted: { $ne: true },
        })
      : null,
    driverId
      ? Staff.findOne({
          _id: driverId,
          position: "driver",
          status: "active",
          isActive: true,
          isDeleted: { $ne: true },
        })
      : null,
    vehicleId
      ? Vehicle.findOne({
          _id: vehicleId,
          isActive: true,
          isDeleted: { $ne: true },
        })
      : null,
  ]);

  if (guideId && !guide) {
    throw Object.assign(new Error("Guide not found or inactive."), {
      statusCode: 400,
    });
  }

  if (
    guide &&
    guide.availability !== "available" &&
    !sameId(guide._id, currentGuideId)
  ) {
    throw Object.assign(new Error("Selected guide is unavailable."), {
      statusCode: 400,
    });
  }

  if (driverId && !driver) {
    throw Object.assign(new Error("Driver not found or inactive."), {
      statusCode: 400,
    });
  }

  if (
    driver &&
    driver.availability !== "available" &&
    !sameId(driver._id, currentDriverId)
  ) {
    throw Object.assign(new Error("Selected driver is unavailable."), {
      statusCode: 400,
    });
  }

  if (vehicleId && !vehicle) {
    throw Object.assign(new Error("Vehicle not found or inactive."), {
      statusCode: 400,
    });
  }

  if (
    vehicle &&
    vehicle.status !== "available" &&
    !sameId(vehicle._id, currentVehicleId)
  ) {
    throw Object.assign(new Error("Selected vehicle is unavailable."), {
      statusCode: 400,
    });
  }

  return { guide, driver, vehicle };
};

export const applyTourResources = async (
  tour,
  { guideId, driverId, vehicleId }
) => {
  const nextGuideId = guideId ?? null;
  const nextDriverId = driverId ?? null;
  const nextVehicleId = vehicleId ?? null;

  if (
    tour.assignedGuide &&
    !sameId(tour.assignedGuide, nextGuideId)
  ) {
    await releaseStaffFromTour(tour.assignedGuide, tour._id);
  }

  if (
    tour.assignedDriver &&
    !sameId(tour.assignedDriver, nextDriverId)
  ) {
    await releaseStaffFromTour(tour.assignedDriver, tour._id);
  }

  if (
    tour.assignedVehicle &&
    !sameId(tour.assignedVehicle, nextVehicleId)
  ) {
    await releaseVehicleFromTour(tour.assignedVehicle, tour._id);
  }

  tour.assignedGuide = nextGuideId;
  tour.assignedDriver = nextDriverId;
  tour.assignedVehicle = nextVehicleId;

  tour.assignmentStatus =
    nextGuideId || nextDriverId || nextVehicleId
      ? "assigned"
      : "pending";

  await tour.save();

  const [guide, driver, vehicle] = await Promise.all([
    nextGuideId ? Staff.findByIdAndUpdate(
      nextGuideId,
      {
        $set: { availability: "busy" },
        $addToSet: { assignedTours: tour._id },
      },
      { new: true }
    ) : null,
    nextDriverId ? Staff.findByIdAndUpdate(
      nextDriverId,
      {
        $set: { availability: "busy" },
        $addToSet: { assignedTours: tour._id },
      },
      { new: true }
    ) : null,
    nextVehicleId ? Vehicle.findByIdAndUpdate(
      nextVehicleId,
      {
        $set: {
          status: "assigned",
          assignedTour: tour._id,
        },
      },
      { new: true }
    ) : null,
  ]);

  return { tour, guide, driver, vehicle };
};
