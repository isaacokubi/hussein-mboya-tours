import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Staff from "../models/Staff.js";
import Vehicle from "../models/Vehicle.js";
import Agent from "../models/Agent.js";
import { requireTenantId, mergeTenantFilter } from "../tenancy/context.js";

const validId = (value) => Boolean(value) && mongoose.Types.ObjectId.isValid(value);
const fail = (res, status, message) => res.status(status).json({ success: false, message });

export const guardBookingResources = async (req, res, next) => {
  requireTenantId();
  try {
    if (!validId(req.params.id)) return fail(res, 400, "Invalid booking ID.");
    const booking = await Booking.findOne(mergeTenantFilter(req, { _id: req.params.id }))
      .select("_id tenantId paymentStatus status")
      .lean();
    if (!booking) return fail(res, 404, "Booking not found.");

    const ids = { guide: req.body?.guide, driver: req.body?.driver, vehicle: req.body?.vehicle, agent: req.body?.agent };
    for (const [name, id] of Object.entries(ids)) {
      if (id && !validId(id)) return fail(res, 400, `Invalid ${name} ID.`);
    }

    const [guideDoc, driverDoc, vehicleDoc, agentDoc] = await Promise.all([
      ids.guide ? Staff.findOne(mergeTenantFilter(req, { _id: ids.guide, position: "guide", status: "active", isDeleted: { $ne: true } })).lean() : null,
      ids.driver ? Staff.findOne(mergeTenantFilter(req, { _id: ids.driver, position: "driver", status: "active", isDeleted: { $ne: true } })).lean() : null,
      ids.vehicle ? Vehicle.findOne(mergeTenantFilter(req, { _id: ids.vehicle, isActive: true, isDeleted: { $ne: true } })).lean() : null,
      ids.agent ? Agent.findOne(mergeTenantFilter(req, { _id: ids.agent, status: { $ne: "deleted" } })).lean() : null,
    ]);

    if ((ids.guide && !guideDoc) || (ids.driver && !driverDoc) || (ids.vehicle && !vehicleDoc) || (ids.agent && !agentDoc)) {
      return fail(res, 409, "One or more assigned resources do not belong to this tenant or are unavailable.");
    }
    if (vehicleDoc && ["maintenance", "out_of_service"].includes(vehicleDoc.status)) {
      return fail(res, 409, "Vehicle is not available for assignment.");
    }
    if (guideDoc && guideDoc.availability && !["available", "busy"].includes(guideDoc.availability)) {
      return fail(res, 409, "Guide is not available for assignment.");
    }
    if (driverDoc && driverDoc.availability && !["available", "busy"].includes(driverDoc.availability)) {
      return fail(res, 409, "Driver is not available for assignment.");
    }

    req.booking = booking;
    next();
  } catch (error) {
    next(error);
  }
};

export const guardPaymentRefund = async (req, res, next) => {
  requireTenantId();
  try {
    if (!validId(req.params.id)) return fail(res, 400, "Invalid payment ID.");
    const payment = await Payment.findOne(mergeTenantFilter(req, { _id: req.params.id }))
      .select("_id tenantId booking amount refundedAmount refundRequestedAmount refundStatus status")
      .lean();
    if (!payment) return fail(res, 404, "Payment not found.");
    if (payment.status !== "completed") return fail(res, 409, "Only completed payments can be refunded.");
    if (["processing", "completed"].includes(payment.refundStatus)) return fail(res, 409, "A refund is already in progress or completed for this payment.");

    const paid = Number(payment.amount || 0);
    const alreadyRefunded = Number(payment.refundedAmount || 0);
    const requested = Number(req.body?.amount || paid - alreadyRefunded);
    const remaining = Math.max(0, paid - alreadyRefunded);
    if (!Number.isFinite(requested) || requested <= 0 || requested > remaining) {
      return fail(res, 400, `Invalid refund amount. Maximum refundable amount is ${remaining}.`);
    }
    req.payment = payment;
    req.refundAmount = requested;
    next();
  } catch (error) {
    next(error);
  }
};
