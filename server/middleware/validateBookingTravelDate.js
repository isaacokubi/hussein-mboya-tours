import Tour from "../models/Tour.js";

const startOfDay = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

export const validateBookingTravelDate = async (req, res, next) => {
  try {
    if (!req.body?.tour || !req.body?.travelDate) return next();

    const tour = await Tour.findById(req.body.tour)
      .select("startDate endDate date durationDetails duration")
      .lean();
    if (!tour) return res.status(404).json({ success: false, message: "Tour not found." });

    const target = startOfDay(req.body.travelDate);
    const start = startOfDay(tour.startDate || tour.date);
    let end = startOfDay(tour.endDate || tour.startDate || tour.date);

    if (start && !tour.endDate) {
      const days = Math.max(1, Number(tour.durationDetails?.days || tour.duration || 1));
      end = new Date(start);
      end.setDate(end.getDate() + days - 1);
    }

    if (!target || !start || !end) {
      return res.status(400).json({ success: false, message: "This tour does not have a valid travel-date range configured." });
    }

    if (target < start || target > end) {
      return res.status(400).json({
        success: false,
        message: `Travel date must be between ${start.toLocaleDateString("en-KE")} and ${end.toLocaleDateString("en-KE")} for this tour.`,
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};
