import mongoose from "mongoose";
import Tour from "../models/Tour.js";
import Staff from "../models/Staff.js";
import Vehicle from "../models/Vehicle.js";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";

const ACTIVE_TOUR_STATUSES = new Set(["scheduled", "upcoming", "confirmed", "active", "ongoing"]);

const idOrNull = (value) => (value === undefined || value === null || value === "" ? null : value);

const validId = (value) => value == null || mongoose.Types.ObjectId.isValid(value);

const getTourWindow = (tour) => {
  const start = new Date(tour.startDate || tour.date);
  if (Number.isNaN(start.getTime())) return null;
  const days = Math.max(Number(tour.durationDetails?.days || tour.duration || 1), 1);
  const end = new Date(start);
  end.setDate(end.getDate() + days);
  return { start, end };
};

const hasDateOverlap = (tour, candidate) => {
  const a = getTourWindow(tour);
  const b = getTourWindow(candidate);
  if (!a || !b) return false;
  return a.start < b.end && b.start < a.end;
};

async function assertResourceAvailable(Model, resourceId, field, currentTourId, candidateTour, session) {
  if (!resourceId) return null;

  const extra = Model === Staff
    ? { position: field === "guideId" ? "guide" : "driver", isActive: true, isDeleted: { $ne: true } }
    : { isActive: true, isDeleted: { $ne: true } };

  const resource = await Model.findOne(
    mergeTenantFilter({ ["_id"]: resourceId, ...extra })
  ).session(session).lean();

  if (!resource) {
    const label = field.replace("Id", "");
    throw Object.assign(new Error(`Selected ${label} does not belong to this tenant or is inactive.`), { status: 400 });
  }

  if (Model === Staff && resource.availability !== "available" && String(resource._id) !== String(candidateTour[field === "guideId" ? "assignedGuide" : "assignedDriver"])) {
    throw Object.assign(new Error(`Selected ${field.replace("Id", "")} is unavailable.`), { status: 409 });
  }

  if (Model === Vehicle && resource.status !== "available" && String(resource._id) !== String(candidateTour.assignedVehicle)) {
    throw Object.assign(new Error("Selected vehicle is unavailable."), { status: 409 });
  }

  const resourceField = field === "guideId" ? "assignedGuide" : field === "driverId" ? "assignedDriver" : "assignedVehicle";
  const conflictingTours = await Tour.find(
    mergeTenantFilter({
      _id: { $ne: currentTourId },
      isDeleted: { $ne: true },
      status: { $in: [...ACTIVE_TOUR_STATUSES] },
      [resourceField]: resource._id,
    })
  ).select("_id date startDate duration durationDetails status title").session(session).lean();

  const conflict = conflictingTours.find((tour) => hasDateOverlap(candidateTour, tour));
  if (conflict) {
    throw Object.assign(
      new Error(`Selected ${field.replace("Id", "")} is already assigned to another tour during this tour period.`),
      { status: 409, code: "RESOURCE_DOUBLE_BOOKED" }
    );
  }

  return resource;
}

export const assignTourResourcesSafe = async (req, res, next) => {
  requireTenantId();
  const session = await mongoose.startSession();

  try {
    let response;
    await session.withTransaction(async () => {
      const tourId = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(tourId)) {
        throw Object.assign(new Error("Invalid tour ID."), { status: 400 });
      }

      const tour = await Tour.findOne(
        mergeTenantFilter({ _id: tourId, isDeleted: { $ne: true } })
      ).session(session);

      if (!tour) throw Object.assign(new Error("Tour not found."), { status: 404 });

      const nextGuideId = idOrNull(req.body?.guideId === undefined ? tour.assignedGuide : req.body.guideId);
      const nextDriverId = idOrNull(req.body?.driverId === undefined ? tour.assignedDriver : req.body.driverId);
      const nextVehicleId = idOrNull(req.body?.vehicleId === undefined ? tour.assignedVehicle : req.body.vehicleId);

      for (const [field, value] of [["guideId", nextGuideId], ["driverId", nextDriverId], ["vehicleId", nextVehicleId]]) {
        if (!validId(value)) throw Object.assign(new Error(`Invalid ${field}.`), { status: 400 });
      }

      const [guide, driver, vehicle] = await Promise.all([
        assertResourceAvailable(Staff, nextGuideId, "guideId", tour._id, tour, session),
        assertResourceAvailable(Staff, nextDriverId, "driverId", tour._id, tour, session),
        assertResourceAvailable(Vehicle, nextVehicleId, "vehicleId", tour._id, tour, session),
      ]);

      const oldGuideId = tour.assignedGuide ? String(tour.assignedGuide) : null;
      const oldDriverId = tour.assignedDriver ? String(tour.assignedDriver) : null;
      const oldVehicleId = tour.assignedVehicle ? String(tour.assignedVehicle) : null;

      tour.assignedGuide = guide?._id || null;
      tour.assignedDriver = driver?._id || null;
      tour.assignedVehicle = vehicle?._id || null;
      tour.assignmentStatus = guide || driver || vehicle ? "assigned" : "pending";
      await tour.save({ session });

      const releaseStaff = async (id, nextId) => {
        if (!id || id === String(nextId || "")) return;
        const staff = await Staff.findOne(mergeTenantFilter({ _id: id })).session(session);
        if (!staff) return;
        staff.assignedTours = (staff.assignedTours || []).filter((assignedId) => String(assignedId) !== String(tour._id));
        if (staff.assignedTours.length === 0) staff.availability = "available";
        await staff.save({ session });
      };

      await releaseStaff(oldGuideId, guide?._id);
      await releaseStaff(oldDriverId, driver?._id);

      if (oldVehicleId && oldVehicleId !== String(vehicle?._id || "")) {
        await Vehicle.findOneAndUpdate(
          mergeTenantFilter({ _id: oldVehicleId, assignedTour: tour._id }),
          { $set: { status: "available", assignedTour: null } },
          { session }
        );
      }

      const assignStaff = async (resource) => {
        if (!resource) return;
        await Staff.findOneAndUpdate(
          mergeTenantFilter({ _id: resource._id }),
          { $set: { availability: "busy" }, $addToSet: { assignedTours: tour._id } },
          { session }
        );
      };

      await assignStaff(guide);
      await assignStaff(driver);

      if (vehicle) {
        await Vehicle.findOneAndUpdate(
          mergeTenantFilter({ _id: vehicle._id }),
          { $set: { status: "assigned", assignedTour: tour._id } },
          { session }
        );
      }

      const updatedTour = await Tour.findOne(mergeTenantFilter({ _id: tour._id }))
        .populate("destination", "name country location image")
        .populate("assignedGuide", "name email phone position availability assignedTours")
        .populate("assignedDriver", "name email phone position availability assignedTours")
        .populate("assignedVehicle", "name registrationNumber registration model type capacity status assignedTour")
        .session(session)
        .lean();

      response = { success: true, message: guide || driver || vehicle ? "Tour resources assigned successfully." : "Tour resources cleared successfully.", data: updatedTour };
    });

    return res.status(200).json(response);
  } catch (error) {
    console.error("SAFE TOUR RESOURCE ASSIGNMENT ERROR:", error);
    return next(error);
  } finally {
    await session.endSession();
  }
};
