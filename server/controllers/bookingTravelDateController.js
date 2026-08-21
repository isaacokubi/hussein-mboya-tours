import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";
import CustomTourRequest from "../models/CustomTourRequest.js";

const startOfDay = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

const parseDurationDays = (value, fallback = 1) => {
  const match = String(value ?? "").match(/\d+(?:\.\d+)?/);
  const days = match ? Number(match[0]) : Number(fallback);
  return Number.isFinite(days) && days >= 1 ? Math.max(1, Math.round(days)) : 1;
};

const getDurationDays = (...values) => Math.max(1, ...values.map((value) => parseDurationDays(value, 1)));

const getAllowedRange = async (booking) => {
  if (booking.tour) {
    const tour = await Tour.findById(booking.tour).select("startDate endDate date durationDetails duration").lean();
    if (!tour) return null;
    const start = startOfDay(tour.startDate || tour.date);
    const storedEnd = startOfDay(tour.endDate);
    const days = getDurationDays(tour.durationDetails?.days, tour.duration);
    if (!start) return null;
    const calculatedEnd = new Date(start);
    calculatedEnd.setDate(calculatedEnd.getDate() + days - 1);
    const end = storedEnd && storedEnd > calculatedEnd ? storedEnd : calculatedEnd;
    return { start, end };
  }

  if (booking.customTourRequest) {
    const request = await CustomTourRequest.findById(booking.customTourRequest)
      .select("startDate durationDays duration")
      .lean();
    if (!request?.startDate) return null;
    const start = startOfDay(request.startDate);
    const days = getDurationDays(request.durationDays, request.duration);
    const end = new Date(start);
    end.setDate(end.getDate() + days - 1);
    return { start, end };
  }

  return null;
};

export const updateBookingTravelDate = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });
    if (["cancelled", "completed", "refunded"].includes(booking.status)) {
      return res.status(400).json({ success: false, message: "This booking cannot be changed." });
    }

    const target = startOfDay(req.body?.travelDate);
    if (!target) return res.status(400).json({ success: false, message: "A valid travel date is required." });

    const range = await getAllowedRange(booking);
    if (!range?.start || !range?.end) {
      return res.status(409).json({ success: false, message: "This booking has no configured travel-date range." });
    }

    if (target < range.start || target > range.end) {
      return res.status(400).json({
        success: false,
        message: `Travel date must be between ${range.start.toLocaleDateString("en-KE")} and ${range.end.toLocaleDateString("en-KE")} for this tour.`,
      });
    }

    booking.travelDate = target;
    await booking.save();
    return res.json({ success: true, message: "Travel date updated successfully.", booking });
  } catch (error) {
    next(error);
  }
};
