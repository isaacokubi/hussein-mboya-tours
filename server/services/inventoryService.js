import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Tour from "../models/Tour.js";

const normalizeDate = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
};

const syncDerivedAvailability = async (tour, session = null) => {
  const entries = Array.isArray(tour.availability) ? tour.availability : [];
  const total = entries.length ? entries.reduce((sum, item) => sum + Number(item.totalSlots || 0), 0) : Number(tour.availabilitySettings?.totalSlots ?? tour.capacity ?? 0);
  const booked = entries.length ? entries.reduce((sum, item) => sum + Number(item.bookedSlots || 0), 0) : Number(tour.availabilitySettings?.bookedSlots || 0);
  const hasSpace = entries.length ? entries.some((item) => Number(item.bookedSlots || 0) < Number(item.totalSlots || 0)) : booked < total;
  tour.available = hasSpace;
  if (!hasSpace && total > 0 && !["completed","cancelled"].includes(tour.status)) tour.status = "fully-booked";
  else if (hasSpace && tour.status === "fully-booked") tour.status = "upcoming";
  await tour.save({ session });
  return tour;
};

const sameDay = (a, b) => {
  const da = normalizeDate(a); const db = normalizeDate(b);
  return Boolean(da && db && da.getTime() === db.getTime());
};

const getDateAvailability = (tour, travelDate) => {
  const target = normalizeDate(travelDate);
  if (!target) throw new Error("A valid travel date is required.");
  const entries = Array.isArray(tour.availability) ? tour.availability : [];
  if (entries.length === 0) return null;
  const entry = entries.find((item) => sameDay(item.date, target));
  if (!entry) throw new Error("The selected travel date is not offered for this tour.");
  return entry;
};

export const validateTourCapacity = async (tourId, requestedGuests, travelDate) => {
  requireTenantId();
  if (!Number.isInteger(requestedGuests) || requestedGuests <= 0) throw new Error("Invalid traveler count.");
  const tour = await Tour.findOne(mergeTenantFilter({ _id: tourId })).lean();
  if (!tour) throw new Error("Tour not found.");

  const dated = getDateAvailability(tour, travelDate);
  if (dated) return requestedGuests <= Math.max(Number(dated.totalSlots || 0) - Number(dated.bookedSlots || 0), 0);

  const totalSlots = Number(tour.availabilitySettings?.totalSlots ?? tour.capacity ?? 0);
  const bookedSlots = Number(tour.availabilitySettings?.bookedSlots ?? 0);
  return requestedGuests <= Math.max(totalSlots - bookedSlots, 0);
};

export const reserveSlots = async (tourId, travelers, travelDate, session = null) => {
  requireTenantId();
  if (!Number.isInteger(travelers) || travelers <= 0) throw new Error("Invalid traveler count.");
  const target = normalizeDate(travelDate);
  const current = await Tour.findOne(mergeTenantFilter({ _id: tourId })).session(session).lean();
  if (!current) throw new Error("Tour not found.");

  if (Array.isArray(current.availability) && current.availability.length) {
    if (!target) throw new Error("A valid travel date is required.");
    const index = current.availability.findIndex((item) => sameDay(item.date, target));
    if (index < 0) throw new Error("The selected travel date is not offered for this tour.");
    const entry = current.availability[index];
    const totalSlots = Number(entry.totalSlots || 0);
    const bookedSlots = Number(entry.bookedSlots || 0);
    if (bookedSlots + travelers > totalSlots) throw new Error("Not enough available tour slots for the selected travel date.");
    const tour = await Tour.findOneAndUpdate(
      mergeTenantFilter({
        _id: tourId,
        [`availability.${index}.bookedSlots`]: { $lte: totalSlots - travelers }
      }),
      { $inc: { [`availability.${index}.bookedSlots`]: travelers } },
      { new: true, session }
    );
    if (!tour) throw new Error("Not enough available tour slots for the selected travel date.");
    return syncDerivedAvailability(tour, session);
  }

  const tour = await Tour.findOneAndUpdate(
    mergeTenantFilter({
      _id: tourId,
      $expr: { $lte: [{ $add: [{ $ifNull: ["$availabilitySettings.bookedSlots", 0] }, travelers] }, { $ifNull: ["$availabilitySettings.totalSlots", "$capacity"] }] }
    }),
    { $inc: { "availabilitySettings.bookedSlots": travelers } },
    { new: true, session }
  );
  if (!tour) throw new Error("Not enough available tour slots.");
  return syncDerivedAvailability(tour, session);
};

export const releaseSlots = async (tourId, travelers, travelDate, session = null) => {
  requireTenantId();
  if (!Number.isInteger(travelers) || travelers <= 0) throw new Error("Invalid traveler count.");
  const target = normalizeDate(travelDate);
  const current = await Tour.findOne(mergeTenantFilter({ _id: tourId })).session(session).lean();
  if (!current) throw new Error("Tour not found.");

  if (Array.isArray(current.availability) && current.availability.length) {
    if (!target) throw new Error("A valid travel date is required.");
    const start = new Date(target); const end = new Date(target); end.setDate(end.getDate() + 1);
    const tour = await Tour.findOneAndUpdate(
      mergeTenantFilter({ _id: tourId, availability: { $elemMatch: { date: { $gte: start, $lt: end } } } }),
      { $inc: { "availability.$[day].bookedSlots": -travelers } },
      { arrayFilters: [{ "day.date": { $gte: start, $lt: end } }], new: true, session }
    );
    if (!tour) throw new Error("Tour travel date not found.");
    const item = tour.availability.find((entry) => sameDay(entry.date, target));
    if (item && item.bookedSlots < 0) item.bookedSlots = 0;
    return syncDerivedAvailability(tour, session);
  }

  const tour = await Tour.findOneAndUpdate(mergeTenantFilter({ _id: tourId }), { $inc: { "availabilitySettings.bookedSlots": -travelers } }, { new: true, session });
  if (!tour) throw new Error("Tour not found.");
  if (tour.availabilitySettings.bookedSlots < 0) tour.availabilitySettings.bookedSlots = 0;
  return syncDerivedAvailability(tour, session);
};
