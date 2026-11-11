/**
 * Purpose: tour Manager Controller HTTP controller. Main declarations: getTourManagerDashboard, cleanText, getTours.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Load ../models/Staff.js so this module can use its exported dependencies.
import Staff from "../models/Staff.js";
// Load ../models/Vehicle.js so this module can use its exported dependencies.
import Vehicle from "../models/Vehicle.js";
// Load ../services/bookingRevenueService.js so this module can use its exported dependencies.
import { getBookingRevenueMetrics } from "../services/bookingRevenueService.js";
// Load ../services/tourCancellationService.js so this module can use its exported dependencies.
import { cancelTourAndBookings } from "../services/tourCancellationService.js";

// Declare ACTIVE_TOUR_STATUSES for use by the surrounding module or function.
const ACTIVE_TOUR_STATUSES = ["scheduled", "upcoming", "confirmed", "active", "ongoing"];
// Declare BOOKING_GUEST_STATUSES for use by the surrounding module or function.
const BOOKING_GUEST_STATUSES = ["confirmed", "assigned", "ongoing", "completed"];

// Declare getTourManagerDashboard for use by the surrounding module or function.
export const getTourManagerDashboard = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare now for use by the surrounding module or function.
    const now = new Date();
    // Declare tourFilter for use by the surrounding module or function.
    const tourFilter = mergeTenantFilter(req, { isDeleted: { $ne: true } });
    // Declare bookingFilter for use by the surrounding module or function.
    const bookingFilter = mergeTenantFilter(req, { isDeleted: { $ne: true } });
    // Declare customerFilter for use by the surrounding module or function.
    const customerFilter = mergeTenantFilter(req, { $or: [{ role: "customer" }, { legacyRole: "customer" }] });
    // Declare paymentFilter for use by the surrounding module or function.
    const paymentFilter = mergeTenantFilter(req, { status: "completed", isDeleted: { $ne: true } });
    // Declare upcomingFilter for use by the surrounding module or function.
    const upcomingFilter = mergeTenantFilter(req, {
      isDeleted: { $ne: true },
      $or: [{ startDate: { $gte: now } }, { date: { $gte: now } }],
      status: { $in: ACTIVE_TOUR_STATUSES },
    });

    // Declare [totalTours, upcomingToursCount, totalCustomers, revenueResult, upcomingTours, recentBookings] for use by the surrounding module or function.
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
        .populate("customer", "name firstName lastName email phone")
        .populate("user", "name email phone")
        .populate("tour", "title")
        .populate("customTourRequest", "destination")
        .sort({ createdAt: -1 }).limit(6).lean(),
    ]);

    // Declare tourIds for use by the surrounding module or function.
    const tourIds = upcomingTours.map((tour) => tour._id);
    // Declare guestStats for use by the surrounding module or function.
    const guestStats = tourIds.length ? await Booking.aggregate([
      { $match: mergeTenantFilter(req, { tour: { $in: tourIds }, isDeleted: { $ne: true }, $or: [{ status: { $in: BOOKING_GUEST_STATUSES } }, { paymentStatus: "paid" }] }) },
      { $group: { _id: "$tour", guests: { $sum: { $ifNull: ["$numberOfGuests", { $ifNull: ["$guests", { $ifNull: ["$numberOfPeople", 1] }] }] } } } },
    ]) : [];
    // Declare guestMap for use by the surrounding module or function.
    const guestMap = new Map(guestStats.map((item) => [item._id.toString(), Number(item.guests || 0)]));

    // Declare formattedTours for use by the surrounding module or function.
    const formattedTours = upcomingTours.map((tour) => {
      // Declare guests for use by the surrounding module or function.
      const guests = guestMap.get(tour._id.toString()) || 0;
      // Declare capacity for use by the surrounding module or function.
      const capacity = Number(tour.capacity || tour.availabilitySettings?.totalSlots || 0);
      // Return the object assembled below to the caller.
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

    // Declare cleanText for use by the surrounding module or function.
    const cleanText = (value) => {
      // Declare text for use by the surrounding module or function.
      const text = String(value ?? "").trim().replace(/\s+/g, " ");
      // Return the expression shown below to the caller.
      return text && !/^(?:undefined(?:\s+undefined)?|null(?:\s+null)?)$/i.test(text) ? text : "";
    };
    // Declare formattedBookings for use by the surrounding module or function.
    const formattedBookings = recentBookings.map((booking) => {
      // Declare customer for use by the surrounding module or function.
      const customer = booking.customer || {};
      // Declare user for use by the surrounding module or function.
      const user = booking.user || {};
      // Declare snapshot for use by the surrounding module or function.
      const snapshot = booking.customerSnapshot || {};
      // Declare contact for use by the surrounding module or function.
      const contact = booking.contact || {};
      // Declare customerName for use by the surrounding module or function.
      const customerName = [
        customer.name,
        [customer.firstName, customer.lastName].filter(Boolean).join(" "),
        snapshot.name,
        contact.name,
        user.name,
      ].map(cleanText).find(Boolean);
      // Declare customerEmail for use by the surrounding module or function.
      const customerEmail = [customer.email, snapshot.email, contact.email, user.email].map(cleanText).find(Boolean);
      // Declare customerPhone for use by the surrounding module or function.
      const customerPhone = [customer.phone, snapshot.phone, contact.phone, user.phone].map(cleanText).find(Boolean);
      // Declare tour for use by the surrounding module or function.
      const tour = booking.tour || (booking.customTourRequest?.destination
        ? { title: `Custom tour — ${booking.customTourRequest.destination}`, custom: true }
        : { title: "Tour record unavailable" });
      // Return the object assembled below to the caller.
      return {
        id: booking._id, _id: booking._id,
        bookingNumber: booking.bookingNumber || null,
        customer: { ...customer, name: customerName || customerEmail || customerPhone || "Customer record unavailable", email: customerEmail || "", phone: customerPhone || "" },
        tour,
        guests: Number(booking.numberOfGuests || booking.guests || booking.numberOfPeople || 0),
        paymentStatus: booking.paymentStatus || booking.payment?.status || "pending",
        amount: Number(booking.totalAmount ?? booking.amount ?? booking.price ?? 0),
        status: booking.status || "pending",
        travelDate: booking.travelDate || booking.date || null,
      };
    });

    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, data: {
      stats: { totalTours, upcomingTours: upcomingToursCount, totalCustomers, revenue: Number(revenueResult?.revenue || 0), revenueSource: "paid_booking_value" },
      upcomingTours: formattedTours, recentBookings: formattedBookings,
    } });
  } catch (error) { console.error("TOUR MANAGER DASHBOARD ERROR:", error); next(error); }
};

// Declare getTours for use by the surrounding module or function.
export const getTours = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { upcoming, page = 1, limit = 10, status } for use by the surrounding module or function.
    const { upcoming, page = 1, limit = 10, status } = req.query;
    // Declare filter for use by the surrounding module or function.
    const filter = mergeTenantFilter(req, { isDeleted: { $ne: true } });
    // Check the condition (status) and run the matching branch.
    if (status) filter.status = status;
    // Check the condition (upcoming === "true" || upcoming === "1") and run the matching branch.
    if (upcoming === "true" || upcoming === "1") {
      // Declare now for use by the surrounding module or function.
      const now = new Date();
      // Perform the side effect or state update expressed on the following line.
      filter.$or = [{ startDate: { $gte: now } }, { date: { $gte: now } }];
      // Perform the side effect or state update expressed on the following line.
      filter.status = { $in: ACTIVE_TOUR_STATUSES };
    }
    // Declare currentPage for use by the surrounding module or function.
    const currentPage = Math.max(Number(page) || 1, 1);
    // Declare pageLimit for use by the surrounding module or function.
    const pageLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
    // Declare [tours, total] for use by the surrounding module or function.
    const [tours, total] = await Promise.all([
      Tour.find(filter).populate("assignedGuide", "name email phone position availability").populate("assignedDriver", "name email phone position availability").populate("assignedVehicle", "name registrationNumber type capacity status").populate("createdBy", "name email").sort({ startDate: 1, date: 1, createdAt: -1 }).skip((currentPage - 1) * pageLimit).limit(pageLimit).lean(),
      Tour.countDocuments(filter),
    ]);
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, count: tours.length, total, data: tours, tours, pagination: { total, page: currentPage, limit: pageLimit, pages: Math.ceil(total / pageLimit) } });
  } catch (error) { next(error); }
};

