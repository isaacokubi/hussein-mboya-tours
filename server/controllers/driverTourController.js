import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";
import Staff from "../models/Staff.js";

const startOfDay = (value) => { const d = new Date(value); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); };
const tourStart = (tour) => new Date(tour.startDate || tour.date);
const tourEnd = (tour) => { if (tour.endDate) return new Date(tour.endDate); const d = new Date(tourStart(tour)); const days = Math.max(1, Number(tour.durationDetails?.days || tour.duration || 1)); d.setDate(d.getDate() + days - 1); return d; };
const resolveDriver = (user) => Staff.findOne(mergeTenantFilter({ $or: [{ user: user._id }, { email: String(user.email || "").toLowerCase() }], position: "driver", isDeleted: { $ne: true } }));
const assigned = (driver, id) => mergeTenantFilter({ _id: id, assignedDriver: driver._id, isDeleted: { $ne: true } });

export const getAssignedTours = async (req, res, next) => {
  requireTenantId();
  try { const driver = await resolveDriver(req.user); if (!driver) return res.status(404).json({ success:false, message:"Driver profile not found" }); const tours = await Tour.find(mergeTenantFilter({ assignedDriver:driver._id, isDeleted:{ $ne:true } })).populate("destination").populate("assignedGuide").populate("assignedVehicle").sort({ startDate:1, date:1 }).limit(50); res.json({ success:true, count:tours.length, tours, data:tours }); } catch (e) { next(e); }
};

export const getTourDetails = async (req, res, next) => {
  requireTenantId();
  try { const driver = await resolveDriver(req.user); if (!driver) return res.status(404).json({ success:false, message:"Driver profile not found" }); const tour = await Tour.findOne(assigned(driver, req.params.id)).populate("destination").populate("assignedGuide").populate("assignedVehicle"); if (!tour) return res.status(404).json({ success:false, message:"Tour not found or not assigned to you" }); res.json({ success:true, tour, data:{ tour } }); } catch (e) { next(e); }
};

export const getTourGuests = async (req, res, next) => {
  requireTenantId();
  try { const driver = await resolveDriver(req.user); if (!driver) return res.status(404).json({ success:false, message:"Driver profile not found" }); const tour = await Tour.findOne(assigned(driver, req.params.id)); if (!tour) return res.status(403).json({ success:false, message:"You are not assigned to this tour" }); const bookings = await Booking.find(mergeTenantFilter({ tour:tour._id, isDeleted:{ $ne:true }, status:{ $in:["confirmed","assigned","ongoing","completed"] } })).populate("customer","name email phone").sort({ createdAt:-1 }); res.json({ success:true, count:bookings.length, guests:bookings, data:bookings }); } catch (e) { next(e); }
};

export const updateTourStatus = async (req, res, next) => {
  requireTenantId();
  try {
    const { status } = req.body; if (!["ongoing","completed"].includes(status)) return res.status(400).json({ success:false, message:"Driver may only start or complete a tour" });
    const driver = await resolveDriver(req.user); if (!driver) return res.status(404).json({ success:false, message:"Driver profile not found" });
    const tour = await Tour.findOne(assigned(driver, req.params.id)); if (!tour) return res.status(404).json({ success:false, message:"Tour not found or not assigned to you" });
    const today = startOfDay(new Date()), start = startOfDay(tourStart(tour)), end = startOfDay(tourEnd(tour));
    if (status === "ongoing") { if (today.getTime() !== start.getTime()) return res.status(400).json({ success:false, message:`This tour can only be started on ${start.toLocaleDateString()}.` }); if (!["scheduled","upcoming"].includes(tour.status)) return res.status(400).json({ success:false, message:"Only scheduled or upcoming tours can be started." }); tour.startedAt = new Date(); }
    if (status === "completed") { if (today < end) return res.status(400).json({ success:false, message:"This tour cannot be completed before its final day." }); if (tour.status !== "ongoing") return res.status(400).json({ success:false, message:"Only an ongoing tour can be completed." }); tour.completedAt = new Date(); tour.assignmentStatus = "completed"; }
    tour.status = status; await tour.save(); res.json({ success:true, message:"Tour status updated successfully", tour, data:{ tour } });
  } catch (e) { next(e); }
};
