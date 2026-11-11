/**
 * Purpose: validate Booking Travel Date request middleware. Main declarations: startOfDay, parseDurationDays, getDurationDays, validateBookingTravelDate.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/CustomTourRequest.js so this module can use its exported dependencies.
import CustomTourRequest from "../models/CustomTourRequest.js";

// Declare startOfDay for use by the surrounding module or function.
const startOfDay = (value) => {
  // Declare date for use by the surrounding module or function.
  const date = new Date(value);
  // Check the condition (Number.isNaN(date.getTime())) and run the matching branch.
  if (Number.isNaN(date.getTime())) return null;
  // Perform the side effect or state update expressed on the following line.
  date.setHours(0, 0, 0, 0);
  // Return the value of date to the caller.
  return date;
};

// Declare parseDurationDays for use by the surrounding module or function.
const parseDurationDays = (value, fallback = 1) => {
  // Declare match for use by the surrounding module or function.
  const match = String(value ?? "").match(/\d+(?:\.\d+)?/);
  // Declare days for use by the surrounding module or function.
  const days = match ? Number(match[0]) : Number(fallback);
  // Return the expression shown below to the caller.
  return Number.isFinite(days) && days >= 1 ? Math.max(1, Math.round(days)) : 1;
};

// Declare getDurationDays for use by the surrounding module or function.
const getDurationDays = (...values) => { for (const value of values) { if (value !== undefined && value !== null && String(value).trim() !== "") return parseDurationDays(value, 1); } return 1; };

// Declare validateBookingTravelDate for use by the surrounding module or function.
export const validateBookingTravelDate = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!req.body?.travelDate) and run the matching branch.
    if (!req.body?.travelDate) return next();
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();

    // Declare start for use by the surrounding module or function.
    let start = null;
    // Declare end for use by the surrounding module or function.
    let end = null;
    // Declare label for use by the surrounding module or function.
    let label = "tour";

    // Check the condition (req.body.tour) and run the matching branch.
    if (req.body.tour) {
      // Declare tour for use by the surrounding module or function.
      const tour = await Tour.findOne(mergeTenantFilter({ _id: req.body.tour }))
        .select("startDate endDate date durationDays durationDetails duration")
        .lean();
      // Check the condition (!tour) and run the matching branch.
      if (!tour) return res.status(404).json({ success: false, message: "Tour not found." });

      // Perform the side effect or state update expressed on the following line.
      start = startOfDay(tour.startDate || tour.date);
      // Declare days for use by the surrounding module or function.
      const days = getDurationDays(tour.durationDays, tour.durationDetails?.days, tour.duration);
      // Check the condition (start) and run the matching branch.
      if (start) {
        // Duration is authoritative: a stale endDate must not make a one-day
        // tour bookable on the following calendar day.
        // Perform the side effect or state update expressed on the following line.
        end = new Date(start);
        // Perform the side effect or state update expressed on the following line.
        end.setDate(end.getDate() + days - 1);
      }
    } else if (req.body.customTourRequest) {
      // Declare request for use by the surrounding module or function.
      const request = await CustomTourRequest.findOne(mergeTenantFilter({ _id: req.body.customTourRequest, customer: req.user._id }))
        .select("startDate durationDays duration")
        .lean();
      // Check the condition (!request) and run the matching branch.
      if (!request) return res.status(404).json({ success: false, message: "Custom tour request not found." });
      // Check the condition (!request.startDate) and run the matching branch.
      if (!request.startDate) return res.status(400).json({ success: false, message: "The custom tour does not have a start date." });

      // Perform the side effect or state update expressed on the following line.
      label = "custom tour";
      // Perform the side effect or state update expressed on the following line.
      start = startOfDay(request.startDate);
      // Declare days for use by the surrounding module or function.
      const days = getDurationDays(request.durationDays, request.duration);
      // Perform the side effect or state update expressed on the following line.
      end = new Date(start);
      // Perform the side effect or state update expressed on the following line.
      end.setDate(end.getDate() + days - 1);
    } else {
      // Return the result of next() to the caller.
      return next();
    }

    // Declare target for use by the surrounding module or function.
    const target = startOfDay(req.body.travelDate);
    // Check the condition (!target || !start || !end) and run the matching branch.
    if (!target || !start || !end) return res.status(400).json({ success: false, message: `This ${label} does not have a valid travel-date range configured.` });

    // Check the condition (target < start || target > end) and run the matching branch.
    if (target < start || target > end) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: `Travel date must be between ${start.toLocaleDateString("en-KE")} and ${end.toLocaleDateString("en-KE")} for this ${label}.`,
      });
    }

    // Check the condition (req.body.pickupTime) and run the matching branch.
    if (req.body.pickupTime) {
      // Declare pickup for use by the surrounding module or function.
      const pickup = new Date(req.body.pickupTime);
      // Declare pickupDay for use by the surrounding module or function.
      const pickupDay = startOfDay(pickup);
      // Check the condition (!pickupDay) and run the matching branch.
      if (!pickupDay) return res.status(400).json({ success: false, message: "A valid pickup date and time is required." });
      // Check the condition (pickupDay < start || pickupDay > end) and run the matching branch.
      if (pickupDay < start || pickupDay > end) {
        // Return the result of res.status(400).json() to the caller.
        return res.status(400).json({
          success: false,
          message: `Pickup date must be between ${start.toLocaleDateString("en-KE")} and ${end.toLocaleDateString("en-KE")} for this ${label}.`,
        });
      }
      // Check the condition (pickupDay.getTime() !== target.getTime()) and run the matching branch.
      if (pickupDay.getTime() !== target.getTime()) {
        // Return the result of res.status(400).json() to the caller.
        return res.status(400).json({ success: false, message: "Pickup date must match the selected travel date." });
      }
    }

    // Perform the side effect or state update expressed on the following line.
    next();
  } catch (error) { next(error); }
};
