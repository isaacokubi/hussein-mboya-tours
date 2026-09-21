import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";

const activeBookingFilter = (req, tourId) => mergeTenantFilter(req, {
  tour: tourId,
  isDeleted: { $ne: true },
  status: { $nin: ["cancelled", "refunded", "completed"] },
});

const guestExpression = { $ifNull: ["$numberOfGuests", { $ifNull: ["$guests", { $ifNull: ["$numberOfPeople", 1] }] }] };

export const getTourAvailability = async (req, res, next) => {
  requireTenantId();
  try {
    const tour = await Tour.findOne(mergeTenantFilter(req, { _id: req.params.id, isDeleted: { $ne: true } })).lean();
    if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });

    const normalize = (value) => { const d = new Date(value); if (Number.isNaN(d.getTime())) return null; d.setHours(0,0,0,0); return d; };
    const requestedDate = req.query?.travelDate ? normalize(req.query.travelDate) : null;
    const entries = Array.isArray(tour.availability) ? tour.availability : [];
    let selected = null;
    if (requestedDate) selected = entries.find((entry) => { const d = normalize(entry.date); return d && d.getTime() === requestedDate.getTime(); });
    if (requestedDate && entries.length && !selected) return res.status(400).json({ success:false, message:"The requested travel date is not offered for this tour." });

    const totalSlots = Math.max(0, Number(selected?.totalSlots ?? tour.availabilitySettings?.totalSlots ?? tour.capacity ?? tour.maxGuests ?? 0));
    const bookedSlots = Math.max(0, Number(selected?.bookedSlots ?? tour.availabilitySettings?.bookedSlots ?? 0));
    const availableSlots = Math.max(totalSlots - bookedSlots, 0);
    const availability = entries.map((entry) => ({
      date: entry.date,
      totalSlots: Number(entry.totalSlots || 0),
      bookedSlots: Number(entry.bookedSlots || 0),
      availableSlots: Math.max(Number(entry.totalSlots || 0) - Number(entry.bookedSlots || 0), 0),
    }));

    const bookingFilter = activeBookingFilter(req, tour._id);
    if (requestedDate) {
      const end = new Date(requestedDate); end.setDate(end.getDate() + 1);
      bookingFilter.travelDate = { $gte: requestedDate, $lt: end };
    }
    const bookingStats = await Booking.aggregate([
      { $match: bookingFilter },
      { $group: { _id: null, totalBookings: { $sum: 1 } } },
    ]);
    const totalBookings = Number(bookingStats[0]?.totalBookings || 0);
    const occupancyRate = totalSlots ? Number(((bookedSlots / totalSlots) * 100).toFixed(1)) : 0;

    return res.status(200).json({
      success: true,
      data: {
        tourId: tour._id,
        tourName: tour.title,
        travelDate: requestedDate,
        totalSlots,
        bookedSlots,
        availableSlots,
        totalBookings,
        occupancyRate,
        isFull: totalSlots > 0 && availableSlots === 0,
        availability,
        sourceOfTruth: "Tour.availability",
      },
    });
  } catch (error) { next(error); }
};

export const updateTourAvailability = async (req, res, next) => {
  requireTenantId();
  try {
    const requestedSlots = Number(req.body?.totalSlots);
    if (!Number.isFinite(requestedSlots) || requestedSlots <= 0 || !Number.isInteger(requestedSlots)) return res.status(400).json({ success: false, message: "Total slots must be a positive whole number." });

    const tour = await Tour.findOne(mergeTenantFilter(req, { _id: req.params.id, isDeleted: { $ne: true } }));
    if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });

    const bookingStats = await Booking.aggregate([
      { $match: activeBookingFilter(req, tour._id) },
      { $group: { _id: null, bookedGuests: { $sum: guestExpression } } },
    ]);
    const bookedGuests = Number(bookingStats[0]?.bookedGuests || 0);
    if (requestedSlots < bookedGuests) return res.status(400).json({ success: false, message: `Cannot reduce capacity below the current booked guests (${bookedGuests}).` });

    tour.capacity = requestedSlots;
    tour.availabilitySettings = tour.availabilitySettings || {};
    tour.availabilitySettings.totalSlots = requestedSlots;
    tour.availabilitySettings.bookedSlots = bookedGuests;
    tour.available = requestedSlots > bookedGuests;
    if (tour.status === "fully-booked" && requestedSlots > bookedGuests) tour.status = "upcoming";
    await tour.save();

    const updatedTour = await Tour.findOne(mergeTenantFilter(req, { _id: tour._id })).populate("destination").populate("assignedGuide").populate("assignedDriver").populate("assignedVehicle").lean();
    return res.status(200).json({ success: true, message: "Tour capacity updated successfully.", data: { tour: updatedTour, bookedSlots: bookedGuests, availableSlots: requestedSlots - bookedGuests } });
  } catch (error) { next(error); }
};
