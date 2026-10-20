/**
 * Inventory and tour-capacity service. Centralizes capacity checks and slot
 * reservation/release so separate booking paths follow the same rules. Review
 * concurrency and idempotency carefully: simultaneous bookings must not exceed
 * available inventory, and a failed/cancelled booking must release only its own
 * reservation.
 */

// Require tenant-scoped query filters for every tour inventory operation.
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Import the tour model whose availability fields hold the inventory counts.
import Tour from "../models/Tour.js";

// Convert an input date into a Date object normalized to the start of its local calendar day.
const normalizeDate = (value) => {
  // Parse strings, dates or other supported date values.
  const d = new Date(value);
  // Return null when JavaScript cannot parse a valid date.
  if (Number.isNaN(d.getTime())) return null;
  // Set time fields to midnight so comparisons use a day rather than a time.
  d.setHours(0, 0, 0, 0);
  // Return the normalized date object.
  return d;
};

// Compare calendar dates without allowing Date timezone offsets to move a
// selected YYYY-MM-DD onto the previous/next day.
const calendarDateKey = (value) => {
  // Handle valid Date instances using UTC components for stable calendar keys.
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    // Return a zero-padded YYYY-MM-DD key for the supplied date.
    return [
      value.getUTCFullYear(), // Four-digit UTC year.
      String(value.getUTCMonth() + 1).padStart(2, "0"), // One-based, two-digit UTC month.
      String(value.getUTCDate()).padStart(2, "0"), // Two-digit UTC day of month.
    ].join("-"); // Join the parts into a sortable calendar-date string.
  }
  // Convert non-Date input to trimmed text, treating nullish values as empty.
  const raw = String(value ?? "").trim();
  // Recognize a date prefix in ISO YYYY-MM-DD form without timezone conversion.
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  // Return the explicit date prefix when the input already contains one.
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  // Fall back to JavaScript date parsing for other supported input formats.
  const d = new Date(value);
  // Return an empty key when the fallback parser cannot identify a valid date.
  if (Number.isNaN(d.getTime())) return "";
  // Convert the parsed date to a zero-padded UTC calendar key.
  return [
    d.getUTCFullYear(), // Four-digit UTC year.
    String(d.getUTCMonth() + 1).padStart(2, "0"), // One-based, two-digit UTC month.
    String(d.getUTCDate()).padStart(2, "0"), // Two-digit UTC day.
  ].join("-"); // Join the parts into a sortable calendar-date string.
};

// Recalculate the tour's derived availability flag/status and persist the result.
const syncDerivedAvailability = async (tour, session = null) => {
  // Use the date-specific inventory list when present; otherwise use aggregate capacity settings.
  const entries = Array.isArray(tour.availability) ? tour.availability : [];
  // Sum date-specific total slots, or fall back to configured total capacity.
  const total = entries.length ? entries.reduce((sum, item) => sum + Number(item.totalSlots || 0), 0) : Number(tour.availabilitySettings?.totalSlots ?? tour.capacity ?? 0);
  // Sum date-specific booked slots, or fall back to aggregate booked slots.
  const booked = entries.length ? entries.reduce((sum, item) => sum + Number(item.bookedSlots || 0), 0) : Number(tour.availabilitySettings?.bookedSlots || 0);
  // Determine whether any date still has capacity, or aggregate inventory has space.
  const hasSpace = entries.length ? entries.some((item) => Number(item.bookedSlots || 0) < Number(item.totalSlots || 0)) : booked < total;
  // Update the derived availability boolean.
  tour.available = hasSpace;
  // Mark a tour fully booked only when capacity exists and no slots remain; preserve terminal states.
  if (!hasSpace && total > 0 && !["completed","cancelled"].includes(tour.status)) tour.status = "fully-booked";
  // Restore the upcoming status when a previously full tour has space again.
  else if (hasSpace && tour.status === "fully-booked") tour.status = "upcoming";
  // Save the changed tour, using the caller's transaction when supplied.
  await tour.save({ session });
  // Return the updated tour to the caller.
  return tour;
};

// Compare two dates by their stable calendar keys.
const sameDay = (a, b) => Boolean(calendarDateKey(a) && calendarDateKey(a) === calendarDateKey(b));

// Determine the inclusive start/end calendar dates offered by a tour.
const tourDateWindow = (tour) => {
  // Prefer startDate, falling back to the legacy date field.
  const start = calendarDateKey(tour?.startDate || tour?.date);
  // A tour without a valid start date has no calculable date window.
  if (!start) return null;
  // Read the configured end date if one is stored.
  const storedEnd = calendarDateKey(tour?.endDate);
  // Determine the configured duration in days, defaulting to one day and enforcing a minimum of one.
  const days = Math.max(Number(tour?.durationDays || tour?.durationDetails?.days || tour?.duration || 1), 1);
  // Construct a UTC-midnight date to calculate the final day without local timezone shifts.
  const date = new Date(`${start}T00:00:00Z`);
  // Add duration minus one because both the start and end dates are included.
  date.setUTCDate(date.getUTCDate() + days - 1);
  // Convert the calculated end date back into the standard calendar key.
  const calculatedEnd = calendarDateKey(date);
  // A stale endDate must never shorten the configured duration window.
  // Use the stored end only when it is valid and does not precede the calculated end.
  const end = storedEnd && storedEnd >= start && storedEnd >= calculatedEnd
    ? storedEnd
    : calculatedEnd;
  // Return the inclusive window as comparable ISO date strings.
  return { start, end };
};

// Check whether a selected travel date falls within the tour's inclusive date window.
const isWithinTourWindow = (tour, travelDate) => {
  // Normalize the requested date to the stable comparison key.
  const target = calendarDateKey(travelDate);
  // Calculate the tour's available date window.
  const window = tourDateWindow(tour);
  // Return true only when both values exist and the target is within the window.
  return Boolean(target && window && target >= window.start && target <= window.end);
};

// Find date-specific availability for the requested travel date.
const getDateAvailability = (tour, travelDate) => {
  // Parse the requested date and normalize its time.
  const target = normalizeDate(travelDate);
  // Reject invalid dates before checking inventory.
  if (!target) throw new Error("A valid travel date is required.");
  // Use an empty list when the tour does not have date-specific inventory.
  const entries = Array.isArray(tour.availability) ? tour.availability : [];
  // Return null to signal that aggregate capacity should be used when no dated entries exist.
  if (entries.length === 0) return null;
  // Find the inventory entry for the selected calendar date.
  const entry = entries.find((item) => sameDay(item.date, travelDate));
  // Return the matching entry when explicit date inventory exists.
  if (entry) return entry;
  // A missing dated entry inside the tour's date window can use aggregate capacity.
  if (isWithinTourWindow(tour, travelDate)) return null;
  // Reject dates outside the offered tour window.
  throw new Error("The selected travel date is not offered for this tour.");
};

// Check whether the requested number of guests can fit into the tour inventory.
export const validateTourCapacity = async (tourId, requestedGuests, travelDate) => {
  // Prevent capacity checks without an active tenant boundary.
  requireTenantId();
  // Accept only positive whole-number guest counts.
  if (!Number.isInteger(requestedGuests) || requestedGuests <= 0) throw new Error("Invalid traveler count.");
  // Read the requested tour using a tenant-scoped filter; lean returns a plain object.
  const tour = await Tour.findOne(mergeTenantFilter({ _id: tourId })).lean();
  // Reject an unknown tour or a tour outside the active tenant.
  if (!tour) throw new Error("Tour not found.");

  // Prefer date-specific availability when an entry exists for the selected day.
  const dated = getDateAvailability(tour, travelDate);
  // Compare requested guests with the non-negative remaining dated slots.
  if (dated) return requestedGuests <= Math.max(Number(dated.totalSlots || 0) - Number(dated.bookedSlots || 0), 0);

  // Read aggregate total capacity, falling back to the legacy capacity field.
  const totalSlots = Number(tour.availabilitySettings?.totalSlots ?? tour.capacity ?? 0);
  // Read aggregate booked slots, defaulting to zero.
  const bookedSlots = Number(tour.availabilitySettings?.bookedSlots ?? 0);
  // Allow the booking only when requested guests fit into remaining aggregate capacity.
  return requestedGuests <= Math.max(totalSlots - bookedSlots, 0);
};

// Atomically reserve tour capacity so concurrent booking requests cannot overbook the same slots.
export const reserveSlots = async (tourId, travelers, travelDate, session = null) => {
  // Require a tenant context before reading or updating inventory.
  requireTenantId();
  // Accept only positive whole-number traveler counts.
  if (!Number.isInteger(travelers) || travelers <= 0) throw new Error("Invalid traveler count.");
  // Normalize the selected travel date for validity checks.
  const target = normalizeDate(travelDate);
  // Read the current tour under tenant scope and the caller's transaction session.
  const current = await Tour.findOne(mergeTenantFilter({ _id: tourId })).session(session).lean();
  // Reject missing or cross-tenant tour records.
  if (!current) throw new Error("Tour not found.");

  // Use date-specific inventory when the tour has dated availability entries.
  if (Array.isArray(current.availability) && current.availability.length) {
    // A dated inventory tour requires a valid selected travel date.
    if (!target) throw new Error("A valid travel date is required.");
    // Find the index of the availability entry for the requested calendar date.
    const index = current.availability.findIndex((item) => sameDay(item.date, travelDate));
    // When there is no exact entry, allow aggregate capacity only inside the tour date window.
    if (index < 0) {
      // Reject missing dates that are outside the tour's configured window.
      if (!isWithinTourWindow(current, travelDate)) {
        // Tell the caller the selected date is not offered.
        throw new Error("The selected travel date is not offered for this tour.");
      }
    } else {
      // Read the matching date-specific availability entry.
      const entry = current.availability[index];
      // Convert that day's total capacity into a number.
      const totalSlots = Number(entry.totalSlots || 0);
      // Convert that day's reserved capacity into a number.
      const bookedSlots = Number(entry.bookedSlots || 0);
      // Fail early when the snapshot already shows insufficient capacity.
      if (bookedSlots + travelers > totalSlots) throw new Error("Not enough available tour slots for the selected travel date.");
      // Atomically increment only if the database still has enough slots; this protects against concurrent requests.
      const tour = await Tour.findOneAndUpdate(
        // Match the tour and require the current booked count to remain within capacity.
        mergeTenantFilter({
          _id: tourId,
          [`availability.${index}.bookedSlots`]: { $lte: totalSlots - travelers }
        }),
        // Increment the selected date's booked count by the requested number of travelers.
        { $inc: { [`availability.${index}.bookedSlots`]: travelers } },
        // Return the updated document and use the supplied transaction session.
        { new: true, session }
      );
      // A null update result means another request consumed the remaining capacity.
      if (!tour) throw new Error("Not enough available tour slots for the selected travel date.");
      // Refresh the derived available/status fields and return the updated tour.
      return syncDerivedAvailability(tour, session);
    }
  }

  // Atomically reserve aggregate inventory when no matching dated entry is used.
  const tour = await Tour.findOneAndUpdate(
    // Require enough capacity using a database-side expression to avoid race conditions.
    mergeTenantFilter({
      _id: tourId,
      $expr: { $lte: [{ $add: [{ $ifNull: ["$availabilitySettings.bookedSlots", 0] }, travelers] }, { $ifNull: ["$availabilitySettings.totalSlots", "$capacity"] }] }
    }),
    // Increment aggregate booked slots by the requested traveler count.
    { $inc: { "availabilitySettings.bookedSlots": travelers } },
    // Return the updated document and keep the update inside the supplied transaction.
    { new: true, session }
  );
  // A null result means capacity was insufficient or the tour no longer matched.
  if (!tour) throw new Error("Not enough available tour slots.");
  // Recalculate availability and return the updated tour.
  return syncDerivedAvailability(tour, session);
};

// Release previously reserved capacity after cancellation or a failed booking.
export const releaseSlots = async (tourId, travelers, travelDate, session = null) => {
  // Require tenant scope before changing inventory.
  requireTenantId();
  // Accept only positive whole-number traveler counts.
  if (!Number.isInteger(travelers) || travelers <= 0) throw new Error("Invalid traveler count.");
  // Normalize the requested travel date.
  const target = normalizeDate(travelDate);
  // Load the tenant-scoped tour inside the optional transaction session.
  const current = await Tour.findOne(mergeTenantFilter({ _id: tourId })).session(session).lean();
  // Reject missing or cross-tenant tour records.
  if (!current) throw new Error("Tour not found.");

  // Use date-specific inventory when the tour stores availability entries.
  if (Array.isArray(current.availability) && current.availability.length) {
    // Do not release dated inventory without a valid travel date.
    if (!target) throw new Error("A valid travel date is required.");
    // Build the start boundary for the selected day.
    const start = new Date(target); const end = new Date(target); end.setDate(end.getDate() + 1);
    // Find the date entry and decrement only that entry's booked count.
    const tour = await Tour.findOneAndUpdate(
      // Require a matching tenant-scoped tour with an availability entry on this date.
      mergeTenantFilter({ _id: tourId, availability: { $elemMatch: { date: { $gte: start, $lt: end } } } }),
      // Decrement the matched array element using the named array filter.
      { $inc: { "availability.$[day].bookedSlots": -travelers } },
      // Restrict the update to the selected day and return the updated tour.
      { arrayFilters: [{ "day.date": { $gte: start, $lt: end } }], new: true, session }
    );
    // Reject release when no matching dated inventory entry was found.
    if (!tour) throw new Error("Tour travel date not found.");
    // Find the updated date entry to guard against a negative count.
    const item = tour.availability.find((entry) => sameDay(entry.date, target));
    // Clamp an underflowed reservation count to zero.
    if (item && item.bookedSlots < 0) item.bookedSlots = 0;
    // Save the clamped count and recalculate derived availability/status fields.
    return syncDerivedAvailability(tour, session);
  }

  // Decrement aggregate inventory for tours that do not use dated entries.
  const tour = await Tour.findOneAndUpdate(mergeTenantFilter({ _id: tourId }), { $inc: { "availabilitySettings.bookedSlots": -travelers } }, { new: true, session });
  // Reject the release if the tour could not be found/updated.
  if (!tour) throw new Error("Tour not found.");
  // Prevent the aggregate booked count from remaining negative after a release.
  if (tour.availabilitySettings.bookedSlots < 0) tour.availabilitySettings.bookedSlots = 0;
  // Persist the corrected inventory and synchronize derived availability fields.
  return syncDerivedAvailability(tour, session);
};
