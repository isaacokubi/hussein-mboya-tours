import Hotel from "../models/Hotel.js";
import HotelRoomType from "../models/HotelRoomType.js";
import HotelBooking from "../models/HotelBooking.js";
import Customer from "../models/Customer.js";
import { ensureHospitalityInvoice } from "../services/hospitalityInvoiceService.js";

const tenantIdOf = (req) => req.tenantId || req.user?.tenantId;
const clean = (value) => String(value ?? "").trim();
const nightsBetween = (from, to) => Math.ceil((new Date(to) - new Date(from)) / 86400000);
const ref = () => `HTL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

async function resolveCustomer(req, body) {
  if (!req.user?._id) return null;
  const tenantId = tenantIdOf(req);
  let customer = await Customer.findOne({ tenantId, user: req.user._id });
  if (customer) return customer;
  const name = clean(`${req.user.firstName || ""} ${req.user.lastName || ""} ${req.user.name || ""}`).trim().split(/\s+/);
  const firstName = clean(body.firstName || name[0] || "Guest");
  const lastName = clean(body.lastName || name.slice(1).join(" ") || "Customer");
  const phone = clean(body.phone || req.user.phone);
  if (!phone) return null;
  return Customer.create({ tenantId, user: req.user._id, firstName, lastName, email: clean(body.email || req.user.email), phone, createdBy: req.user._id, updatedBy: req.user._id });
}

export async function createEnhancedHotelBooking(req, res, next) {
  try {
    const tenantId = tenantIdOf(req);
    const hotel = await Hotel.findOne({ _id: req.body.hotelId, tenantId, status: "active" });
    const room = await HotelRoomType.findOne({ _id: req.body.roomTypeId, tenantId, hotel: req.body.hotelId, status: "active" });
    if (!hotel || !room) return res.status(404).json({ success: false, message: "Hotel or room type not found." });
    const checkIn = new Date(req.body.checkIn), checkOut = new Date(req.body.checkOut), nights = nightsBetween(checkIn, checkOut);
    const rooms = Number(req.body.rooms || 1), adults = Number(req.body.adults || 1), children = Number(req.body.children || 0);
    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime()) || nights <= 0 || !Number.isInteger(rooms) || rooms < 1 || adults < 1) return res.status(400).json({ success: false, message: "Valid check-in, check-out, rooms and guests are required." });
    if (adults > rooms * room.maxAdults || children > rooms * room.maxChildren) return res.status(400).json({ success: false, message: "Guest count exceeds the selected room capacity." });
    const overlap = await HotelBooking.aggregate([{ $match: { tenantId, roomType: room._id, status: { $nin: ["cancelled", "no_show"] }, checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } } }, { $group: { _id: null, rooms: { $sum: "$rooms" } } }]);
    const bookedRooms = Number(overlap[0]?.rooms || 0), available = Math.max(Number(room.totalRooms || 0) - bookedRooms, 0);
    if (rooms > available) return res.status(409).json({ success: false, message: `Only ${available} room(s) are available for those dates.` });
    const customer = await resolveCustomer(req, req.body);
    if (req.user?.role === "customer" && !customer) return res.status(400).json({ success: false, message: "A customer phone number is required to complete the booking." });
    const subtotal = nights * rooms * Number(room.nightlyRate || 0), taxes = Number(req.body.taxes || 0), fees = Number(req.body.fees || 0);
    const booking = await HotelBooking.create({ tenantId, reference: ref(), hotel: hotel._id, roomType: room._id, customer: customer?._id || null, user: req.user?._id || null, linkedBooking: req.body.linkedBooking || null, checkIn, checkOut, estimatedArrivalTime: clean(req.body.estimatedArrivalTime), rooms, adults, children, guests: Array.isArray(req.body.guests) ? req.body.guests : [], mealPlan: req.body.mealPlan || "room_only", bedPreference: clean(req.body.bedPreference), dietaryRequirements: clean(req.body.dietaryRequirements), accessibilityNeeds: clean(req.body.accessibilityNeeds), airportTransferRequired: Boolean(req.body.airportTransferRequired), specialRequests: clean(req.body.specialRequests), status: "pending", paymentStatus: "pending", source: req.body.source || "website", subtotal, taxes, fees, totalAmount: subtotal + taxes + fees, currency: hotel.currency || room.currency || "KES", createdBy: req.user?._id || null, updatedBy: req.user?._id || null });
    const invoice = await ensureHospitalityInvoice({ type: "hotel", booking });
    res.status(201).json({ success: true, data: booking, invoice: invoice || null, paymentRequired: booking.totalAmount > 0 });
  } catch (error) { next(error); }
}
