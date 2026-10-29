// Shared date-range helpers for tour and custom-tour booking.
export const toDateInputValue = (value) => {
  if (!value) return "";
  const raw = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export const parseDurationDays = (value, fallback = 1) => {
  const match = String(value ?? "").match(/\d+(?:\.\d+)?/);
  const days = match ? Number(match[0]) : Number(fallback);
  return Number.isFinite(days) && days >= 1 ? Math.max(1, Math.round(days)) : 1;
};

const getDurationDays = (...values) => Math.max(1, ...values.map((value) => parseDurationDays(value, 1)));

export const getTourDateRange = (tour) => {
  if (!tour) return { min: "", max: "" };
  const min = toDateInputValue(tour.startDate || tour.date || tour.travelDate || tour.departureDate);
  if (!min) return { min: "", max: "" };

  const durationDays = getDurationDays(tour.durationDays, tour.durationDetails?.days, tour.duration);
  // A single-day tour must never inherit a stale endDate from an earlier
  // schedule. Native date pickers differ across mobile/desktop, so the same
  // canonical ISO date range is also enforced again by the API.
  const end = new Date(`${min}T00:00:00Z`);
  if (Number.isNaN(end.getTime())) return { min, max: min };
  end.setUTCDate(end.getUTCDate() + durationDays - 1);
  const durationEnd = toDateInputValue(end);
  const storedEnd = toDateInputValue(tour.endDate);
  const max = durationDays > 1 && storedEnd >= min && storedEnd < durationEnd ? storedEnd : durationEnd;
  return { min, max };
};

export const getCustomTourDateRange = (request) => {
  if (!request?.startDate) return { min: "", max: "" };
  const min = toDateInputValue(request.startDate);
  if (!min) return { min: "", max: "" };
  const durationDays = getDurationDays(request.durationDays, request.duration);
  const end = new Date(`${min}T00:00:00`);
  if (Number.isNaN(end.getTime())) return { min: "", max: "" };
  end.setDate(end.getDate() + durationDays - 1);
  return { min, max: toDateInputValue(end) };
};

export const isDateWithinRange = (value, min, max) => {
  if (!value || !min || !max) return false;
  return value >= min && value <= max;
};
