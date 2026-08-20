import Tour from "../models/Tour.js";
import CustomTourRequest from "../models/CustomTourRequest.js";

const startOfDay = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

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
      end = startOfDay(tour.endDate || tour.startDate || tour.date);
      if (start && !tour.endDate) {
        const days = Math.max(1, Number(tour.durationDetails?.days || tour.duration || 1));
        end = new Date(start);
        end.setDate(end.getDate() + days - 1);
      }
    } else if (req.body.customTourRequest) {
      const request = await CustomTourRequest.findOne({ _id: req.body.customTourRequest, customer: req.user._id })
        .select("startDate durationDays")
        .lean();
      if (!request) return res.status(404).json({ success: false, message: "Custom tour request not found." });
      if (!request.startDate) return res.status(400).json({ success: false, message: "The custom tour does not have a start date." });

      label = "custom tour";
      start = startOfDay(request.startDate);
      const days = Math.max(1, Number(request.durationDays || 1));
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
