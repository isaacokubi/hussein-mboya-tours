const startOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

/**
 * Creation-only guard for scheduled tours. Editing an existing tour is allowed
 * to preserve historical records, but a new tour cannot be created in the past.
 */
export default function validateFutureTourDate(req, res, next) {
  const value = req.body?.startDate || req.body?.date;
  if (!value) return next();

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return res.status(400).json({ success: false, message: "A valid tour date is required." });
  }

  if (date < startOfToday()) {
    return res.status(400).json({ success: false, message: "Tour start date cannot be in the past." });
  }

  next();
}
