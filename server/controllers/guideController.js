/**
 * Purpose: guide Controller HTTP controller. Main declarations: scope, normalize, resolveGuide, getGuideOr404, startOfDay.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/TourReport.js so this module can use its exported dependencies.
import TourReport from "../models/TourReport.js";
// Load ../models/Staff.js so this module can use its exported dependencies.
import Staff from "../models/Staff.js";

// Declare TOUR_STATUSES for use by the surrounding module or function.
const TOUR_STATUSES = ["scheduled", "upcoming", "ongoing", "completed", "cancelled"];
// Declare GUIDE_POSITIONS for use by the surrounding module or function.
const GUIDE_POSITIONS = ["guide", "tour_guide", "tourguide"];
// Declare scope for use by the surrounding module or function.
const scope = (req, filter = {}) => mergeTenantFilter(req, filter);

// Declare normalize for use by the surrounding module or function.
const normalize = (value) => String(value || "").trim().toLowerCase();

// Declare resolveGuide for use by the surrounding module or function.
const resolveGuide = async (req) => {
  // Declare user for use by the surrounding module or function.
  const user = req.user;
  // Check the condition (!user?._id) and run the matching branch.
  if (!user?._id) return null;
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();

  // Declare baseFilter for use by the surrounding module or function.
  const baseFilter = {
    position: { $in: GUIDE_POSITIONS },
    isDeleted: { $ne: true },
  };

  // Declare guide for use by the surrounding module or function.
  let guide = await Staff.findOne(scope(req, {
    ...baseFilter,
    $or: [{ user: user._id }, ...(user.email ? [{ email: user.email }] : [])],
  }));

  // Compatibility recovery for staff records created before the User ↔ Staff
  // link was introduced. Only link automatically when there is exactly one
  // tenant-scoped guide candidate matching a stable identity field.
  // Check the condition (!guide) and run the matching branch.
  if (!guide) {
    // Declare candidates for use by the surrounding module or function.
    const candidates = await Staff.find(scope(req, baseFilter))
      .select("_id user name email phone position role status isActive assignedTours availability isDeleted")
      .lean();
    // Declare email for use by the surrounding module or function.
    const email = normalize(user.email);
    // Declare phone for use by the surrounding module or function.
    const phone = normalize(user.phone);
    // Declare name for use by the surrounding module or function.
    const name = normalize(user.name);
    // Declare matches for use by the surrounding module or function.
    const matches = candidates.filter((candidate) => {
      // Declare candidateEmail for use by the surrounding module or function.
      const candidateEmail = normalize(candidate.email);
      // Declare candidatePhone for use by the surrounding module or function.
      const candidatePhone = normalize(candidate.phone);
      // Declare candidateName for use by the surrounding module or function.
      const candidateName = normalize(candidate.name);
      // Return the expression shown below to the caller.
      return (email && candidateEmail === email) || (phone && candidatePhone === phone) || (name && candidateName === name);
    });
    // Check the condition (matches.length === 1) and run the matching branch.
    if (matches.length === 1) {
      // Perform the side effect or state update expressed on the following line.
      guide = await Staff.findOne(scope(req, { _id: matches[0]._id }));
    }
  }

  // Check the condition (guide) and run the matching branch.
  if (guide) {
    // Declare changed for use by the surrounding module or function.
    let changed = false;
    // Check the condition (!guide.user || guide.user.toString() !== user._id.toString()) and run the matching branch.
    if (!guide.user || guide.user.toString() !== user._id.toString()) { guide.user = user._id; changed = true; }
    // Check the condition (guide.position !== "guide") and run the matching branch.
    if (guide.position !== "guide") { guide.position = "guide"; changed = true; }
    // Check the condition (guide.role !== "guide") and run the matching branch.
    if (guide.role !== "guide") { guide.role = "guide"; changed = true; }
    // Check the condition (!guide.isActive || guide.status !== "active") and run the matching branch.
    if (!guide.isActive || guide.status !== "active") { guide.isActive = true; guide.status = "active"; changed = true; }
    // Check the condition (changed) and run the matching branch.
    if (changed) await guide.save();
    // Return the value of guide to the caller.
    return guide;
  }

  // Return the result of Staff.create() to the caller.
  return Staff.create({
    tenantId: req.tenantId,
    user: user._id,
    name: user.name || "Tour Guide",
    email: user.email || `guide-${user._id}@globaltours.local`,
    phone: user.phone || "N/A",
    position: "guide",
    role: "guide",
    status: "active",
    isActive: true,
    isDeleted: false,
    availability: "available",
    assignedTours: [],
    createdBy: user._id,
  });
};

// Declare getGuideOr404 for use by the surrounding module or function.
const getGuideOr404 = async (req, res) => {
  // Declare guide for use by the surrounding module or function.
  const guide = await resolveGuide(req);
  // Check the condition (!guide) and run the matching branch.
  if (!guide) {
    // Perform the side effect or state update expressed on the following line.
    res.status(404).json({ success: false, message: "Guide profile not found" });
    // Return the expression shown below to the caller.
    return null;
  }
  // Return the value of guide to the caller.
  return guide;
};

// Declare startOfDay for use by the surrounding module or function.
const startOfDay = (value) => {
  // Declare d for use by the surrounding module or function.
  const d = new Date(value);
  // Return a new Date instance to the caller.
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};
// Declare getTourStart for use by the surrounding module or function.
const getTourStart = (tour) => new Date(tour.startDate || tour.date);
// Declare getTourEnd for use by the surrounding module or function.
const getTourEnd = (tour) => {
  // Check the condition (tour.endDate) and run the matching branch.
  if (tour.endDate) return new Date(tour.endDate);
  // Declare start for use by the surrounding module or function.
  const start = getTourStart(tour);
  // Declare days for use by the surrounding module or function.
  const days = Math.max(1, Number(tour.durationDetails?.days || tour.duration || 1));
  // Declare end for use by the surrounding module or function.
  const end = new Date(start);
  // Perform the side effect or state update expressed on the following line.
  end.setDate(end.getDate() + days - 1);
  // Return the value of end to the caller.
  return end;
};

// Declare guideTourFilter for use by the surrounding module or function.
const guideTourFilter = (req, guide) => scope(req, {
  $or: [{ assignedGuide: guide._id }, { guide: guide._id }, ...(Array.isArray(guide.assignedTours) && guide.assignedTours.length ? [{ _id: { $in: guide.assignedTours } }] : [])],
  isDeleted: { $ne: true },
});

// Declare syncTourLifecycle for use by the surrounding module or function.
const syncTourLifecycle = async (req, tours) => {
  // Declare today for use by the surrounding module or function.
  const today = startOfDay(new Date());
  // Repeat the enclosed work for each required iteration.
  for (const tour of tours) {
    // Declare start for use by the surrounding module or function.
    const start = startOfDay(getTourStart(tour));
    // Declare end for use by the surrounding module or function.
    const end = startOfDay(getTourEnd(tour));
    // Check the condition (tour.status !== "cancelled" && tour.status !== "completed" && today > ) and run the matching branch.
    if (tour.status !== "cancelled" && tour.status !== "completed" && today > end) {
      // Perform the side effect or state update expressed on the following line.
      tour.status = "completed";
      // Perform the side effect or state update expressed on the following line.
      tour.assignmentStatus = "completed";
      // Perform the side effect or state update expressed on the following line.
      tour.completedAt = tour.completedAt || new Date();
      // Perform the side effect or state update expressed on the following line.
      await Tour.updateOne(scope(req, { _id: tour._id }), { $set: { status: "completed", assignmentStatus: "completed", completedAt: tour.completedAt, endDate: getTourEnd(tour) } });
    }
  }
};

// Declare guideDashboard for use by the surrounding module or function.
export const guideDashboard = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare guide for use by the surrounding module or function.
    const guide = await getGuideOr404(req, res);
    // Check the condition (!guide) and run the matching branch.
    if (!guide) return;
    // Declare assignmentFilter for use by the surrounding module or function.
    const assignmentFilter = guideTourFilter(req, guide);
    // Declare tours for use by the surrounding module or function.
    let tours = await Tour.find(assignmentFilter).populate("destination").populate("assignedVehicle").populate("assignedDriver").sort({ startDate: 1, date: 1 }).lean();
    // Perform the side effect or state update expressed on the following line.
    await syncTourLifecycle(req, tours);
    // Perform the side effect or state update expressed on the following line.
    tours = await Tour.find(assignmentFilter).populate("destination").populate("assignedVehicle").populate("assignedDriver").sort({ startDate: 1, date: 1 }).lean();
    // Declare tourIds for use by the surrounding module or function.
    const tourIds = tours.map((tour) => tour._id);
    // Declare guestStats for use by the surrounding module or function.
    const guestStats = tourIds.length ? await Booking.aggregate([
      { $match: { tenantId: req.tenantId, tour: { $in: tourIds }, isDeleted: { $ne: true }, status: { $in: ["confirmed", "assigned", "ongoing"] } } },
      { $group: { _id: "$tour", guests: { $sum: { $ifNull: ["$numberOfGuests", 1] } }, bookings: { $sum: 1 } } },
    ]) : [];
    // Declare guestMap for use by the surrounding module or function.
    const guestMap = new Map(guestStats.map((item) => [item._id.toString(), { guests: item.guests || 0, bookings: item.bookings || 0 }]));
    // Declare formattedTours for use by the surrounding module or function.
    const formattedTours = tours.map((tour) => {
      // Declare stats for use by the surrounding module or function.
      const stats = guestMap.get(tour._id.toString()) || { guests: 0, bookings: 0 };
      // Declare startDate for use by the surrounding module or function.
      const startDate = getTourStart(tour);
      // Declare endDate for use by the surrounding module or function.
      const endDate = getTourEnd(tour);
      // Return the object assembled below to the caller.
      return { ...tour, date: tour.date || startDate, startDate, endDate, guests: stats.guests, bookings: stats.bookings };
    });
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, count: formattedTours.length, stats: { totalTours: formattedTours.length, ongoingTours: formattedTours.filter((tour) => tour.status === "ongoing").length, completedTours: formattedTours.filter((tour) => tour.status === "completed").length }, tours: formattedTours, data: { tours: formattedTours } });
  } catch (error) { next(error); }
};

// Declare getAssignedTours for use by the surrounding module or function.
export const getAssignedTours = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare guide for use by the surrounding module or function.
    const guide = await getGuideOr404(req, res);
    // Check the condition (!guide) and run the matching branch.
    if (!guide) return;
    // Declare tours for use by the surrounding module or function.
    const tours = await Tour.find(guideTourFilter(req, guide)).populate("destination").populate("assignedVehicle").populate("assignedDriver").sort({ startDate: 1, date: 1 }).limit(50);
    // Perform the side effect or state update expressed on the following line.
    await syncTourLifecycle(req, tours);
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, count: tours.length, tours, data: tours });
  } catch (error) { next(error); }
};

// Declare getTourDetails for use by the surrounding module or function.
export const getTourDetails = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare guide for use by the surrounding module or function.
    const guide = await getGuideOr404(req, res);
    // Check the condition (!guide) and run the matching branch.
    if (!guide) return;
    // Declare tour for use by the surrounding module or function.
    const tour = await Tour.findOne(scope(req, { $and: [guideTourFilter(req, guide), { _id: req.params.id }] }))
      .populate("destination").populate("assignedVehicle").populate("assignedDriver");
    // Check the condition (!tour) and run the matching branch.
    if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, tour, data: { tour } });
  } catch (error) { next(error); }
};

// Declare getTourGuests for use by the surrounding module or function.
export const getTourGuests = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare guide for use by the surrounding module or function.
    const guide = await getGuideOr404(req, res);
    // Check the condition (!guide) and run the matching branch.
    if (!guide) return;
    // Declare assignedTour for use by the surrounding module or function.
    const assignedTour = await Tour.findOne(scope(req, { $and: [guideTourFilter(req, guide), { _id: req.params.id }] }));
    // Check the condition (!assignedTour) and run the matching branch.
    if (!assignedTour) return res.status(403).json({ success: false, message: "You are not assigned to this tour" });
    // Declare bookings for use by the surrounding module or function.
    const bookings = await Booking.find(scope(req, { tour: assignedTour._id, isDeleted: { $ne: true }, status: { $in: ["confirmed", "assigned", "ongoing", "completed"] } }))
      .populate("customer", "name firstName lastName email phone")
      .sort({ createdAt: -1 });
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, count: bookings.length, guests: bookings, data: bookings });
  } catch (error) { next(error); }
};

// Declare updateTourStatus for use by the surrounding module or function.
export const updateTourStatus = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { status } for use by the surrounding module or function.
    const { status } = req.body;
    // Check the condition (!TOUR_STATUSES.includes(status)) and run the matching branch.
    if (!TOUR_STATUSES.includes(status)) return res.status(400).json({ success: false, message: "Invalid tour status" });
    // Declare guide for use by the surrounding module or function.
    const guide = await getGuideOr404(req, res);
    // Check the condition (!guide) and run the matching branch.
    if (!guide) return;
    // Declare assignedTourForDate for use by the surrounding module or function.
    const assignedTourForDate = await Tour.findOne(scope(req, { $and: [guideTourFilter(req, guide), { _id: req.params.id }] })).lean();
    // Check the condition (!assignedTourForDate) and run the matching branch.
    if (!assignedTourForDate) return res.status(404).json({ success: false, message: "Tour not found or not assigned to you" });
    // Declare today for use by the surrounding module or function.
    const today = startOfDay(new Date());
    // Declare start for use by the surrounding module or function.
    const start = startOfDay(getTourStart(assignedTourForDate));
    // Declare end for use by the surrounding module or function.
    const end = startOfDay(getTourEnd(assignedTourForDate));
    // Check the condition (status === "ongoing" && today.getTime() !== start.getTime()) and run the matching branch.
    if (status === "ongoing" && today.getTime() !== start.getTime()) return res.status(400).json({ success: false, message: `This tour can only be started on ${start.toLocaleDateString()}.` });
    // Check the condition (status === "completed" && today < end) and run the matching branch.
    if (status === "completed" && today < end) return res.status(400).json({ success: false, message: "This tour cannot be completed before its final day." });
    // Declare update for use by the surrounding module or function.
    const update = { status, endDate: assignedTourForDate.endDate || end };
    // Check the condition (status === "ongoing") and run the matching branch.
    if (status === "ongoing") update.startedAt = new Date();
    // Check the condition (status === "completed") and run the matching branch.
    if (status === "completed") { update.completedAt = new Date(); update.assignmentStatus = "completed"; }
    // Declare tour for use by the surrounding module or function.
    const tour = await Tour.findOneAndUpdate(scope(req, { $and: [guideTourFilter(req, guide), { _id: req.params.id }] }), { $set: update }, { new: true, runValidators: true }).populate("assignedGuide").populate("assignedDriver").populate("assignedVehicle");
    // Check the condition (!tour) and run the matching branch.
    if (!tour) return res.status(404).json({ success: false, message: "Tour not found or not assigned to you" });
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, message: "Tour status updated successfully", tour, data: { tour } });
  } catch (error) { next(error); }
};

// Declare submitTourReport for use by the surrounding module or function.
export const submitTourReport = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare guide for use by the surrounding module or function.
    const guide = await getGuideOr404(req, res);
    // Check the condition (!guide) and run the matching branch.
    if (!guide) return;
    // Declare assignedTour for use by the surrounding module or function.
    const assignedTour = await Tour.findOne(scope(req, { $and: [guideTourFilter(req, guide), { _id: req.params.id }] }));
    // Check the condition (!assignedTour) and run the matching branch.
    if (!assignedTour) return res.status(403).json({ success: false, message: "You are not assigned to this tour" });
    // Declare report for use by the surrounding module or function.
    const report = await TourReport.create({ tenantId: req.tenantId, tour: assignedTour._id, guide: guide._id, summary: req.body.summary, issues: req.body.issues || [], photos: req.body.photos || [] });
    // Perform the side effect or state update expressed on the following line.
    assignedTour.status = "completed";
    // Perform the side effect or state update expressed on the following line.
    assignedTour.assignmentStatus = "completed";
    // Perform the side effect or state update expressed on the following line.
    assignedTour.completedAt = new Date();
    // Perform the side effect or state update expressed on the following line.
    await assignedTour.save();
    // Return the result of res.status(201).json() to the caller.
    return res.status(201).json({ success: true, message: "Tour report submitted successfully", report });
  } catch (error) { next(error); }
};
