export const validateRescheduleRequest = (req, res, next) => {
  const reason =
    typeof req.body?.reason === "string"
      ? req.body.reason.trim()
      : "";

  if (!reason) {
    return res.status(400).json({
      success: false,
      message: "A reason is required before postponing a booking.",
    });
  }

  if (reason.length < 5) {
    return res.status(400).json({
      success: false,
      message: "Please provide a meaningful reason for postponing the booking.",
    });
  }

  if (reason.length > 500) {
    return res.status(400).json({
      success: false,
      message: "The postponement reason must not exceed 500 characters.",
    });
  }

  req.body.reason = reason;
  next();
};
