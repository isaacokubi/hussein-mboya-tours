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

export const validateBookingTravelDate = async (req, res, next) => {
  try {
    if (!req.body?.travelDate) return next();

    let start = null;
    let end = null;
    let label = "tour";

    if (req.body.tour) {
      const tour = await Tour.findById(req.body.tour)
        .select("startDate endDate date durationDetails duration")
        .lean();
      if (!tour) return res.status(404).json({ success: false, message: "Tour not found." });

      start = startOfDay(tour.startDate || tour.date);
      const storedEnd = startOfDay(tour.endDate);
      const days = getDurationDays(tour.durationDetails?.days, tour.duration);

      if (start) {
        const calculatedEnd = new Date(start);
        calculatedEnd.setDate(calculatedEnd.getDate() + days - 1);
        end = storedEnd && storedEnd > calculatedEnd ? storedEnd : calculatedEnd;
      }
    } else if (req.body.customTourRequest) {
      const request = await CustomTourRequest.findOne({ _id: req.body.customTourRequest, customer: req.user._id })
        .select("startDate durationDays duration")
        .lean();
      if (!request) return res.status(404).json({ success: false, message: "Custom tour request not found." });
      if (!request.startDate) return res.status(400).json({ success: false, message: "The custom tour does not have a start date." });

      label = "custom tour";
      start = startOfDay(request.startDate);
      const days = getDurationDays(request.durationDays, request.duration);
      end = new Date(start);
      end.setDate(end.getDate() + days - 1);
    } else {
      return next();
    }

    const target = startOfDay(req.body.travelDate);
    if (!target || !start || !end) {
      return res.status(400).json({ success: false, message: `This ${label} does not have a valid travel-date range configured.` });
    }

    if (target < start || target > end) {
      return res.status(400).json({
        success: false,
        message: `Travel date must be between ${start.toLocaleDateString("en-KE")} and ${end.toLocaleDateString("en-KE")} for this ${label}.`,
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};
