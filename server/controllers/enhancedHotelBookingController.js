/**
 * Purpose: enhanced Hotel Booking Controller HTTP controller. Main declarations: tenantIdOf, clean, nightsBetween, bookingReference, resolveCustomer.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import Hotel from "../models/Hotel.js";
// Load ../models/HotelRoomType.js so this module can use its exported dependencies.
import HotelRoomType from "../models/HotelRoomType.js";
// Load ../models/HotelBooking.js so this module can use its exported dependencies.
import HotelBooking from "../models/HotelBooking.js";
// Load ../models/HospitalityRoomBlock.js so this module can use its exported dependencies.
import HospitalityRoomBlock from "../models/HospitalityRoomBlock.js";
// Load ../models/HospitalityRatePlan.js so this module can use its exported dependencies.
import HospitalityRatePlan from "../models/HospitalityRatePlan.js";
// Load ../models/Customer.js so this module can use its exported dependencies.
import Customer from "../models/Customer.js";
// Load ../services/hospitalityInvoiceService.js so this module can use its exported dependencies.
import { ensureHospitalityInvoice } from "../services/hospitalityInvoiceService.js";

// Declare tenantIdOf for use by the surrounding module or function.
const tenantIdOf = (req) => req.tenantId || req.user?.tenantId;
// Declare clean for use by the surrounding module or function.
const clean = (value) => String(value ?? "").trim();
// Declare nightsBetween for use by the surrounding module or function.
const nightsBetween = (from, to) => Math.ceil((new Date(to) - new Date(from)) / 86400000);
// Declare bookingReference for use by the surrounding module or function.
const bookingReference = () => `HTL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

// Define resolveCustomer; its parameters and body implement this operation.
async function resolveCustomer(req, body) {
  // Check the condition (!req.user?._id) and run the matching branch.
  if (!req.user?._id) return null;
  // Declare tenantId for use by the surrounding module or function.
  const tenantId = tenantIdOf(req);
  // Declare customer for use by the surrounding module or function.
  let customer = await Customer.findOne({ tenantId, user: req.user._id });
  // Check the condition (customer) and run the matching branch.
  if (customer) return customer;
  // Declare nameParts for use by the surrounding module or function.
  const nameParts = clean(`${req.user.firstName || ""} ${req.user.lastName || ""} ${req.user.name || ""}`).trim().split(/\s+/).filter(Boolean);
  // Declare firstName for use by the surrounding module or function.
  const firstName = clean(body.firstName || nameParts[0] || "Guest");
  // Declare lastName for use by the surrounding module or function.
  const lastName = clean(body.lastName || nameParts.slice(1).join(" ") || "Customer");
  // Declare phone for use by the surrounding module or function.
  const phone = clean(body.phone || req.user.phone);
  // Check the condition (!phone) and run the matching branch.
  if (!phone) return null;
  // Return the result of Customer.create() to the caller.
  return Customer.create({ tenantId, user: req.user._id, firstName, lastName, email: clean(body.email || req.user.email), phone, createdBy: req.user._id, updatedBy: req.user._id });
}

// Define createEnhancedHotelBooking; its parameters and body implement this operation.
export async function createEnhancedHotelBooking(req, res, next) {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = tenantIdOf(req);
    // Declare { hotelId, roomTypeId } for use by the surrounding module or function.
    const { hotelId, roomTypeId } = req.body;
    // Check the condition (!tenantId || !hotelId || !roomTypeId) and run the matching branch.
    if (!tenantId || !hotelId || !roomTypeId) return res.status(400).json({ success: false, message: "Hotel, room type and tenant context are required." });

    // Declare [hotel, room] for use by the surrounding module or function.
    const [hotel, room] = await Promise.all([
      Hotel.findOne({ _id: hotelId, tenantId, status: "active" }).lean(),
      HotelRoomType.findOne({ _id: roomTypeId, tenantId, hotel: hotelId, status: "active" }).lean(),
    ]);
    // Check the condition (!hotel || !room) and run the matching branch.
    if (!hotel || !room) return res.status(404).json({ success: false, message: "Hotel or room type not found." });

    // Declare checkIn for use by the surrounding module or function.
    const checkIn = new Date(req.body.checkIn);
    // Declare checkOut for use by the surrounding module or function.
    const checkOut = new Date(req.body.checkOut);
    // Declare rooms for use by the surrounding module or function.
    const rooms = Number(req.body.rooms || 1);
    // Declare adults for use by the surrounding module or function.
    const adults = Number(req.body.adults || 1);
    // Declare children for use by the surrounding module or function.
    const children = Number(req.body.children || 0);
    // Check the condition (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime()) ||) and run the matching branch.
    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime()) || checkOut <= checkIn || !Number.isInteger(rooms) || rooms < 1 || !Number.isInteger(adults) || adults < 1 || !Number.isInteger(children) || children < 0) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "Valid check-in, check-out, rooms and guests are required." });
    }

    // Declare nights for use by the surrounding module or function.
    const nights = nightsBetween(checkIn, checkOut);
    // Check the condition (adults > rooms * Number(room.maxAdults || 1) || children > rooms * Num) and run the matching branch.
    if (adults > rooms * Number(room.maxAdults || 1) || children > rooms * Number(room.maxChildren || 0)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "Guest count exceeds the selected room capacity." });
    }

    // Declare [overlap, blockAgg, rates] for use by the surrounding module or function.
    const [overlap, blockAgg, rates] = await Promise.all([
      HotelBooking.aggregate([{ $match: { tenantId, roomType: room._id, status: { $nin: ["cancelled", "no_show"] }, checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } } }, { $group: { _id: null, rooms: { $sum: "$rooms" } } }]),
      HospitalityRoomBlock.aggregate([{ $match: { tenantId, roomType: room._id, status: "blocked", startDate: { $lt: checkOut }, endDate: { $gt: checkIn } } }, { $group: { _id: null, rooms: { $sum: "$quantity" } } }]),
      HospitalityRatePlan.find({ tenantId, hotel: hotel._id, roomType: room._id, status: "active", $or: [{ validFrom: null }, { validFrom: { $lte: checkIn } }], $and: [{ $or: [{ validTo: null }, { validTo: { $gte: checkOut } }] }] }).sort({ nightlyRate: 1 }).lean(),
    ]);

    // Declare bookedRooms for use by the surrounding module or function.
    const bookedRooms = Number(overlap[0]?.rooms || 0);
    // Declare blockedRooms for use by the surrounding module or function.
    const blockedRooms = Number(blockAgg[0]?.rooms || 0);
    // Declare validRates for use by the surrounding module or function.
    const validRates = rates.filter(item => nights >= Number(item.minNights || 1) && (!item.maxNights || nights <= Number(item.maxNights)));
    // Declare requestedRateId for use by the surrounding module or function.
    const requestedRateId = clean(req.body.ratePlanId);
    // Declare rate for use by the surrounding module or function.
    const rate = requestedRateId ? validRates.find(item => String(item._id) === requestedRateId) : validRates.find(item => !item.stopSell);

    // Check the condition (requestedRateId && !rate) and run the matching branch.
    if (requestedRateId && !rate) return res.status(409).json({ success: false, message: "The selected rate plan is not valid for this room and stay dates." });
    // Check the condition (rate?.stopSell) and run the matching branch.
    if (rate?.stopSell) return res.status(409).json({ success: false, message: "This rate plan is currently stop-sold for the selected stay." });

    // Declare availableRooms for use by the surrounding module or function.
    const availableRooms = Math.max(Number(room.totalRooms || 0) - bookedRooms - blockedRooms, 0);
    // Check the condition (rooms > availableRooms) and run the matching branch.
    if (rooms > availableRooms) return res.status(409).json({ success: false, message: `Only ${availableRooms} room(s) are available for those dates.` });

    // Declare customer for use by the surrounding module or function.
    const customer = await resolveCustomer(req, req.body);
    // Check the condition (req.user?.role === "customer" && !customer) and run the matching branch.
    if (req.user?.role === "customer" && !customer) return res.status(400).json({ success: false, message: "A customer phone number is required to complete the booking." });

    // Declare nightlyRate for use by the surrounding module or function.
    const nightlyRate = Number(rate?.nightlyRate ?? room.nightlyRate ?? 0);
    // Declare subtotal for use by the surrounding module or function.
    const subtotal = nights * rooms * nightlyRate;
    // Declare taxes for use by the surrounding module or function.
    const taxes = Number(req.body.taxes || 0);
    // Declare fees for use by the surrounding module or function.
    const fees = Number(req.body.fees || 0);
    // Declare totalAmount for use by the surrounding module or function.
    const totalAmount = subtotal + taxes + fees;

    // Declare booking for use by the surrounding module or function.
    const booking = await HotelBooking.create({
      tenantId, reference: bookingReference(), hotel: hotel._id, roomType: room._id, ratePlan: rate?._id || null,
      customer: customer?._id || null, user: req.user?._id || null, linkedBooking: req.body.linkedBooking || null,
      checkIn, checkOut, estimatedArrivalTime: clean(req.body.estimatedArrivalTime), rooms, adults, children,
      guests: Array.isArray(req.body.guests) ? req.body.guests : [], mealPlan: req.body.mealPlan || rate?.mealPlan || "room_only",
      bedPreference: clean(req.body.bedPreference), dietaryRequirements: clean(req.body.dietaryRequirements), accessibilityNeeds: clean(req.body.accessibilityNeeds),
      airportTransferRequired: Boolean(req.body.airportTransferRequired), specialRequests: clean(req.body.specialRequests), status: "pending", paymentStatus: "pending",
      source: req.body.source || "website", subtotal, taxes, fees, totalAmount, currency: rate?.currency || hotel.currency || room.currency || "KES",
      createdBy: req.user?._id || null, updatedBy: req.user?._id || null,
    });

    // Declare invoice for use by the surrounding module or function.
    const invoice = await ensureHospitalityInvoice({ type: "hotel", booking });
    // Return the result of res.status(201).json() to the caller.
    return res.status(201).json({ success: true, data: booking, invoice: invoice || null, paymentRequired: totalAmount > 0 });
  } catch (error) {
    // Return the result of next() to the caller.
    return next(error);
  }
}
