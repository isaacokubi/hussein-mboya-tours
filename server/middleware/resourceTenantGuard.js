/**
 * Purpose: resource Tenant Guard request middleware. Main declarations: validId, fail, guardBookingResources, guardPaymentRefund.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Load ../models/Staff.js so this module can use its exported dependencies.
import Staff from "../models/Staff.js";
// Load ../models/Vehicle.js so this module can use its exported dependencies.
import Vehicle from "../models/Vehicle.js";
// Load ../models/Agent.js so this module can use its exported dependencies.
import Agent from "../models/Agent.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { requireTenantId, mergeTenantFilter } from "../tenancy/context.js";

// Declare validId for use by the surrounding module or function.
const validId = (value) => Boolean(value) && mongoose.Types.ObjectId.isValid(value);
// Declare fail for use by the surrounding module or function.
const fail = (res, status, message) => res.status(status).json({ success: false, message });

// Declare guardBookingResources for use by the surrounding module or function.
export const guardBookingResources = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!validId(req.params.id)) and run the matching branch.
    if (!validId(req.params.id)) return fail(res, 400, "Invalid booking ID.");
    // Declare booking for use by the surrounding module or function.
    const booking = await Booking.findOne(mergeTenantFilter(req, { _id: req.params.id }))
      .select("_id tenantId paymentStatus status travelDate assignedGuide assignedDriver assignedVehicle tour")
      .lean();
    // Check the condition (!booking) and run the matching branch.
    if (!booking) return fail(res, 404, "Booking not found.");

    // Declare ids for use by the surrounding module or function.
    const ids = { guide: req.body?.guide, driver: req.body?.driver, vehicle: req.body?.vehicle, agent: req.body?.agent };
    // Repeat the enclosed work for each required iteration.
    for (const [name, id] of Object.entries(ids)) if (id && !validId(id)) return fail(res, 400, `Invalid ${name} ID.`);

    // Declare [guideDoc, driverDoc, vehicleDoc, agentDoc] for use by the surrounding module or function.
    const [guideDoc, driverDoc, vehicleDoc, agentDoc] = await Promise.all([
      ids.guide ? Staff.findOne(mergeTenantFilter(req, { _id: ids.guide, position: "guide", status: "active", isDeleted: { $ne: true } })).lean() : null,
      ids.driver ? Staff.findOne(mergeTenantFilter(req, { _id: ids.driver, position: "driver", status: "active", isDeleted: { $ne: true } })).lean() : null,
      ids.vehicle ? Vehicle.findOne(mergeTenantFilter(req, { _id: ids.vehicle, isActive: true, isDeleted: { $ne: true } })).lean() : null,
      ids.agent ? Agent.findOne(mergeTenantFilter(req, { _id: ids.agent, status: { $ne: "deleted" } })).lean() : null,
    ]);

    // Check the condition ((ids.guide && !guideDoc) || (ids.driver && !driverDoc) || (ids.vehicle) and run the matching branch.
    if ((ids.guide && !guideDoc) || (ids.driver && !driverDoc) || (ids.vehicle && !vehicleDoc) || (ids.agent && !agentDoc)) return fail(res, 409, "One or more assigned resources do not belong to this tenant or are unavailable.");
    // Check the condition (vehicleDoc && ["maintenance", "out_of_service"].includes(vehicleDoc.st) and run the matching branch.
    if (vehicleDoc && ["maintenance", "out_of_service"].includes(vehicleDoc.status)) return fail(res, 409, "Vehicle is not available for assignment.");
    // Check the condition (guideDoc && guideDoc.availability && !["available", "busy"].includes(g) and run the matching branch.
    if (guideDoc && guideDoc.availability && !["available", "busy"].includes(guideDoc.availability)) return fail(res, 409, "Guide is not available for assignment.");
    // Check the condition (driverDoc && driverDoc.availability && !["available", "busy"].includes) and run the matching branch.
    if (driverDoc && driverDoc.availability && !["available", "busy"].includes(driverDoc.availability)) return fail(res, 409, "Driver is not available for assignment.");

    // Declare resourceChecks for use by the surrounding module or function.
    const resourceChecks = [
      ["guide", ids.guide, "assignedGuide"],
      ["driver", ids.driver, "assignedDriver"],
      ["vehicle", ids.vehicle, "assignedVehicle"],
    ];
    // Declare start for use by the surrounding module or function.
    const start = new Date(booking.travelDate);
    // Check the condition (!Number.isNaN(start.getTime())) and run the matching branch.
    if (!Number.isNaN(start.getTime())) {
      // Perform the side effect or state update expressed on the following line.
      start.setHours(0, 0, 0, 0);
      // Declare end for use by the surrounding module or function.
      const end = new Date(start); end.setDate(end.getDate() + 1);
      // Repeat the enclosed work for each required iteration.
      for (const [label, id, field] of resourceChecks) {
        // Check the condition (!id) and run the matching branch.
        if (!id) continue;
        // Declare conflict for use by the surrounding module or function.
        const conflict = await Booking.findOne(mergeTenantFilter(req, {
          _id: { $ne: booking._id },
          [field]: id,
          travelDate: { $gte: start, $lt: end },
          status: { $nin: ["cancelled", "refunded", "completed"] },
          isDeleted: { $ne: true },
        })).select("bookingNumber travelDate status").lean();
        // Check the condition (conflict) and run the matching branch.
        if (conflict) return fail(res, 409, `Selected ${label} is already assigned to booking ${conflict.bookingNumber || conflict._id} on this travel date.`);
      }
    }

    // Perform the side effect or state update expressed on the following line.
    req.booking = booking;
    // Perform the side effect or state update expressed on the following line.
    next();
  } catch (error) { next(error); }
};

// Declare guardPaymentRefund for use by the surrounding module or function.
export const guardPaymentRefund = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!validId(req.params.id)) and run the matching branch.
    if (!validId(req.params.id)) return fail(res, 400, "Invalid payment ID.");
    // Declare payment for use by the surrounding module or function.
    const payment = await Payment.findOne(mergeTenantFilter(req, { _id: req.params.id }))
      .select("_id tenantId booking amount refundedAmount refundRequestedAmount refundStatus status")
      .lean();
    // Check the condition (!payment) and run the matching branch.
    if (!payment) return fail(res, 404, "Payment not found.");
    // Check the condition (payment.status !== "completed") and run the matching branch.
    if (payment.status !== "completed") return fail(res, 409, "Only completed payments can be refunded.");
    // Check the condition (["processing", "completed"].includes(payment.refundStatus)) and run the matching branch.
    if (["processing", "completed"].includes(payment.refundStatus)) return fail(res, 409, "A refund is already in progress or completed for this payment.");

    // Declare paid for use by the surrounding module or function.
    const paid = Number(payment.amount || 0);
    // Declare alreadyRefunded for use by the surrounding module or function.
    const alreadyRefunded = Number(payment.refundedAmount || 0);
    // Declare requested for use by the surrounding module or function.
    const requested = Number(req.body?.amount || paid - alreadyRefunded);
    // Declare remaining for use by the surrounding module or function.
    const remaining = Math.max(0, paid - alreadyRefunded);
    // Check the condition (!Number.isFinite(requested) || requested <= 0 || requested > remaining) and run the matching branch.
    if (!Number.isFinite(requested) || requested <= 0 || requested > remaining) return fail(res, 400, `Invalid refund amount. Maximum refundable amount is ${remaining}.`);
    // Perform the side effect or state update expressed on the following line.
    req.payment = payment;
    // Perform the side effect or state update expressed on the following line.
    req.refundAmount = requested;
    // Perform the side effect or state update expressed on the following line.
    next();
  } catch (error) { next(error); }
};
