/**
 * Purpose: tour Resource Assignment Controller HTTP controller. Main declarations: idOrNull, validId, getTourWindow, hasDateOverlap, assertResourceAvailable.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/Staff.js so this module can use its exported dependencies.
import Staff from "../models/Staff.js";
// Load ../models/Vehicle.js so this module can use its exported dependencies.
import Vehicle from "../models/Vehicle.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { getTenantContext, mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../services/webhookDeliveryService.js so this module can use its exported dependencies.
import { queueWebhookEvent } from "../services/webhookDeliveryService.js";

// Declare ACTIVE_TOUR_STATUSES for use by the surrounding module or function.
const ACTIVE_TOUR_STATUSES = new Set(["scheduled", "upcoming", "confirmed", "active", "ongoing"]);

// Declare idOrNull for use by the surrounding module or function.
const idOrNull = (value) => (value === undefined || value === null || value === "" ? null : value);

// Declare validId for use by the surrounding module or function.
const validId = (value) => value == null || mongoose.Types.ObjectId.isValid(value);

// Declare getTourWindow for use by the surrounding module or function.
const getTourWindow = (tour) => {
  // Declare start for use by the surrounding module or function.
  const start = new Date(tour.startDate || tour.date);
  // Check the condition (Number.isNaN(start.getTime())) and run the matching branch.
  if (Number.isNaN(start.getTime())) return null;
  // Declare days for use by the surrounding module or function.
  const days = Math.max(Number(tour.durationDetails?.days || tour.duration || 1), 1);
  // Declare end for use by the surrounding module or function.
  const end = new Date(start);
  // Perform the side effect or state update expressed on the following line.
  end.setDate(end.getDate() + days);
  // Return the object assembled below to the caller.
  return { start, end };
};

// Declare hasDateOverlap for use by the surrounding module or function.
const hasDateOverlap = (tour, candidate) => {
  // Declare a for use by the surrounding module or function.
  const a = getTourWindow(tour);
  // Declare b for use by the surrounding module or function.
  const b = getTourWindow(candidate);
  // Check the condition (!a || !b) and run the matching branch.
  if (!a || !b) return false;
  // Return the expression shown below to the caller.
  return a.start < b.end && b.start < a.end;
};

// Define assertResourceAvailable; its parameters and body implement this operation.
async function assertResourceAvailable(Model, resourceId, field, currentTourId, candidateTour, session) {
  // Check the condition (!resourceId) and run the matching branch.
  if (!resourceId) return null;

  // Declare extra for use by the surrounding module or function.
  const extra = Model === Staff
    ? { position: field === "guideId" ? "guide" : "driver", isActive: true, isDeleted: { $ne: true } }
    : { isActive: true, isDeleted: { $ne: true } };

  // Declare resource for use by the surrounding module or function.
  const resource = await Model.findOne(
    mergeTenantFilter({ ["_id"]: resourceId, ...extra })
  ).session(session).lean();

  // Check the condition (!resource) and run the matching branch.
  if (!resource) {
    // Declare label for use by the surrounding module or function.
    const label = field.replace("Id", "");
    // Stop the current operation by raising the result of Object.assign().
    throw Object.assign(new Error(`Selected ${label} does not belong to this tenant or is inactive.`), { status: 400 });
  }

  // Check the condition (Model === Staff && resource.availability !== "available" && String(res) and run the matching branch.
  if (Model === Staff && resource.availability !== "available" && String(resource._id) !== String(candidateTour[field === "guideId" ? "assignedGuide" : "assignedDriver"])) {
    // Stop the current operation by raising the result of Object.assign().
    throw Object.assign(new Error(`Selected ${field.replace("Id", "")} is unavailable.`), { status: 409 });
  }

  // Check the condition (Model === Vehicle && resource.status !== "available" && String(resourc) and run the matching branch.
  if (Model === Vehicle && resource.status !== "available" && String(resource._id) !== String(candidateTour.assignedVehicle)) {
    // Stop the current operation by raising the result of Object.assign().
    throw Object.assign(new Error("Selected vehicle is unavailable."), { status: 409 });
  }

  // Declare resourceField for use by the surrounding module or function.
  const resourceField = field === "guideId" ? "assignedGuide" : field === "driverId" ? "assignedDriver" : "assignedVehicle";
  // Declare conflictingTours for use by the surrounding module or function.
  const conflictingTours = await Tour.find(
    mergeTenantFilter({
      _id: { $ne: currentTourId },
      isDeleted: { $ne: true },
      status: { $in: [...ACTIVE_TOUR_STATUSES] },
      [resourceField]: resource._id,
    })
  ).select("_id date startDate duration durationDetails status title").session(session).lean();

  // Declare conflict for use by the surrounding module or function.
  const conflict = conflictingTours.find((tour) => hasDateOverlap(candidateTour, tour));
  // Check the condition (conflict) and run the matching branch.
  if (conflict) {
    // Stop the current operation by raising the result of Object.assign().
    throw Object.assign(
      new Error(`Selected ${field.replace("Id", "")} is already assigned to another tour during this tour period.`),
      { status: 409, code: "RESOURCE_DOUBLE_BOOKED" }
    );
  }

  // Return the value of resource to the caller.
  return resource;
}

// Declare assignTourResourcesSafe for use by the surrounding module or function.
export const assignTourResourcesSafe = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Declare session for use by the surrounding module or function.
  const session = await mongoose.startSession();

  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare response for use by the surrounding module or function.
    let response;
    // Perform the side effect or state update expressed on the following line.
    await session.withTransaction(async () => {
      // Declare tourId for use by the surrounding module or function.
      const tourId = req.params.id;
      // Check the condition (!mongoose.Types.ObjectId.isValid(tourId)) and run the matching branch.
      if (!mongoose.Types.ObjectId.isValid(tourId)) {
        // Stop the current operation by raising the result of Object.assign().
        throw Object.assign(new Error("Invalid tour ID."), { status: 400 });
      }

      // Declare tour for use by the surrounding module or function.
      const tour = await Tour.findOne(
        mergeTenantFilter({ _id: tourId, isDeleted: { $ne: true } })
      ).session(session);

      // Check the condition (!tour) and run the matching branch.
      if (!tour) throw Object.assign(new Error("Tour not found."), { status: 404 });

      // Declare nextGuideId for use by the surrounding module or function.
      const nextGuideId = idOrNull(req.body?.guideId === undefined ? tour.assignedGuide : req.body.guideId);
      // Declare nextDriverId for use by the surrounding module or function.
      const nextDriverId = idOrNull(req.body?.driverId === undefined ? tour.assignedDriver : req.body.driverId);
      // Declare nextVehicleId for use by the surrounding module or function.
      const nextVehicleId = idOrNull(req.body?.vehicleId === undefined ? tour.assignedVehicle : req.body.vehicleId);

      // Repeat the enclosed work for each required iteration.
      for (const [field, value] of [["guideId", nextGuideId], ["driverId", nextDriverId], ["vehicleId", nextVehicleId]]) {
        // Check the condition (!validId(value)) and run the matching branch.
        if (!validId(value)) throw Object.assign(new Error(`Invalid ${field}.`), { status: 400 });
      }

      // Declare [guide, driver, vehicle] for use by the surrounding module or function.
      const [guide, driver, vehicle] = await Promise.all([
        assertResourceAvailable(Staff, nextGuideId, "guideId", tour._id, tour, session),
        assertResourceAvailable(Staff, nextDriverId, "driverId", tour._id, tour, session),
        assertResourceAvailable(Vehicle, nextVehicleId, "vehicleId", tour._id, tour, session),
      ]);

      // Declare oldGuideId for use by the surrounding module or function.
      const oldGuideId = tour.assignedGuide ? String(tour.assignedGuide) : null;
      // Declare oldDriverId for use by the surrounding module or function.
      const oldDriverId = tour.assignedDriver ? String(tour.assignedDriver) : null;
      // Declare oldVehicleId for use by the surrounding module or function.
      const oldVehicleId = tour.assignedVehicle ? String(tour.assignedVehicle) : null;

      // Perform the side effect or state update expressed on the following line.
      tour.assignedGuide = guide?._id || null;
      // Perform the side effect or state update expressed on the following line.
      tour.assignedDriver = driver?._id || null;
      // Perform the side effect or state update expressed on the following line.
      tour.assignedVehicle = vehicle?._id || null;
      // Perform the side effect or state update expressed on the following line.
      tour.assignmentStatus = guide || driver || vehicle ? "assigned" : "pending";
      // Perform the side effect or state update expressed on the following line.
      await tour.save({ session });

      // Declare releaseStaff for use by the surrounding module or function.
      const releaseStaff = async (id, nextId) => {
        // Check the condition (!id || id === String(nextId || "")) and run the matching branch.
        if (!id || id === String(nextId || "")) return;
        // Declare staff for use by the surrounding module or function.
        const staff = await Staff.findOne(mergeTenantFilter({ _id: id })).session(session);
        // Check the condition (!staff) and run the matching branch.
        if (!staff) return;
        // Perform the side effect or state update expressed on the following line.
        staff.assignedTours = (staff.assignedTours || []).filter((assignedId) => String(assignedId) !== String(tour._id));
        // Check the condition (staff.assignedTours.length === 0) and run the matching branch.
        if (staff.assignedTours.length === 0) staff.availability = "available";
        // Perform the side effect or state update expressed on the following line.
        await staff.save({ session });
      };

      // Perform the side effect or state update expressed on the following line.
      await releaseStaff(oldGuideId, guide?._id);
      // Perform the side effect or state update expressed on the following line.
      await releaseStaff(oldDriverId, driver?._id);

      // Check the condition (oldVehicleId && oldVehicleId !== String(vehicle?._id || "")) and run the matching branch.
      if (oldVehicleId && oldVehicleId !== String(vehicle?._id || "")) {
        // Perform the side effect or state update expressed on the following line.
        await Vehicle.findOneAndUpdate(
          mergeTenantFilter({ _id: oldVehicleId, assignedTour: tour._id }),
          { $set: { status: "available", assignedTour: null } },
          { session }
        );
      }

      // Declare assignStaff for use by the surrounding module or function.
      const assignStaff = async (resource) => {
        // Check the condition (!resource) and run the matching branch.
        if (!resource) return;
        // Perform the side effect or state update expressed on the following line.
        await Staff.findOneAndUpdate(
          mergeTenantFilter({ _id: resource._id }),
          { $set: { availability: "busy" }, $addToSet: { assignedTours: tour._id } },
          { session }
        );
      };

      // Perform the side effect or state update expressed on the following line.
      await assignStaff(guide);
      // Perform the side effect or state update expressed on the following line.
      await assignStaff(driver);

      // Check the condition (vehicle) and run the matching branch.
      if (vehicle) {
        // Perform the side effect or state update expressed on the following line.
        await Vehicle.findOneAndUpdate(
          mergeTenantFilter({ _id: vehicle._id }),
          { $set: { status: "assigned", assignedTour: tour._id } },
          { session }
        );
      }

      // Declare updatedTour for use by the surrounding module or function.
      const updatedTour = await Tour.findOne(mergeTenantFilter({ _id: tour._id }))
        .populate("destination", "name country location image")
        .populate("assignedGuide", "name email phone position availability assignedTours")
        .populate("assignedDriver", "name email phone position availability assignedTours")
        .populate("assignedVehicle", "name registrationNumber registration model type capacity status assignedTour")
        .session(session)
        .lean();

      // Perform the side effect or state update expressed on the following line.
      response = { success: true, message: guide || driver || vehicle ? "Tour resources assigned successfully." : "Tour resources cleared successfully.", data: updatedTour };
    });

    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Declare tenantId for use by the surrounding module or function.
      const tenantId = getTenantContext()?.tenantId;
      // Check the condition (tenantId) and run the matching branch.
      if (tenantId) {
        // Perform the side effect or state update expressed on the following line.
        await queueWebhookEvent({
          tenantId,
          event: "tour.resources.assigned",
          sourceId: String(req.params.id),
          data: {
            tourId: req.params.id,
            guideId: req.body?.guideId || null,
            driverId: req.body?.driverId || null,
            vehicleId: req.body?.vehicleId || null,
            assignedBy: req.user?._id || null,
            occurredAt: new Date(),
          },
        });
      }
    } catch (notificationError) {
      // Perform the side effect or state update expressed on the following line.
      console.error("DURABLE ASSIGNMENT NOTIFICATION QUEUE ERROR:", notificationError.message);
    }
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json(response);
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("SAFE TOUR RESOURCE ASSIGNMENT ERROR:", error);
    // Return the result of next() to the caller.
    return next(error);
  } finally {
    // Perform the side effect or state update expressed on the following line.
    await session.endSession();
  }
};
