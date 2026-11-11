/**
 * Purpose: tour Resource Lifecycle Service business-logic service. Main declarations: releaseTourResources.
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
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";

// Define releaseTourResources; its parameters and body implement this operation.
export async function releaseTourResources(tourOrId, session = null) {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Declare tour for use by the surrounding module or function.
  const tour = typeof tourOrId === "object" && tourOrId?._id
    ? tourOrId
    : await Tour.findOne(mergeTenantFilter({ _id: tourOrId })).session(session);

  // Check the condition (!tour) and run the matching branch.
  if (!tour) return;

  // Declare staffIds for use by the surrounding module or function.
  const staffIds = [tour.assignedGuide, tour.assignedDriver].filter(Boolean);
  // Repeat the enclosed work for each required iteration.
  for (const staffId of staffIds) {
    // Declare staff for use by the surrounding module or function.
    const staff = await Staff.findOne(mergeTenantFilter({ _id: staffId })).session(session);
    // Check the condition (!staff) and run the matching branch.
    if (!staff) continue;
    // Perform the side effect or state update expressed on the following line.
    staff.assignedTours = (staff.assignedTours || []).filter((id) => String(id) !== String(tour._id));
    // Check the condition (staff.assignedTours.length === 0) and run the matching branch.
    if (staff.assignedTours.length === 0) staff.availability = "available";
    // Perform the side effect or state update expressed on the following line.
    await staff.save({ session });
  }

  // Check the condition (tour.assignedVehicle) and run the matching branch.
  if (tour.assignedVehicle) {
    // Perform the side effect or state update expressed on the following line.
    await Vehicle.findOneAndUpdate(
      mergeTenantFilter({ _id: tour.assignedVehicle, assignedTour: tour._id }),
      { $set: { status: "available", assignedTour: null } },
      { session }
    );
  }

  // Perform the side effect or state update expressed on the following line.
  tour.assignedGuide = null;
  // Perform the side effect or state update expressed on the following line.
  tour.assignedDriver = null;
  // Perform the side effect or state update expressed on the following line.
  tour.assignedVehicle = null;
  // Perform the side effect or state update expressed on the following line.
  tour.assignmentStatus = "pending";
  // Check the condition (tour.availabilitySettings) and run the matching branch.
  if (tour.availabilitySettings) {
    // Perform the side effect or state update expressed on the following line.
    tour.availabilitySettings.bookedSlots = 0;
  }
  // Perform the side effect or state update expressed on the following line.
  await tour.save({ session });
  // Return the value of tour to the caller.
  return tour;
}
