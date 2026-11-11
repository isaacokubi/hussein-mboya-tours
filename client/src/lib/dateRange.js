/**
 * Purpose: date Range client application module. Main declarations: toDateInputValue, parseDurationDays, getDurationDays, getTourDateRange, getCustomTourDateRange.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// Shared date-range helpers for tour and custom-tour booking.
// Declare toDateInputValue for use by the surrounding module or function.
export const toDateInputValue = (value) => {
  // Check the condition (!value) and run the matching branch.
  if (!value) return "";
  // Declare raw for use by the surrounding module or function.
  const raw = String(value).trim();
  // Check the condition (/^\d{4}-\d{2}-\d{2}$/.test(raw)) and run the matching branch.
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  // Declare date for use by the surrounding module or function.
  const date = new Date(value);
  // Check the condition (Number.isNaN(date.getTime())) and run the matching branch.
  if (Number.isNaN(date.getTime())) return "";
  // Return the expression shown below to the caller.
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

// Declare parseDurationDays for use by the surrounding module or function.
export const parseDurationDays = (value, fallback = 1) => {
  // Declare match for use by the surrounding module or function.
  const match = String(value ?? "").match(/\d+(?:\.\d+)?/);
  // Declare days for use by the surrounding module or function.
  const days = match ? Number(match[0]) : Number(fallback);
  // Return the expression shown below to the caller.
  return Number.isFinite(days) && days >= 1 ? Math.max(1, Math.round(days)) : 1;
};

// Declare getDurationDays for use by the surrounding module or function.
const getDurationDays = (...values) => { for (const value of values) { if (value !== undefined && value !== null && String(value).trim() !== "") return parseDurationDays(value, 1); } return 1; };

// Declare getTourDateRange for use by the surrounding module or function.
export const getTourDateRange = (tour) => {
  // Check the condition (!tour) and run the matching branch.
  if (!tour) return { min: "", max: "" };
  // Declare min for use by the surrounding module or function.
  const min = toDateInputValue(tour.startDate || tour.date || tour.travelDate || tour.departureDate);
  // Check the condition (!min) and run the matching branch.
  if (!min) return { min: "", max: "" };

  // Declare durationDays for use by the surrounding module or function.
  const durationDays = getDurationDays(tour.durationDays, tour.durationDetails?.days, tour.duration);
  // A single-day tour must never inherit a stale endDate from an earlier
  // schedule. Native date pickers differ across mobile/desktop, so the same
  // canonical ISO date range is also enforced again by the API.
  // Declare end for use by the surrounding module or function.
  const end = new Date(`${min}T00:00:00Z`);
  // Check the condition (Number.isNaN(end.getTime())) and run the matching branch.
  if (Number.isNaN(end.getTime())) return { min, max: min };
  // Perform the side effect or state update expressed on the following line.
  end.setUTCDate(end.getUTCDate() + durationDays - 1);
  // Declare durationEnd for use by the surrounding module or function.
  const durationEnd = toDateInputValue(end);
  // Declare storedEnd for use by the surrounding module or function.
  const storedEnd = toDateInputValue(tour.endDate);
  // Declare max for use by the surrounding module or function.
  const max = durationDays > 1 && storedEnd >= min && storedEnd < durationEnd ? storedEnd : durationEnd;
  // Return the object assembled below to the caller.
  return { min, max };
};

// Declare getCustomTourDateRange for use by the surrounding module or function.
export const getCustomTourDateRange = (request) => {
  // Check the condition (!request?.startDate) and run the matching branch.
  if (!request?.startDate) return { min: "", max: "" };
  // Declare min for use by the surrounding module or function.
  const min = toDateInputValue(request.startDate);
  // Check the condition (!min) and run the matching branch.
  if (!min) return { min: "", max: "" };
  // Declare durationDays for use by the surrounding module or function.
  const durationDays = getDurationDays(request.durationDays, request.duration);
  // Declare end for use by the surrounding module or function.
  const end = new Date(`${min}T00:00:00`);
  // Check the condition (Number.isNaN(end.getTime())) and run the matching branch.
  if (Number.isNaN(end.getTime())) return { min: "", max: "" };
  // Perform the side effect or state update expressed on the following line.
  end.setDate(end.getDate() + durationDays - 1);
  // Return the object assembled below to the caller.
  return { min, max: toDateInputValue(end) };
};

// Declare isDateWithinRange for use by the surrounding module or function.
export const isDateWithinRange = (value, min, max) => {
  // Check the condition (!value || !min || !max) and run the matching branch.
  if (!value || !min || !max) return false;
  // Return the expression shown below to the caller.
  return value >= min && value <= max;
};
