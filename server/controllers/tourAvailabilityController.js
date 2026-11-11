/**
 * Purpose: tour Availability Controller HTTP controller. Main declarations: activeBookingFilter, getTourAvailability, normalize, updateTourAvailability.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";

// Declare activeBookingFilter for use by the surrounding module or function.
const activeBookingFilter = (req, tourId) => mergeTenantFilter(req, {
  tour: tourId,
  isDeleted: { $ne: true },
  status: { $nin: ["cancelled", "refunded", "completed"] },
});

// Declare guestExpression for use by the surrounding module or function.
const guestExpression = { $ifNull: ["$numberOfGuests", { $ifNull: ["$guests", { $ifNull: ["$numberOfPeople", 1] }] }] };

// Declare getTourAvailability for use by the surrounding module or function.
export const getTourAvailability = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tour for use by the surrounding module or function.
    const tour = await Tour.findOne(mergeTenantFilter(req, { _id: req.params.id, isDeleted: { $ne: true } })).lean();
    // Check the condition (!tour) and run the matching branch.
    if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });

    // Declare normalize for use by the surrounding module or function.
    const normalize = (value) => { const d = new Date(value); if (Number.isNaN(d.getTime())) return null; d.setHours(0,0,0,0); return d; };
    // Declare requestedDate for use by the surrounding module or function.
    const requestedDate = req.query?.travelDate ? normalize(req.query.travelDate) : null;
    // Declare entries for use by the surrounding module or function.
    const entries = Array.isArray(tour.availability) ? tour.availability : [];
    // Declare selected for use by the surrounding module or function.
    let selected = null;
    // Check the condition (requestedDate) and run the matching branch.
    if (requestedDate) selected = entries.find((entry) => { const d = normalize(entry.date); return d && d.getTime() === requestedDate.getTime(); });
    // Check the condition (requestedDate && entries.length && !selected) and run the matching branch.
    if (requestedDate && entries.length && !selected) return res.status(400).json({ success:false, message:"The requested travel date is not offered for this tour." });

    // Declare totalSlots for use by the surrounding module or function.
    const totalSlots = Math.max(0, Number(selected?.totalSlots ?? tour.availabilitySettings?.totalSlots ?? tour.capacity ?? tour.maxGuests ?? 0));
    // Declare bookedSlots for use by the surrounding module or function.
    const bookedSlots = Math.max(0, Number(selected?.bookedSlots ?? tour.availabilitySettings?.bookedSlots ?? 0));
    // Declare availableSlots for use by the surrounding module or function.
    const availableSlots = Math.max(totalSlots - bookedSlots, 0);
    // Declare availability for use by the surrounding module or function.
    const availability = entries.map((entry) => ({
      date: entry.date,
      totalSlots: Number(entry.totalSlots || 0),
      bookedSlots: Number(entry.bookedSlots || 0),
      availableSlots: Math.max(Number(entry.totalSlots || 0) - Number(entry.bookedSlots || 0), 0),
    }));

    // Declare bookingFilter for use by the surrounding module or function.
    const bookingFilter = activeBookingFilter(req, tour._id);
    // Check the condition (requestedDate) and run the matching branch.
    if (requestedDate) {
      // Declare end for use by the surrounding module or function.
      const end = new Date(requestedDate); end.setDate(end.getDate() + 1);
      // Perform the side effect or state update expressed on the following line.
      bookingFilter.travelDate = { $gte: requestedDate, $lt: end };
    }
    // Declare bookingStats for use by the surrounding module or function.
    const bookingStats = await Booking.aggregate([
      { $match: bookingFilter },
      { $group: { _id: null, totalBookings: { $sum: 1 } } },
    ]);
    // Declare totalBookings for use by the surrounding module or function.
    const totalBookings = Number(bookingStats[0]?.totalBookings || 0);
    // Declare occupancyRate for use by the surrounding module or function.
    const occupancyRate = totalSlots ? Number(((bookedSlots / totalSlots) * 100).toFixed(1)) : 0;

    // Return the result of res.status(200).json() to the caller.
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

// Declare updateTourAvailability for use by the surrounding module or function.
export const updateTourAvailability = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare requestedSlots for use by the surrounding module or function.
    const requestedSlots = Number(req.body?.totalSlots);
    // Check the condition (!Number.isFinite(requestedSlots) || requestedSlots <= 0 || !Number.isI) and run the matching branch.
    if (!Number.isFinite(requestedSlots) || requestedSlots <= 0 || !Number.isInteger(requestedSlots)) return res.status(400).json({ success: false, message: "Total slots must be a positive whole number." });

    // Declare tour for use by the surrounding module or function.
    const tour = await Tour.findOne(mergeTenantFilter(req, { _id: req.params.id, isDeleted: { $ne: true } }));
    // Check the condition (!tour) and run the matching branch.
    if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });

    // Declare bookingStats for use by the surrounding module or function.
    const bookingStats = await Booking.aggregate([
      { $match: activeBookingFilter(req, tour._id) },
      { $group: { _id: null, bookedGuests: { $sum: guestExpression } } },
    ]);
    // Declare bookedGuests for use by the surrounding module or function.
    const bookedGuests = Number(bookingStats[0]?.bookedGuests || 0);
    // Check the condition (requestedSlots < bookedGuests) and run the matching branch.
    if (requestedSlots < bookedGuests) return res.status(400).json({ success: false, message: `Cannot reduce capacity below the current booked guests (${bookedGuests}).` });

    // Perform the side effect or state update expressed on the following line.
    tour.capacity = requestedSlots;
    // Perform the side effect or state update expressed on the following line.
    tour.availabilitySettings = tour.availabilitySettings || {};
    // Perform the side effect or state update expressed on the following line.
    tour.availabilitySettings.totalSlots = requestedSlots;
    // Perform the side effect or state update expressed on the following line.
    tour.availabilitySettings.bookedSlots = bookedGuests;
    // Perform the side effect or state update expressed on the following line.
    tour.available = requestedSlots > bookedGuests;
    // Check the condition (tour.status === "fully-booked" && requestedSlots > bookedGuests) and run the matching branch.
    if (tour.status === "fully-booked" && requestedSlots > bookedGuests) tour.status = "upcoming";
    // Perform the side effect or state update expressed on the following line.
    await tour.save();

    // Declare updatedTour for use by the surrounding module or function.
    const updatedTour = await Tour.findOne(mergeTenantFilter(req, { _id: tour._id })).populate("destination").populate("assignedGuide").populate("assignedDriver").populate("assignedVehicle").lean();
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, message: "Tour capacity updated successfully.", data: { tour: updatedTour, bookedSlots: bookedGuests, availableSlots: requestedSlots - bookedGuests } });
  } catch (error) { next(error); }
};
