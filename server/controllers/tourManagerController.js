import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import mongoose from "mongoose";
import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import Staff from "../models/Staff.js";
import Vehicle from "../models/Vehicle.js";
import { assignTourResources } from "./tourAssignmentController.js";
import { getBookingRevenueMetrics } from "../services/bookingRevenueService.js";
import { cancelTourAndBookings } from "../services/tourCancellationService.js";

const ACTIVE_TOUR_STATUSES = ["scheduled", "upcoming", "confirmed", "active", "ongoing"];
const BOOKING_GUEST_STATUSES = ["confirmed", "assigned", "ongoing", "completed"];

export const getTourManagerDashboard = async (req, res, next) => {
  requireTenantId();
  try {
    const now = new Date();
    const tourFilter = mergeTenantFilter(req, { isDeleted: { $ne: true } });
    const bookingFilter = mergeTenantFilter(req, { isDeleted: { $ne: true } });
    const customerFilter = mergeTenantFilter(req, { role: "customer" });
    const paymentFilter = mergeTenantFilter(req, { status: "completed", isDeleted: { $ne: true } });
    const upcomingFilter = mergeTenantFilter(req, {
      isDeleted: { $ne: true },
      $or: [{ startDate: { $gte: now } }, { date: { $gte: now } }],
      status: { $in: ACTIVE_TOUR_STATUSES },
    });

    const [totalTours, upcomingToursCount, totalCustomers, revenueResult, upcomingTours, recentBookings] = await Promise.all([
      Tour.countDocuments(tourFilter),
      Tour.countDocuments(upcomingFilter),
      User.countDocuments(customerFilter),
      getBookingRevenueMetrics(req),
      Tour.find(upcomingFilter)
        .populate("destination", "name country location image")
        .populate("assignedGuide", "name email phone position availability assignedTours")
        .populate("assignedDriver", "name email phone position availability assignedTours")
        .populate("assignedVehicle", "name registrationNumber registration model type capacity status assignedTour")
        .sort({ startDate: 1, date: 1 }).limit(10).lean(),
      Booking.find(bookingFilter)
        .populate("customer", "name email")
        .populate("tour", "title")
        .sort({ createdAt: -1 }).limit(6).lean(),
    ]);

    const tourIds = upcomingTours.map((tour) => tour._id);
    const guestStats = tourIds.length ? await Booking.aggregate([
      { $match: mergeTenantFilter(req, { tour: { $in: tourIds }, isDeleted: { $ne: true }, $or: [{ status: { $in: BOOKING_GUEST_STATUSES } }, { paymentStatus: "paid" }] }) },
      { $group: { _id: "$tour", guests: { $sum: { $ifNull: ["$numberOfGuests", { $ifNull: ["$guests", { $ifNull: ["$numberOfPeople", 1] }] }] } } } },
    ]) : [];
    const guestMap = new Map(guestStats.map((item) => [item._id.toString(), Number(item.guests || 0)]));

    const formattedTours = upcomingTours.map((tour) => {
      const guests = guestMap.get(tour._id.toString()) || 0;
      const capacity = Number(tour.capacity || tour.availabilitySettings?.totalSlots || 0);
      return {
        id: tour._id, _id: tour._id, name: tour.title || "Untitled Tour", title: tour.title || "Untitled Tour",
        date: tour.startDate || tour.date || null, guests, capacity, bookedSlots: guests,
        availableSlots: Math.max(0, capacity - guests),
        occupancyRate: capacity ? Math.min(100, Math.round((guests / capacity) * 100)) : 0,
        destination: tour.destination || { name: "Unknown Destination" },
        guide: tour.assignedGuide || null, driver: tour.assignedDriver || null, vehicle: tour.assignedVehicle || null,
        assignedGuide: tour.assignedGuide || null, assignedDriver: tour.assignedDriver || null, assignedVehicle: tour.assignedVehicle || null,
        status: tour.status || "draft", assignmentStatus: tour.assignmentStatus || "pending",
      };
    });

    const formattedBookings = recentBookings.map((booking) => ({
      id: booking._id, _id: booking._id,
      bookingNumber: booking.bookingNumber || null,
      customer: booking.customer || { name: booking.customerSnapshot?.name || "Unknown" },
      tour: booking.tour || { title: "Unknown" },
      guests: Number(booking.numberOfGuests || booking.guests || 0),
      paymentStatus: booking.paymentStatus || booking.payment?.status || "pending",
      amount: Number(booking.totalAmount ?? booking.amount ?? booking.price ?? 0),
      status: booking.status || "pending",
      travelDate: booking.travelDate || booking.date || null,
    }));

    return res.status(200).json({ success: true, data: {
      stats: { totalTours, upcomingTours: upcomingToursCount, totalCustomers, revenue: Number(revenueResult?.revenue || 0), revenueSource: "paid_booking_value" },
      upcomingTours: formattedTours, recentBookings: formattedBookings,
    } });
  } catch (error) { console.error("TOUR MANAGER DASHBOARD ERROR:", error); next(error); }
};

export const createTour = async (req, res, next) => {
  requireTenantId();
  const session = await mongoose.startSession();
  try {
    let createdTour;
    await session.withTransaction(async () => {
      const body = req.body || {};
      const { guide, assignedGuide, driver, assignedDriver, vehicle, assignedVehicle, capacity, duration, price, ...rest } = body;
      if (!rest.title?.trim() || !rest.description?.trim() || !rest.destination || !rest.country?.trim() || !rest.location?.trim() || !rest.date || price === undefined || Number(price) < 0) {
        throw Object.assign(new Error("Title, description, destination, country, location, date and a valid price are required."), { status: 400 });
      }

      const guideId = assignedGuide || guide || null;
      const driverId = assignedDriver || driver || null;
      const vehicleId = assignedVehicle || vehicle || null;
      const [guideDoc, driverDoc, vehicleDoc] = await Promise.all([
        guideId ? Staff.findOne(mergeTenantFilter({ _id: guideId, position: "guide", isActive: true, isDeleted: { $ne: true } })).session(session) : null,
        driverId ? Staff.findOne(mergeTenantFilter({ _id: driverId, position: "driver", isActive: true, isDeleted: { $ne: true } })).session(session) : null,
        vehicleId ? Vehicle.findOne(mergeTenantFilter({ _id: vehicleId, isActive: true, isDeleted: { $ne: true } })).session(session) : null,
      ]);
      if (guideId && (!guideDoc || guideDoc.availability !== "available")) throw Object.assign(new Error("Selected guide is unavailable."), { status: 409 });
      if (driverId && (!driverDoc || driverDoc.availability !== "available")) throw Object.assign(new Error("Selected driver is unavailable."), { status: 409 });
      if (vehicleId && (!vehicleDoc || vehicleDoc.status !== "available")) throw Object.assign(new Error("Selected vehicle is unavailable."), { status: 409 });

      const numericCapacity = Number(capacity) > 0 ? Number(capacity) : 20;
      const durationSource = duration ?? rest.durationDays ?? rest.durationDetails?.days ?? 1;
      const durationMatch = String(durationSource).match(/\d+(?:\.\d+)?/);
      const numericDuration = Number(durationMatch?.[0]);
      if (!Number.isFinite(numericDuration) || numericDuration < 1 || numericDuration > 365) {
        throw Object.assign(new Error("Duration must be a whole number of days between 1 and 365."), { status: 400 });
      }
      const numericPrice = Number(price);
      const numericDiscount = Math.max(0, Number(rest.discount) || 0);

      const [tour] = await Tour.create([{
        ...rest,
        title: rest.title.trim(),
        description: rest.description.trim(),
        country: rest.country.trim(),
        location: rest.location.trim(),
        price: numericPrice,
        capacity: numericCapacity,
        duration: String(Math.floor(numericDuration)),
        durationDays: Math.floor(numericDuration),
        durationDetails: { days: Math.floor(numericDuration), nights: 0 },
        discount: numericDiscount,
        assignedGuide: guideDoc?._id || null,
        assignedDriver: driverDoc?._id || null,
        assignedVehicle: vehicleDoc?._id || null,
        assignmentStatus: guideDoc || driverDoc || vehicleDoc ? "assigned" : "pending",
        status: rest.status || "upcoming",
        published: rest.published ?? true,
        available: true,
        availabilitySettings: { totalSlots: numericCapacity, bookedSlots: 0, waitlistEnabled: false },
        createdBy: req.user._id,
      }], { session });

      if (guideDoc) {
        guideDoc.availability = "busy";
        guideDoc.assignedTours = [...new Set([...(guideDoc.assignedTours || []).map(String), String(tour._id)])];
        await guideDoc.save({ session });
      }
      if (driverDoc) {
        driverDoc.availability = "busy";
        driverDoc.assignedTours = [...new Set([...(driverDoc.assignedTours || []).map(String), String(tour._id)])];
        await driverDoc.save({ session });
      }
      if (vehicleDoc) {
        vehicleDoc.status = "assigned";
        vehicleDoc.assignedTour = tour._id;
        await vehicleDoc.save({ session });
      }
      createdTour = tour;
    });

    const responseTour = await Tour.findOne(mergeTenantFilter({ _id: createdTour._id }))
      .populate("destination")
      .populate("assignedGuide", "name email phone position availability")
      .populate("assignedDriver", "name email phone position availability")
      .populate("assignedVehicle", "name registrationNumber registration model type capacity status")
      .lean();
    return res.status(201).json({ success: true, message: "Tour created successfully", data: responseTour, tour: responseTour });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
};

export const getTours = async (req, res, next) => {
  requireTenantId();
  try {
    const { upcoming, page = 1, limit = 10, status } = req.query;
    const filter = mergeTenantFilter(req, { isDeleted: { $ne: true } });
    if (status) filter.status = status;
    if (upcoming === "true" || upcoming === "1") {
      const now = new Date();
      filter.$or = [{ startDate: { $gte: now } }, { date: { $gte: now } }];
      filter.status = { $in: ACTIVE_TOUR_STATUSES };
    }
    const currentPage = Math.max(Number(page) || 1, 1);
    const pageLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
    const [tours, total] = await Promise.all([
      Tour.find(filter).populate("assignedGuide", "name email phone position availability").populate("assignedDriver", "name email phone position availability").populate("assignedVehicle", "name registrationNumber type capacity status").populate("createdBy", "name email").sort({ startDate: 1, date: 1, createdAt: -1 }).skip((currentPage - 1) * pageLimit).limit(pageLimit).lean(),
      Tour.countDocuments(filter),
    ]);
    return res.status(200).json({ success: true, count: tours.length, total, data: tours, tours, pagination: { total, page: currentPage, limit: pageLimit, pages: Math.ceil(total / pageLimit) } });
  } catch (error) { next(error); }
};

export const updateTour = async (req, res, next) => {
  requireTenantId();
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tour ID" });
    if (req.body?.assignedGuide || req.body?.assignedDriver || req.body?.assignedVehicle) return res.status(400).json({ success: false, message: "Use the assignment endpoint to change tour resources." });
    const tour = await Tour.findOneAndUpdate(mergeTenantFilter(req, { _id: req.params.id, isDeleted: { $ne: true } }), req.body, { new: true, runValidators: true });
    if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });
    return res.status(200).json({ success: true, message: "Tour updated successfully", data: tour });
  } catch (error) { next(error); }
};

export const deleteTour = async (req, res, next) => {
  requireTenantId();
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tour ID" });
    const result = await cancelTourAndBookings({
      tourId: req.params.id,
      reason: req.body?.reason || "Tour deleted/cancelled by tour manager",
      deleted: true,
      userId: req.user?._id || null,
    });
    return res.status(200).json({ success: true, message: "Tour deleted after cancelling/reconciling active bookings.", data: result.tour, bookingsAffected: result.bookingsAffected });
  } catch (error) { next(error); }
};

export const assignTourGuide = async (req, res, next) => {
  try {
    const { tourId, guideId } = req.body;
    if (!tourId || !guideId) return res.status(400).json({ success: false, message: "tourId and guideId are required" });
    if (!mongoose.Types.ObjectId.isValid(tourId) || !mongoose.Types.ObjectId.isValid(guideId)) return res.status(400).json({ success: false, message: "Invalid tour or guide ID" });
    req.params.id = tourId; req.body = { guideId }; return assignTourResources(req, res, next);
  } catch (error) { next(error); }
};

export const cancelBooking = async (req, res, next) => {
  requireTenantId();
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid booking ID" });
    const booking = await Booking.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (["cancelled", "refunded", "completed"].includes(booking.status)) return res.status(400).json({ success: false, message: `A ${booking.status} booking cannot be cancelled.` });
    booking.status = "cancelled"; booking.cancelledAt = new Date(); booking.cancelledBy = req.user._id; booking.cancellationReason = String(req.body?.reason || "Cancelled by tour manager"); await booking.save();
    if (booking.tour) {
      const tour = await Tour.findOne(mergeTenantFilter(req, { _id: booking.tour, isDeleted: { $ne: true } }));
      if (tour) {
        const guests = Number(booking.numberOfGuests || booking.guests || booking.numberOfPeople || 1);
        tour.availabilitySettings = tour.availabilitySettings || {};
        const capacity = Number(tour.availabilitySettings.totalSlots || tour.capacity || 0);
        tour.availabilitySettings.bookedSlots = Math.max(0, Number(tour.availabilitySettings.bookedSlots || 0) - guests);
        if (capacity && tour.availabilitySettings.bookedSlots < capacity && ["fully-booked", "full"].includes(tour.status)) { tour.status = "upcoming"; tour.available = true; }
        await tour.save();
      }
    }
    const updated = await Booking.findOne(mergeTenantFilter(req, { _id: booking._id })).populate("user", "name email phone").populate("customer", "name email phone").populate("tour", "title").lean();
    return res.status(200).json({ success: true, message: "Booking cancelled successfully.", booking: updated, data: updated });
  } catch (error) { next(error); }
};

export const completeBooking = async (req, res, next) => {
  requireTenantId();
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid booking ID" });
    const booking = await Booking.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (["cancelled", "refunded"].includes(booking.status)) return res.status(400).json({ success: false, message: `A ${booking.status} booking cannot be completed.` });
    if (booking.status === "completed") return res.status(200).json({ success: true, message: "Booking is already completed.", data: booking, booking });
    if (booking.paymentStatus !== "paid") return res.status(400).json({ success: false, message: "Only paid bookings can be marked as completed." });
    booking.status = "completed"; booking.completedAt = new Date(); await booking.save();
    const updatedBooking = await Booking.findOne(mergeTenantFilter(req, { _id: booking._id })).populate("user", "name email phone").populate("customer", "name email phone").populate("tour", "title").populate("assignedGuide", "name email phone").populate("assignedDriver", "name email phone").populate("assignedVehicle", "name registrationNumber").lean();
    return res.status(200).json({ success: true, message: "Booking marked as completed.", data: updatedBooking, booking: updatedBooking });
  } catch (error) { next(error); }
};
