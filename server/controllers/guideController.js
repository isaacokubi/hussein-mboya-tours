import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";
import TourReport from "../models/TourReport.js";
import Staff from "../models/Staff.js";

const TOUR_STATUSES = ["scheduled", "upcoming", "ongoing", "completed", "cancelled"];
const GUIDE_POSITIONS = ["guide", "tour_guide", "tourguide"];
const scope = (req, filter = {}) => mergeTenantFilter(req, filter);

const resolveGuide = async (req) => {
  const user = req.user;
  if (!user?._id) return null;
  requireTenantId();

  let guide = await Staff.findOne(scope(req, {
    $and: [
      { $or: [{ user: user._id }, ...(user.email ? [{ email: user.email }] : [])] },
      { position: { $in: GUIDE_POSITIONS } },
      { isDeleted: { $ne: true } },
    ],
  }));

  if (guide) {
    let changed = false;
    if (!guide.user || guide.user.toString() !== user._id.toString()) { guide.user = user._id; changed = true; }
    if (guide.position !== "guide") { guide.position = "guide"; changed = true; }
    if (guide.role !== "guide") { guide.role = "guide"; changed = true; }
    if (!guide.isActive || guide.status !== "active") { guide.isActive = true; guide.status = "active"; changed = true; }
    if (changed) await guide.save();
    return guide;
  }

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

const getGuideOr404 = async (req, res) => {
  const guide = await resolveGuide(req);
  if (!guide) {
    res.status(404).json({ success: false, message: "Guide profile not found" });
    return null;
  }
  return guide;
};

const startOfDay = (value) => {
  const d = new Date(value);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};
const getTourStart = (tour) => new Date(tour.startDate || tour.date);
const getTourEnd = (tour) => {
  if (tour.endDate) return new Date(tour.endDate);
  const start = getTourStart(tour);
  const days = Math.max(1, Number(tour.durationDetails?.days || tour.duration || 1));
  const end = new Date(start);
  end.setDate(end.getDate() + days - 1);
  return end;
};

const guideTourFilter = (req, guide) => scope(req, {
  $or: [{ assignedGuide: guide._id }, { guide: guide._id }, ...(Array.isArray(guide.assignedTours) && guide.assignedTours.length ? [{ _id: { $in: guide.assignedTours } }] : [])],
  isDeleted: { $ne: true },
});

const syncTourLifecycle = async (req, tours) => {
  const today = startOfDay(new Date());
  for (const tour of tours) {
    const start = startOfDay(getTourStart(tour));
    const end = startOfDay(getTourEnd(tour));
    if (tour.status !== "cancelled" && tour.status !== "completed" && today > end) {
      tour.status = "completed";
      tour.assignmentStatus = "completed";
      tour.completedAt = tour.completedAt || new Date();
      await Tour.updateOne(scope(req, { _id: tour._id }), { $set: { status: "completed", assignmentStatus: "completed", completedAt: tour.completedAt, endDate: getTourEnd(tour) } });
    }
  }
};

export const guideDashboard = async (req, res, next) => {
  requireTenantId();
  try {
    const guide = await getGuideOr404(req, res);
    if (!guide) return;
    const assignmentFilter = guideTourFilter(req, guide);
    let tours = await Tour.find(assignmentFilter).populate("destination").populate("assignedVehicle").populate("assignedDriver").sort({ startDate: 1, date: 1 }).lean();
    await syncTourLifecycle(req, tours);
    tours = await Tour.find(assignmentFilter).populate("destination").populate("assignedVehicle").populate("assignedDriver").sort({ startDate: 1, date: 1 }).limit(10).lean();
    const tourIds = tours.map((tour) => tour._id);
    const guestStats = tourIds.length ? await Booking.aggregate([
      { $match: { tenantId: req.tenantId, tour: { $in: tourIds }, isDeleted: { $ne: true }, status: { $in: ["confirmed", "assigned", "ongoing"] } } },
      { $group: { _id: "$tour", guests: { $sum: { $ifNull: ["$numberOfGuests", 1] } }, bookings: { $sum: 1 } } },
    ]) : [];
    const guestMap = new Map(guestStats.map((item) => [item._id.toString(), { guests: item.guests || 0, bookings: item.bookings || 0 }]));
    const formattedTours = tours.map((tour) => {
      const stats = guestMap.get(tour._id.toString()) || { guests: 0, bookings: 0 };
      const startDate = getTourStart(tour);
      const endDate = getTourEnd(tour);
      return { ...tour, date: tour.date || startDate, startDate, endDate, guests: stats.guests, bookings: stats.bookings };
    });
    return res.status(200).json({ success: true, count: formattedTours.length, stats: { totalTours: formattedTours.length, ongoingTours: formattedTours.filter((tour) => tour.status === "ongoing").length, completedTours: formattedTours.filter((tour) => tour.status === "completed").length }, tours: formattedTours, data: { tours: formattedTours } });
  } catch (error) { next(error); }
};

export const getAssignedTours = async (req, res, next) => {
  requireTenantId();
  try {
    const guide = await getGuideOr404(req, res);
    if (!guide) return;
    const tours = await Tour.find(guideTourFilter(req, guide)).populate("destination").populate("assignedVehicle").populate("assignedDriver").sort({ startDate: 1, date: 1 }).limit(10);
    await syncTourLifecycle(req, tours);
    return res.status(200).json({ success: true, count: tours.length, tours, data: tours });
  } catch (error) { next(error); }
};

export const getTourDetails = async (req, res, next) => {
  requireTenantId();
  try {
    const guide = await getGuideOr404(req, res);
    if (!guide) return;
    const tour = await Tour.findOne(scope(req, { $and: [guideTourFilter(req, guide), { _id: req.params.id }] }))
      .populate("destination").populate("assignedVehicle").populate("assignedDriver");
    if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });
    return res.status(200).json({ success: true, tour, data: { tour } });
  } catch (error) { next(error); }
};

export const getTourGuests = async (req, res, next) => {
  requireTenantId();
  try {
    const guide = await getGuideOr404(req, res);
    if (!guide) return;
    const assignedTour = await Tour.findOne(scope(req, { $and: [guideTourFilter(req, guide), { _id: req.params.id }] }));
    if (!assignedTour) return res.status(403).json({ success: false, message: "You are not assigned to this tour" });
    const bookings = await Booking.find(scope(req, { tour: assignedTour._id, isDeleted: { $ne: true }, status: { $in: ["confirmed", "assigned", "ongoing", "completed"] } })).populate("customer", "name email phone").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: bookings.length, guests: bookings, data: bookings });
  } catch (error) { next(error); }
};

export const updateTourStatus = async (req, res, next) => {
  requireTenantId();
  try {
    const { status } = req.body;
    if (!TOUR_STATUSES.includes(status)) return res.status(400).json({ success: false, message: "Invalid tour status" });
    const guide = await getGuideOr404(req, res);
    if (!guide) return;
    const assignedTourForDate = await Tour.findOne(scope(req, { $and: [guideTourFilter(req, guide), { _id: req.params.id }] })).lean();
    if (!assignedTourForDate) return res.status(404).json({ success: false, message: "Tour not found or not assigned to you" });
    const today = startOfDay(new Date());
    const start = startOfDay(getTourStart(assignedTourForDate));
    const end = startOfDay(getTourEnd(assignedTourForDate));
    if (status === "ongoing" && today.getTime() !== start.getTime()) return res.status(400).json({ success: false, message: `This tour can only be started on ${start.toLocaleDateString()}.` });
    if (status === "completed" && today < end) return res.status(400).json({ success: false, message: "This tour cannot be completed before its final day." });
    const update = { status, endDate: assignedTourForDate.endDate || end };
    if (status === "ongoing") update.startedAt = new Date();
    if (status === "completed") { update.completedAt = new Date(); update.assignmentStatus = "completed"; }
    const tour = await Tour.findOneAndUpdate(scope(req, { $and: [guideTourFilter(req, guide), { _id: req.params.id }] }), { $set: update }, { new: true, runValidators: true }).populate("assignedGuide").populate("assignedDriver").populate("assignedVehicle");
    if (!tour) return res.status(404).json({ success: false, message: "Tour not found or not assigned to you" });
    return res.status(200).json({ success: true, message: "Tour status updated successfully", tour, data: { tour } });
  } catch (error) { next(error); }
};

export const submitTourReport = async (req, res, next) => {
  requireTenantId();
  try {
    const guide = await getGuideOr404(req, res);
    if (!guide) return;
    const assignedTour = await Tour.findOne(scope(req, { $and: [guideTourFilter(req, guide), { _id: req.params.id }] }));
    if (!assignedTour) return res.status(403).json({ success: false, message: "You are not assigned to this tour" });
    const report = await TourReport.create({ tenantId: req.tenantId, tour: assignedTour._id, guide: guide._id, summary: req.body.summary, issues: req.body.issues || [], photos: req.body.photos || [] });
    assignedTour.status = "completed";
    assignedTour.assignmentStatus = "completed";
    assignedTour.completedAt = new Date();
    await assignedTour.save();
    return res.status(201).json({ success: true, message: "Tour report submitted successfully", report });
  } catch (error) { next(error); }
};
