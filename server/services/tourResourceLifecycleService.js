import mongoose from "mongoose";
import Tour from "../models/Tour.js";
import Staff from "../models/Staff.js";
import Vehicle from "../models/Vehicle.js";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";

export async function releaseTourResources(tourOrId, session = null) {
  requireTenantId();
  const tour = typeof tourOrId === "object" && tourOrId?._id
    ? tourOrId
    : await Tour.findOne(mergeTenantFilter({ _id: tourOrId })).session(session);

  if (!tour) return;

  const staffIds = [tour.assignedGuide, tour.assignedDriver].filter(Boolean);
  for (const staffId of staffIds) {
    const staff = await Staff.findOne(mergeTenantFilter({ _id: staffId })).session(session);
    if (!staff) continue;
    staff.assignedTours = (staff.assignedTours || []).filter((id) => String(id) !== String(tour._id));
    if (staff.assignedTours.length === 0) staff.availability = "available";
    await staff.save({ session });
  }

  if (tour.assignedVehicle) {
    await Vehicle.findOneAndUpdate(
      mergeTenantFilter({ _id: tour.assignedVehicle, assignedTour: tour._id }),
      { $set: { status: "available", assignedTour: null } },
      { session }
    );
  }

  tour.assignedGuide = null;
  tour.assignedDriver = null;
  tour.assignedVehicle = null;
  tour.assignmentStatus = "pending";
  if (tour.availabilitySettings) {
    tour.availabilitySettings.bookedSlots = 0;
  }
  await tour.save({ session });
  return tour;
}
