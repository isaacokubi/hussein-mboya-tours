import Hotel from "../models/Hotel.js";
import HotelRoomType from "../models/HotelRoomType.js";
import HotelBooking from "../models/HotelBooking.js";
import HospitalityRoomBlock from "../models/HospitalityRoomBlock.js";
import HospitalityRatePlan from "../models/HospitalityRatePlan.js";
import Customer from "../models/Customer.js";
import { ensureHospitalityInvoice } from "../services/hospitalityInvoiceService.js";

const tenantIdOf = (req) => req.tenantId || req.user?.tenantId;
const clean = (value) => String(value ?? "").trim();
const nightsBetween = (from, to) => Math.ceil((new Date(to) - new Date(from)) / 86400000);
const bookingReference = () => `HTL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

async function resolveCustomer(req, body) {
  if (!req.user?._id) return null;
  const tenantId = tenantIdOf(req);
  let customer = await Customer.findOne({ tenantId, user: req.user._id });
  if (customer) return customer;
  const nameParts = clean(`${req.user.firstName || ""} ${req.user.lastName || ""} ${req.user.name || ""}`).trim().split(/\s+/).filter(Boolean);
  const firstName = clean(body.firstName || nameParts[0] || "Guest");
  const lastName = clean(body.lastName || nameParts.slice(1).join(" ") || "Customer");
  const phone = clean(body.phone || req.user.phone);
  if (!phone) return null;
  return Customer.create({ tenantId, user: req.user._id, firstName, lastName, email: clean(body.email || req.user.email), phone, createdBy: req.user._id, updatedBy: req.user._id });
}

export async function createEnhancedHotelBooking(req, res, next) {
  try {
    const tenantId = tenantIdOf(req);
    const { hotelId, roomTypeId } = req.body;
    if (!tenantId || !hotelId || !roomTypeId) return res.status(400).json({ success: false, message: "Hotel, room type and tenant context are required." });

    const [hotel, room] = await Promise.all([
      Hotel.findOne({ _id: hotelId, tenantId, status: "active" }).lean(),
      HotelRoomType.findOne({ _id: roomTypeId, tenantId, hotel: hotelId, status: "active" }).lean(),
    ]);
    if (!hotel || !room) return res.status(404).json({ success: false, message: "Hotel or room type not found." });

    const checkIn = new Date(req.body.checkIn);
    const checkOut = new Date(req.body.checkOut);
    const rooms = Number(req.body.rooms || 1);
    const adults = Number(req.body.adults || 1);
    const children = Number(req.body.children || 0);
    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime()) || checkOut <= checkIn || !Number.isInteger(rooms) || rooms < 1 || !Number.isInteger(adults) || adults < 1 || !Number.isInteger(children) || children < 0) {
      return res.status(400).json({ success: false, message: "Valid check-in, check-out, rooms and guests are required." });
    }

    const nights = nightsBetween(checkIn, checkOut);
    if (adults > rooms * Number(room.maxAdults || 1) || children > rooms * Number(room.maxChildren || 0)) {
      return res.status(400).json({ success: false, message: "Guest count exceeds the selected room capacity." });
    }

    const [overlap, blockAgg, rates] = await Promise.all([
      HotelBooking.aggregate([{ $match: { tenantId, roomType: room._id, status: { $nin: ["cancelled", "no_show"] }, checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } } }, { $group: { _id: null, rooms: { $sum: "$rooms" } } }]),
      HospitalityRoomBlock.aggregate([{ $match: { tenantId, roomType: room._id, status: "blocked", startDate: { $lt: checkOut }, endDate: { $gt: checkIn } } }, { $group: { _id: null, rooms: { $sum: "$quantity" } } }]),
      HospitalityRatePlan.find({ tenantId, hotel: hotel._id, roomType: room._id, status: "active", $or: [{ validFrom: null }, { validFrom: { $lte: checkIn } }], $and: [{ $or: [{ validTo: null }, { validTo: { $gte: checkOut } }] }] }).sort({ nightlyRate: 1 }).lean(),
    ]);

    const bookedRooms = Number(overlap[0]?.rooms || 0);
    const blockedRooms = Number(blockAgg[0]?.rooms || 0);
    const validRates = rates.filter(item => nights >= Number(item.minNights || 1) && (!item.maxNights || nights <= Number(item.maxNights)));
    const requestedRateId = clean(req.body.ratePlanId);
    const rate = requestedRateId ? validRates.find(item => String(item._id) === requestedRateId) : validRates.find(item => !item.stopSell);

    if (requestedRateId && !rate) return res.status(409).json({ success: false, message: "The selected rate plan is not valid for this room and stay dates." });
    if (rate?.stopSell) return res.status(409).json({ success: false, message: "This rate plan is currently stop-sold for the selected stay." });

    const availableRooms = Math.max(Number(room.totalRooms || 0) - bookedRooms - blockedRooms, 0);
    if (rooms > availableRooms) return res.status(409).json({ success: false, message: `Only ${availableRooms} room(s) are available for those dates.` });

    const customer = await resolveCustomer(req, req.body);
    if (req.user?.role === "customer" && !customer) return res.status(400).json({ success: false, message: "A customer phone number is required to complete the booking." });

    const nightlyRate = Number(rate?.nightlyRate ?? room.nightlyRate ?? 0);
    const subtotal = nights * rooms * nightlyRate;
    const taxes = Number(req.body.taxes || 0);
    const fees = Number(req.body.fees || 0);
    const totalAmount = subtotal + taxes + fees;

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

    const invoice = await ensureHospitalityInvoice({ type: "hotel", booking });
    return res.status(201).json({ success: true, data: booking, invoice: invoice || null, paymentRequired: totalAmount > 0 });
  } catch (error) {
    return next(error);
  }
}
