/**
 * Purpose: validate Future Tour Date request middleware. Main declarations: startOfToday, validateFutureTourDate.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
const startOfToday = () => {
  // Declare today for use by the surrounding module or function.
  const today = new Date();
  // Perform the side effect or state update expressed on the following line.
  today.setHours(0, 0, 0, 0);
  // Return the value of today to the caller.
  return today;
};

/**
 * Creation-only guard for scheduled tours. Editing an existing tour is allowed
 * to preserve historical records, but a new tour cannot be created in the past.
 */
// Define validateFutureTourDate; its parameters and body implement this operation.
export default function validateFutureTourDate(req, res, next) {
  // Declare value for use by the surrounding module or function.
  const value = req.body?.startDate || req.body?.date;
  // Check the condition (!value) and run the matching branch.
  if (!value) return next();

  // Declare date for use by the surrounding module or function.
  const date = new Date(value);
  // Check the condition (Number.isNaN(date.getTime())) and run the matching branch.
  if (Number.isNaN(date.getTime())) {
    // Return the result of res.status(400).json() to the caller.
    return res.status(400).json({ success: false, message: "A valid tour date is required." });
  }

  // Check the condition (date < startOfToday()) and run the matching branch.
  if (date < startOfToday()) {
    // Return the result of res.status(400).json() to the caller.
    return res.status(400).json({ success: false, message: "Tour start date cannot be in the past." });
  }

  // Perform the side effect or state update expressed on the following line.
  next();
}
