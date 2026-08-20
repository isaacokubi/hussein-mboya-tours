import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";
import CustomTourRequest from "../models/CustomTourRequest.js";

const startOfDay = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

const getAllowedRange = async (booking) => {
  if (booking.tour) {
    const tour = await Tour.findById(booking.tour).select("startDate endDate date durationDetails duration").lean();
    if (!tour) return null;
    const start = startOfDay(tour.startDate || tour.date);
    let end = startOfDay(tour.endDate || tour.startDate || tour.date);
    if (start && !tour.endDate) {
      const days = Math.max(1, Number(tour.durationDetails?.days || tour.duration || 1));
      end = new Date(start);
      end.setDate(end.getDate() + days - 1);
    }
    return { start, end };
  }

  if (booking.customTourRequest) {
    const request = await CustomTourRequest.findById(booking.customTourRequest)
      .select("startDate durationDays")
      .lean();
    if (!request?.startDate) return null;
    const start = startOfDay(request.startDate);
    const days = Math.max(1, Number(request.durationDays || 1));
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
