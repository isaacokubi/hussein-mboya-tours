// Shared date-range helpers for tour and custom-tour booking.
export const toDateInputValue = (value) => {
  if (!value) return "";
  const raw = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

// Accept numeric values as well as strings such as "4 days", "4-day", or "4".
export const parseDurationDays = (value, fallback = 1) => {
  const match = String(value ?? "").match(/\d+(?:\.\d+)?/);
  const days = match ? Number(match[0]) : Number(fallback);
  return Number.isFinite(days) && days >= 1 ? Math.max(1, Math.round(days)) : 1;
};

export const getTourDateRange = (tour) => {
  if (!tour) return { min: "", max: "" };
  const min = toDateInputValue(tour.startDate || tour.date || tour.travelDate || tour.departureDate);
  if (!min) return { min: "", max: "" };

  // A multi-day tour must expose every day of its duration. If an old/stale
  // endDate equals the start date, duration is authoritative for the range.
  const durationDays = parseDurationDays(tour.durationDetails?.days ?? tour.duration, 1);
  let max = toDateInputValue(tour.endDate);
  const end = new Date(`${min}T00:00:00`);
  if (!Number.isNaN(end.getTime())) {
    end.setDate(end.getDate() + durationDays - 1);
    const durationEnd = toDateInputValue(end);
    if (!max || max < durationEnd) max = durationEnd;
  }

  return { min, max: max || min };
};

export const getCustomTourDateRange = (request) => {
  if (!request?.startDate) return { min: "", max: "" };
  const min = toDateInputValue(request.startDate);
  const durationDays = parseDurationDays(request.durationDays ?? request.duration, 1);
  const end = new Date(`${min}T00:00:00`);
  if (Number.isNaN(end.getTime())) return { min: "", max: "" };
  end.setDate(end.getDate() + durationDays - 1);
  return { min, max: toDateInputValue(end) };
};

export const isDateWithinRange = (value, min, max) => {
  if (!value || !min || !max) return false;
  return value >= min && value <= max;
};
