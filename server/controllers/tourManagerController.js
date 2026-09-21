import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import mongoose from "mongoose";
import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import Staff from "../models/Staff.js";
import Vehicle from "../models/Vehicle.js";
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

