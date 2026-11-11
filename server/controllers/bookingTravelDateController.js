/**
 * Purpose: booking Travel Date Controller HTTP controller. Main declarations: startOfDay, parseDurationDays, getDurationDays, getAllowedRange, updateBookingTravelDate.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
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
const getDurationDays = (...values) => Math.max(1, ...values.map((value) => parseDurationDays(value, 1)));

// Declare getAllowedRange for use by the surrounding module or function.
const getAllowedRange = async (booking) => {
  // Check the condition (booking.tour) and run the matching branch.
  if (booking.tour) {
    // Declare tour for use by the surrounding module or function.
    const tour = await Tour.findOne(
      mergeTenantFilter({ _id: booking.tour })
    ).select("startDate endDate date durationDetails duration").lean();
    // Check the condition (!tour) and run the matching branch.
    if (!tour) return null;
    // Declare start for use by the surrounding module or function.
    const start = startOfDay(tour.startDate || tour.date);
    // Declare storedEnd for use by the surrounding module or function.
    const storedEnd = startOfDay(tour.endDate);
    // Declare days for use by the surrounding module or function.
    const days = getDurationDays(tour.durationDetails?.days, tour.duration);
    // Check the condition (!start) and run the matching branch.
    if (!start) return null;
    // Declare calculatedEnd for use by the surrounding module or function.
    const calculatedEnd = new Date(start);
    // Perform the side effect or state update expressed on the following line.
    calculatedEnd.setDate(calculatedEnd.getDate() + days - 1);
    // Declare end for use by the surrounding module or function.
    const end = storedEnd && storedEnd > calculatedEnd ? storedEnd : calculatedEnd;
    // Return the object assembled below to the caller.
    return { start, end };
  }

  // Check the condition (booking.customTourRequest) and run the matching branch.
  if (booking.customTourRequest) {
    // Declare request for use by the surrounding module or function.
    const request = await CustomTourRequest.findOne(
      mergeTenantFilter({ _id: booking.customTourRequest })
    )
      .select("startDate durationDays duration")
      .lean();
    // Check the condition (!request?.startDate) and run the matching branch.
    if (!request?.startDate) return null;
    // Declare start for use by the surrounding module or function.
    const start = startOfDay(request.startDate);
    // Declare days for use by the surrounding module or function.
    const days = getDurationDays(request.durationDays, request.duration);
    // Declare end for use by the surrounding module or function.
    const end = new Date(start);
    // Perform the side effect or state update expressed on the following line.
    end.setDate(end.getDate() + days - 1);
    // Return the object assembled below to the caller.
    return { start, end };
  }

  // Return the expression shown below to the caller.
  return null;
};

// Declare updateBookingTravelDate for use by the surrounding module or function.
export const updateBookingTravelDate = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare booking for use by the surrounding module or function.
    const booking = await Booking.findOne(
      mergeTenantFilter({
        _id: req.params.id,
        user: req.user._id,
      })
    );
    // Check the condition (!booking) and run the matching branch.
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });
    // Check the condition (["cancelled", "completed", "refunded"].includes(booking.status)) and run the matching branch.
    if (["cancelled", "completed", "refunded"].includes(booking.status)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "This booking cannot be changed." });
    }

    // Declare target for use by the surrounding module or function.
    const target = startOfDay(req.body?.travelDate);
    // Check the condition (!target) and run the matching branch.
    if (!target) return res.status(400).json({ success: false, message: "A valid travel date is required." });

    // Declare range for use by the surrounding module or function.
    const range = await getAllowedRange(booking);
    // Check the condition (!range?.start || !range?.end) and run the matching branch.
    if (!range?.start || !range?.end) {
      // Return the result of res.status(409).json() to the caller.
      return res.status(409).json({ success: false, message: "This booking has no configured travel-date range." });
    }

    // Check the condition (target < range.start || target > range.end) and run the matching branch.
    if (target < range.start || target > range.end) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: `Travel date must be between ${range.start.toLocaleDateString("en-KE")} and ${range.end.toLocaleDateString("en-KE")} for this tour.`,
      });
    }

    // Perform the side effect or state update expressed on the following line.
    booking.travelDate = target;
    // Check the condition (booking.pickupTime) and run the matching branch.
    if (booking.pickupTime) {
      // Declare pickup for use by the surrounding module or function.
      const pickup = new Date(booking.pickupTime);
      // Check the condition (!Number.isNaN(pickup.getTime())) and run the matching branch.
      if (!Number.isNaN(pickup.getTime())) {
        // Declare updatedPickup for use by the surrounding module or function.
        const updatedPickup = new Date(target);
        // Perform the side effect or state update expressed on the following line.
        updatedPickup.setHours(pickup.getHours(), pickup.getMinutes(), pickup.getSeconds(), pickup.getMilliseconds());
        // Perform the side effect or state update expressed on the following line.
        booking.pickupTime = updatedPickup;
      }
    }
    // Perform the side effect or state update expressed on the following line.
    await booking.save();
    // Return the result of res.json() to the caller.
    return res.json({ success: true, message: "Travel date updated successfully.", booking });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};
