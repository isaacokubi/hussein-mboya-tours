/**
 * Purpose: inventory Service business-logic service. Main declarations: normalizeDate, calendarDateKey, syncDerivedAvailability, sameDay, tourDateWindow.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";

// Declare normalizeDate for use by the surrounding module or function.
const normalizeDate = (value) => {
  // Declare d for use by the surrounding module or function.
  const d = new Date(value);
  // Check the condition (Number.isNaN(d.getTime())) and run the matching branch.
  if (Number.isNaN(d.getTime())) return null;
  // Perform the side effect or state update expressed on the following line.
  d.setHours(0, 0, 0, 0);
  // Return the value of d to the caller.
  return d;
};

// Compare calendar dates without allowing Date timezone offsets to move a
// selected YYYY-MM-DD onto the previous/next day.
// Declare calendarDateKey for use by the surrounding module or function.
const calendarDateKey = (value) => {
  // Check the condition (value instanceof Date && !Number.isNaN(value.getTime())) and run the matching branch.
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    // Return the result of [       value.getUTCFullYear(),       String(value.getUTCMonth() + 1).padStart(2, "0"),       String(value.getUTCDate()).padStart(2, "0"),     ].join() to the caller.
    return [
      value.getUTCFullYear(),
      String(value.getUTCMonth() + 1).padStart(2, "0"),
      String(value.getUTCDate()).padStart(2, "0"),
    ].join("-");
  }
  // Declare raw for use by the surrounding module or function.
  const raw = String(value ?? "").trim();
  // Declare match for use by the surrounding module or function.
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  // Check the condition (match) and run the matching branch.
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  // Declare d for use by the surrounding module or function.
  const d = new Date(value);
  // Check the condition (Number.isNaN(d.getTime())) and run the matching branch.
  if (Number.isNaN(d.getTime())) return "";
  // Return the result of [     d.getUTCFullYear(),     String(d.getUTCMonth() + 1).padStart(2, "0"),     String(d.getUTCDate()).padStart(2, "0"),   ].join() to the caller.
  return [
    d.getUTCFullYear(),
    String(d.getUTCMonth() + 1).padStart(2, "0"),
    String(d.getUTCDate()).padStart(2, "0"),
  ].join("-");
};

// Declare syncDerivedAvailability for use by the surrounding module or function.
const syncDerivedAvailability = async (tour, session = null) => {
  // Declare entries for use by the surrounding module or function.
  const entries = Array.isArray(tour.availability) ? tour.availability : [];
  // Declare total for use by the surrounding module or function.
  const total = entries.length ? entries.reduce((sum, item) => sum + Number(item.totalSlots || 0), 0) : Number(tour.availabilitySettings?.totalSlots ?? tour.capacity ?? 0);
  // Declare booked for use by the surrounding module or function.
  const booked = entries.length ? entries.reduce((sum, item) => sum + Number(item.bookedSlots || 0), 0) : Number(tour.availabilitySettings?.bookedSlots || 0);
  // Declare hasSpace for use by the surrounding module or function.
  const hasSpace = entries.length ? entries.some((item) => Number(item.bookedSlots || 0) < Number(item.totalSlots || 0)) : booked < total;
  // Perform the side effect or state update expressed on the following line.
  tour.available = hasSpace;
  // Check the condition (!hasSpace && total > 0 && !["completed","cancelled"].includes(tour.sta) and run the matching branch.
  if (!hasSpace && total > 0 && !["completed","cancelled"].includes(tour.status)) tour.status = "fully-booked";
  else if (hasSpace && tour.status === "fully-booked") tour.status = "upcoming";
  // Perform the side effect or state update expressed on the following line.
  await tour.save({ session });
  // Return the value of tour to the caller.
  return tour;
};

// Declare sameDay for use by the surrounding module or function.
const sameDay = (a, b) => Boolean(calendarDateKey(a) && calendarDateKey(a) === calendarDateKey(b));

// Declare tourDateWindow for use by the surrounding module or function.
const tourDateWindow = (tour) => {
  // Declare start for use by the surrounding module or function.
  const start = calendarDateKey(tour?.startDate || tour?.date);
  // Check the condition (!start) and run the matching branch.
  if (!start) return null;
  // Declare storedEnd for use by the surrounding module or function.
  const storedEnd = calendarDateKey(tour?.endDate);
  // Declare days for use by the surrounding module or function.
  const days = Math.max(Number(tour?.durationDays || tour?.durationDetails?.days || tour?.duration || 1), 1);
  // Declare date for use by the surrounding module or function.
  const date = new Date(`${start}T00:00:00Z`);
  // Perform the side effect or state update expressed on the following line.
  date.setUTCDate(date.getUTCDate() + days - 1);
  // Declare calculatedEnd for use by the surrounding module or function.
  const calculatedEnd = calendarDateKey(date);
  // A stale endDate must never shorten the configured duration window.
  // Declare end for use by the surrounding module or function.
  const end = storedEnd && storedEnd >= start && storedEnd >= calculatedEnd
    ? storedEnd
    : calculatedEnd;
  // Return the object assembled below to the caller.
  return { start, end };
};

// Declare isWithinTourWindow for use by the surrounding module or function.
const isWithinTourWindow = (tour, travelDate) => {
  // Declare target for use by the surrounding module or function.
  const target = calendarDateKey(travelDate);
  // Declare window for use by the surrounding module or function.
  const window = tourDateWindow(tour);
  // Return the result of Boolean() to the caller.
  return Boolean(target && window && target >= window.start && target <= window.end);
};

// Declare getDateAvailability for use by the surrounding module or function.
const getDateAvailability = (tour, travelDate) => {
  // Declare target for use by the surrounding module or function.
  const target = normalizeDate(travelDate);
  // Check the condition (!target) and run the matching branch.
  if (!target) throw new Error("A valid travel date is required.");
  // Declare entries for use by the surrounding module or function.
  const entries = Array.isArray(tour.availability) ? tour.availability : [];
  // Check the condition (entries.length === 0) and run the matching branch.
  if (entries.length === 0) return null;
  // Declare entry for use by the surrounding module or function.
  const entry = entries.find((item) => sameDay(item.date, travelDate));
  // Check the condition (entry) and run the matching branch.
  if (entry) return entry;
  // Check the condition (isWithinTourWindow(tour, travelDate)) and run the matching branch.
  if (isWithinTourWindow(tour, travelDate)) return null;
  // Stop the current operation by raising a new Error instance.
  throw new Error("The selected travel date is not offered for this tour.");
};

// Declare validateTourCapacity for use by the surrounding module or function.
export const validateTourCapacity = async (tourId, requestedGuests, travelDate) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Check the condition (!Number.isInteger(requestedGuests) || requestedGuests <= 0) and run the matching branch.
  if (!Number.isInteger(requestedGuests) || requestedGuests <= 0) throw new Error("Invalid traveler count.");
  // Declare tour for use by the surrounding module or function.
  const tour = await Tour.findOne(mergeTenantFilter({ _id: tourId })).lean();
  // Check the condition (!tour) and run the matching branch.
  if (!tour) throw new Error("Tour not found.");

  // Declare dated for use by the surrounding module or function.
  const dated = getDateAvailability(tour, travelDate);
  // Check the condition (dated) and run the matching branch.
  if (dated) return requestedGuests <= Math.max(Number(dated.totalSlots || 0) - Number(dated.bookedSlots || 0), 0);

  // Declare totalSlots for use by the surrounding module or function.
  const totalSlots = Number(tour.availabilitySettings?.totalSlots ?? tour.capacity ?? 0);
  // Declare bookedSlots for use by the surrounding module or function.
  const bookedSlots = Number(tour.availabilitySettings?.bookedSlots ?? 0);
  // Return the expression shown below to the caller.
  return requestedGuests <= Math.max(totalSlots - bookedSlots, 0);
};

// Declare reserveSlots for use by the surrounding module or function.
export const reserveSlots = async (tourId, travelers, travelDate, session = null) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Check the condition (!Number.isInteger(travelers) || travelers <= 0) and run the matching branch.
  if (!Number.isInteger(travelers) || travelers <= 0) throw new Error("Invalid traveler count.");
  // Declare target for use by the surrounding module or function.
  const target = normalizeDate(travelDate);
  // Declare current for use by the surrounding module or function.
  const current = await Tour.findOne(mergeTenantFilter({ _id: tourId })).session(session).lean();
  // Check the condition (!current) and run the matching branch.
  if (!current) throw new Error("Tour not found.");

  // Check the condition (Array.isArray(current.availability) && current.availability.length) and run the matching branch.
  if (Array.isArray(current.availability) && current.availability.length) {
    // Check the condition (!target) and run the matching branch.
    if (!target) throw new Error("A valid travel date is required.");
    // Declare index for use by the surrounding module or function.
    const index = current.availability.findIndex((item) => sameDay(item.date, travelDate));
    // Check the condition (index < 0) and run the matching branch.
    if (index < 0) {
      // Check the condition (!isWithinTourWindow(current, travelDate)) and run the matching branch.
      if (!isWithinTourWindow(current, travelDate)) {
        // Stop the current operation by raising a new Error instance.
        throw new Error("The selected travel date is not offered for this tour.");
      }
    } else {
      // Declare entry for use by the surrounding module or function.
      const entry = current.availability[index];
      // Declare totalSlots for use by the surrounding module or function.
      const totalSlots = Number(entry.totalSlots || 0);
      // Declare bookedSlots for use by the surrounding module or function.
      const bookedSlots = Number(entry.bookedSlots || 0);
      // Check the condition (bookedSlots + travelers > totalSlots) and run the matching branch.
      if (bookedSlots + travelers > totalSlots) throw new Error("Not enough available tour slots for the selected travel date.");
      // Declare tour for use by the surrounding module or function.
      const tour = await Tour.findOneAndUpdate(
        mergeTenantFilter({
          _id: tourId,
          [`availability.${index}.bookedSlots`]: { $lte: totalSlots - travelers }
        }),
        { $inc: { [`availability.${index}.bookedSlots`]: travelers } },
        { new: true, session }
      );
      // Check the condition (!tour) and run the matching branch.
      if (!tour) throw new Error("Not enough available tour slots for the selected travel date.");
      // Return the result of syncDerivedAvailability() to the caller.
      return syncDerivedAvailability(tour, session);
    }
  }

  // Declare tour for use by the surrounding module or function.
  const tour = await Tour.findOneAndUpdate(
    mergeTenantFilter({
      _id: tourId,
      $expr: { $lte: [{ $add: [{ $ifNull: ["$availabilitySettings.bookedSlots", 0] }, travelers] }, { $ifNull: ["$availabilitySettings.totalSlots", "$capacity"] }] }
    }),
    { $inc: { "availabilitySettings.bookedSlots": travelers } },
    { new: true, session }
  );
  // Check the condition (!tour) and run the matching branch.
  if (!tour) throw new Error("Not enough available tour slots.");
  // Return the result of syncDerivedAvailability() to the caller.
  return syncDerivedAvailability(tour, session);
};

// Declare releaseSlots for use by the surrounding module or function.
export const releaseSlots = async (tourId, travelers, travelDate, session = null) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Check the condition (!Number.isInteger(travelers) || travelers <= 0) and run the matching branch.
  if (!Number.isInteger(travelers) || travelers <= 0) throw new Error("Invalid traveler count.");
  // Declare target for use by the surrounding module or function.
  const target = normalizeDate(travelDate);
  // Declare current for use by the surrounding module or function.
  const current = await Tour.findOne(mergeTenantFilter({ _id: tourId })).session(session).lean();
  // Check the condition (!current) and run the matching branch.
  if (!current) throw new Error("Tour not found.");

  // Check the condition (Array.isArray(current.availability) && current.availability.length) and run the matching branch.
  if (Array.isArray(current.availability) && current.availability.length) {
    // Check the condition (!target) and run the matching branch.
    if (!target) throw new Error("A valid travel date is required.");
    // Declare start for use by the surrounding module or function.
    const start = new Date(target); const end = new Date(target); end.setDate(end.getDate() + 1);
    // Declare tour for use by the surrounding module or function.
    const tour = await Tour.findOneAndUpdate(
      mergeTenantFilter({ _id: tourId, availability: { $elemMatch: { date: { $gte: start, $lt: end } } } }),
      { $inc: { "availability.$[day].bookedSlots": -travelers } },
      { arrayFilters: [{ "day.date": { $gte: start, $lt: end } }], new: true, session }
    );
    // Check the condition (!tour) and run the matching branch.
    if (!tour) throw new Error("Tour travel date not found.");
    // Declare item for use by the surrounding module or function.
    const item = tour.availability.find((entry) => sameDay(entry.date, target));
    // Check the condition (item && item.bookedSlots < 0) and run the matching branch.
    if (item && item.bookedSlots < 0) item.bookedSlots = 0;
    // Return the result of syncDerivedAvailability() to the caller.
    return syncDerivedAvailability(tour, session);
  }

  // Declare tour for use by the surrounding module or function.
  const tour = await Tour.findOneAndUpdate(mergeTenantFilter({ _id: tourId }), { $inc: { "availabilitySettings.bookedSlots": -travelers } }, { new: true, session });
  // Check the condition (!tour) and run the matching branch.
  if (!tour) throw new Error("Tour not found.");
  // Check the condition (tour.availabilitySettings.bookedSlots < 0) and run the matching branch.
  if (tour.availabilitySettings.bookedSlots < 0) tour.availabilitySettings.bookedSlots = 0;
  // Return the result of syncDerivedAvailability() to the caller.
  return syncDerivedAvailability(tour, session);
};

