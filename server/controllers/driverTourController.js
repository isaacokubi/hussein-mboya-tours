/**
 * Purpose: driver Tour Controller HTTP controller. Main declarations: startOfDay, tourStart, tourEnd, resolveDriver, assigned.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Staff.js so this module can use its exported dependencies.
import Staff from "../models/Staff.js";

// Declare startOfDay for use by the surrounding module or function.
const startOfDay = (value) => { const d = new Date(value); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); };
// Declare tourStart for use by the surrounding module or function.
const tourStart = (tour) => new Date(tour.startDate || tour.date || tour.travelDate);
// Declare tourEnd for use by the surrounding module or function.
const tourEnd = (tour) => { if (tour.endDate) return new Date(tour.endDate); const d = new Date(tourStart(tour)); const days = Math.max(1, Number(tour.durationDetails?.days || tour.duration || 1)); d.setDate(d.getDate() + days - 1); return d; };
// Declare resolveDriver for use by the surrounding module or function.
const resolveDriver = (user) => Staff.findOne(mergeTenantFilter({ $or: [{ user: user._id }, { email: String(user.email || "").toLowerCase() }], position: "driver", isDeleted: { $ne: true } }));
// Declare assigned for use by the surrounding module or function.
const assigned = (driver, id) => mergeTenantFilter({ _id: id, assignedDriver: driver._id, isDeleted: { $ne: true } });

// Declare addGuestCounts for use by the surrounding module or function.
const addGuestCounts = async (tours) => {
  // Check the condition (!tours.length) and run the matching branch.
  if (!tours.length) return tours;
  // Declare tourIds for use by the surrounding module or function.
  const tourIds = tours.map((tour) => tour._id);
  // Declare stats for use by the surrounding module or function.
  const stats = await Booking.aggregate([
    { $match: mergeTenantFilter({ tour: { $in: tourIds }, isDeleted: { $ne: true }, status: { $in: ["confirmed", "assigned", "ongoing", "completed"] } }) },
    { $group: { _id: "$tour", guests: { $sum: { $ifNull: ["$numberOfGuests", { $ifNull: ["$guests", { $ifNull: ["$numberOfPeople", 1] }] }] } }, bookings: { $sum: 1 } } },
  ]);
  // Declare map for use by the surrounding module or function.
  const map = new Map(stats.map((item) => [item._id.toString(), { guests: Number(item.guests) || 0, bookings: Number(item.bookings) || 0 }]));
  // Return the result of tours.map() to the caller.
  return tours.map((tour) => ({ ...tour.toObject ? tour.toObject() : tour, ...(map.get(tour._id.toString()) || { guests: 0, bookings: 0 }) }));
};

// Declare getAssignedTours for use by the surrounding module or function.
export const getAssignedTours = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try { const driver = await resolveDriver(req.user); if (!driver) return res.status(404).json({ success:false, message:"Driver profile not found" }); const tours = await Tour.find(mergeTenantFilter({ assignedDriver:driver._id, isDeleted:{ $ne:true } })).populate("destination").populate("assignedGuide").populate("assignedVehicle").sort({ startDate:1, date:1 }).limit(50); const enrichedTours = await addGuestCounts(tours); res.json({ success:true, count:enrichedTours.length, tours:enrichedTours, data:enrichedTours }); } catch (e) { next(e); }
};

// Declare getTourDetails for use by the surrounding module or function.
export const getTourDetails = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try { const driver = await resolveDriver(req.user); if (!driver) return res.status(404).json({ success:false, message:"Driver profile not found" }); const tour = await Tour.findOne(assigned(driver, req.params.id)).populate("destination").populate("assignedGuide").populate("assignedVehicle"); if (!tour) return res.status(404).json({ success:false, message:"Tour not found or not assigned to you" }); res.json({ success:true, tour, data:{ tour } }); } catch (e) { next(e); }
};

// Declare getTourGuests for use by the surrounding module or function.
export const getTourGuests = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try { const driver = await resolveDriver(req.user); if (!driver) return res.status(404).json({ success:false, message:"Driver profile not found" }); const tour = await Tour.findOne(assigned(driver, req.params.id)); if (!tour) return res.status(403).json({ success:false, message:"You are not assigned to this tour" }); const bookings = await Booking.find(mergeTenantFilter({ tour:tour._id, isDeleted:{ $ne:true }, status:{ $in:["confirmed","assigned","ongoing","completed"] } })).populate("customer","name email phone").sort({ createdAt:-1 }); res.json({ success:true, count:bookings.length, guests:bookings, data:bookings }); } catch (e) { next(e); }
};

// Declare updateTourStatus for use by the surrounding module or function.
export const updateTourStatus = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { status } for use by the surrounding module or function.
    const { status } = req.body; if (!["ongoing","completed"].includes(status)) return res.status(400).json({ success:false, message:"Driver may only start or complete a tour" });
    // Declare driver for use by the surrounding module or function.
    const driver = await resolveDriver(req.user); if (!driver) return res.status(404).json({ success:false, message:"Driver profile not found" });
    // Declare tour for use by the surrounding module or function.
    const tour = await Tour.findOne(assigned(driver, req.params.id)); if (!tour) return res.status(404).json({ success:false, message:"Tour not found or not assigned to you" });
    // Declare today, start, end for use by the surrounding module or function.
    const today = startOfDay(new Date()), start = startOfDay(tourStart(tour)), end = startOfDay(tourEnd(tour));
    // Check the condition (status === "ongoing") and run the matching branch.
    if (status === "ongoing") { if (today.getTime() !== start.getTime()) return res.status(400).json({ success:false, message:`This tour can only be started on ${start.toLocaleDateString()}.` }); if (!["scheduled","upcoming"].includes(tour.status)) return res.status(400).json({ success:false, message:"Only scheduled or upcoming tours can be started." }); tour.startedAt = new Date(); }
    // Check the condition (status === "completed") and run the matching branch.
    if (status === "completed") { if (today < end) return res.status(400).json({ success:false, message:"This tour cannot be completed before its final day." }); if (tour.status !== "ongoing") return res.status(400).json({ success:false, message:"Only an ongoing tour can be completed." }); tour.completedAt = new Date(); tour.assignmentStatus = "completed"; }
    // Perform the side effect or state update expressed on the following line.
    tour.status = status; await tour.save(); res.json({ success:true, message:"Tour status updated successfully", tour, data:{ tour } });
  } catch (e) { next(e); }
};
