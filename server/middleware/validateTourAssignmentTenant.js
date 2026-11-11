/**
 * Purpose: validate Tour Assignment Tenant request middleware. Main declarations: validObjectId, validateTourAssignmentTenant.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/Staff.js so this module can use its exported dependencies.
import Staff from "../models/Staff.js";
// Load ../models/Vehicle.js so this module can use its exported dependencies.
import Vehicle from "../models/Vehicle.js";

// Declare validObjectId for use by the surrounding module or function.
const validObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

// Define validateTourAssignmentTenant; its parameters and body implement this operation.
export default async function validateTourAssignmentTenant(req, res, next) {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tourId for use by the surrounding module or function.
    const tourId = req.params.id || req.body?.tourId;
    // Check the condition (!tourId || !validObjectId(tourId)) and run the matching branch.
    if (!tourId || !validObjectId(tourId)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "A valid tour ID is required." });
    }

    // Declare tour for use by the surrounding module or function.
    const tour = await Tour.findOne(mergeTenantFilter(req, { _id: tourId, isDeleted: { $ne: true } })).lean();
    // Check the condition (!tour) and run the matching branch.
    if (!tour) return res.status(404).json({ success: false, message: "Tour not found." });

    // Declare requested for use by the surrounding module or function.
    const requested = [
      ["guideId", req.body?.guideId, { position: "guide" }],
      ["driverId", req.body?.driverId, { position: "driver" }],
      ["vehicleId", req.body?.vehicleId, null],
    ];

    // Repeat the enclosed work for each required iteration.
    for (const [field, id, extra] of requested) {
      // Check the condition (id === undefined || id === null || id === "") and run the matching branch.
      if (id === undefined || id === null || id === "") continue;
      // Check the condition (!validObjectId(id)) and run the matching branch.
      if (!validObjectId(id)) return res.status(400).json({ success: false, message: `Invalid ${field}.` });
      // Declare Model for use by the surrounding module or function.
      const Model = field === "vehicleId" ? Vehicle : Staff;
      // Declare filter for use by the surrounding module or function.
      const filter = mergeTenantFilter(req, { _id: id, isDeleted: { $ne: true }, ...(extra || {}) });
      // Declare resource for use by the surrounding module or function.
      const resource = await Model.findOne(filter).select("_id").lean();
      // Check the condition (!resource) and run the matching branch.
      if (!resource) return res.status(404).json({ success: false, message: `Selected ${field.replace("Id", "")} does not belong to this tenant or is unavailable.` });
    }

    // Perform the side effect or state update expressed on the following line.
    req.assignmentTour = tour;
    // Return the result of next() to the caller.
    return next();
  } catch (error) {
    // Return the result of next() to the caller.
    return next(error);
  }
}
