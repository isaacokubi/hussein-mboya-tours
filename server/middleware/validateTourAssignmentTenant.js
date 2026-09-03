import mongoose from "mongoose";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Tour from "../models/Tour.js";
import Staff from "../models/Staff.js";
import Vehicle from "../models/Vehicle.js";

const validObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

export default async function validateTourAssignmentTenant(req, res, next) {
  requireTenantId();
  try {
    const tourId = req.params.id || req.body?.tourId;
    if (!tourId || !validObjectId(tourId)) {
      return res.status(400).json({ success: false, message: "A valid tour ID is required." });
    }

    const tour = await Tour.findOne(mergeTenantFilter(req, { _id: tourId, isDeleted: { $ne: true } })).lean();
    if (!tour) return res.status(404).json({ success: false, message: "Tour not found." });

    const requested = [
      ["guideId", req.body?.guideId, { position: "guide" }],
      ["driverId", req.body?.driverId, { position: "driver" }],
      ["vehicleId", req.body?.vehicleId, null],
    ];

    for (const [field, id, extra] of requested) {
      if (id === undefined || id === null || id === "") continue;
      if (!validObjectId(id)) return res.status(400).json({ success: false, message: `Invalid ${field}.` });
      const Model = field === "vehicleId" ? Vehicle : Staff;
      const filter = mergeTenantFilter(req, { _id: id, isDeleted: { $ne: true }, ...(extra || {}) });
      const resource = await Model.findOne(filter).select("_id").lean();
      if (!resource) return res.status(404).json({ success: false, message: `Selected ${field.replace("Id", "")} does not belong to this tenant or is unavailable.` });
    }

    req.assignmentTour = tour;
    return next();
  } catch (error) {
    return next(error);
  }
}
