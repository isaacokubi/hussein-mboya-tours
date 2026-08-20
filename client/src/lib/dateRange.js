// Shared date-range helpers for tour and custom-tour booking.
export const toDateInputValue = (value) => {
  if (!value) return "";
  const raw = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export const getTourDateRange = (tour) => {
  if (!tour) return { min: "", max: "" };
  const min = toDateInputValue(tour.startDate || tour.date || tour.travelDate || tour.departureDate);
  let max = toDateInputValue(tour.endDate);
  if (!max && min) {
    const durationDays = Math.max(1, Number(tour.durationDetails?.days || tour.duration || 1));
    const end = new Date(`${min}T00:00:00`);
    if (!Number.isNaN(end.getTime())) {
      end.setDate(end.getDate() + durationDays - 1);
      max = toDateInputValue(end);
    }
  }
  return { min, max: max || min };
};

export const getCustomTourDateRange = (request) => {
  if (!request?.startDate) return { min: "", max: "" };
  const min = toDateInputValue(request.startDate);
  const durationDays = Math.max(1, Number(request.durationDays || request.duration || 1));
  const end = new Date(`${min}T00:00:00`);
  if (Number.isNaN(end.getTime())) return { min: "", max: "" };
  end.setDate(end.getDate() + durationDays - 1);
  return { min, max: toDateInputValue(end) };
};

export const isDateWithinRange = (value, min, max) => {
  if (!value || !min || !max) return false;
  return value >= min && value <= max;
};
