/**
 * Purpose: hospitality Inventory Concurrency Controller HTTP controller. Main declarations: tenantIdOf, clean, nightsBetween, bookingReference, resolveCustomer.
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
// Load ../services/hospitalityInventoryConcurrencyService.js so this module can use its exported dependencies.
import { acquireRoomInventoryGuard } from "../services/hospitalityInventoryConcurrencyService.js";

// Declare tenantIdOf for use by the surrounding module or function.
const tenantIdOf = req => req.tenantId || req.user?.tenantId;
// Declare clean for use by the surrounding module or function.
const clean = value => String(value ?? "").trim();
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
  // Declare parts for use by the surrounding module or function.
  const parts = clean(`${req.user.firstName || ""} ${req.user.lastName || ""} ${req.user.name || ""}`).split(/\s+/).filter(Boolean);
  // Declare firstName for use by the surrounding module or function.
  const firstName = clean(body.firstName || parts[0] || "Guest");
  // Declare lastName for use by the surrounding module or function.
  const lastName = clean(body.lastName || parts.slice(1).join(" ") || "Customer");
  // Declare phone for use by the surrounding module or function.
  const phone = clean(body.phone || req.user.phone);
  // Check the condition (!phone) and run the matching branch.
  if (!phone) return null;
  // Return the result of Customer.create() to the caller.
  return Customer.create({ tenantId, user: req.user._id, firstName, lastName, email: clean(body.email || req.user.email), phone, createdBy: req.user._id, updatedBy: req.user._id });
}

// Define reserveInventoryVersion; its parameters and body implement this operation.
async function reserveInventoryVersion(roomTypeId, tenantId, attempts = 3) {
  // Repeat the enclosed work for each required iteration.
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    // Declare room for use by the surrounding module or function.
    const room = await HotelRoomType.findOne({ _id: roomTypeId, tenantId }).select("inventoryVersion").lean();
    // Check the condition (!room) and run the matching branch.
    if (!room) return null;
    // Declare guarded for use by the surrounding module or function.
    const guarded = await acquireRoomInventoryGuard({ roomTypeId, tenantId, expectedVersion: Number(room.inventoryVersion || 0) });
    // Check the condition (guarded) and run the matching branch.
    if (guarded) return guarded;
  }
  // Return the expression shown below to the caller.
  return null;
}

// Define createConcurrentSafeHotelBooking; its parameters and body implement this operation.
export async function createConcurrentSafeHotelBooking(req, res, next) {
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
    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime()) || checkOut <= checkIn || !Number.isInteger(rooms) || rooms < 1 || !Number.isInteger(adults) || adults < 1 || !Number.isInteger(children) || children < 0) return res.status(400).json({ success: false, message: "Valid check-in, check-out, rooms and guests are required." });

    // Declare nights for use by the surrounding module or function.
    const nights = nightsBetween(checkIn, checkOut);
    // Check the condition (adults > rooms * Number(room.maxAdults || 1) || children > rooms * Num) and run the matching branch.
    if (adults > rooms * Number(room.maxAdults || 1) || children > rooms * Number(room.maxChildren || 0)) return res.status(400).json({ success: false, message: "Guest count exceeds the selected room capacity." });

    // Declare guard for use by the surrounding module or function.
    const guard = await reserveInventoryVersion(room._id, tenantId);
    // Check the condition (!guard) and run the matching branch.
    if (!guard) return res.status(409).json({ success: false, message: "Room inventory changed while this booking was being processed. Please retry." });

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
    const booking = await HotelBooking.create({ tenantId, reference: bookingReference(), hotel: hotel._id, roomType: room._id, ratePlan: rate?._id || null, customer: customer?._id || null, user: req.user?._id || null, linkedBooking: req.body.linkedBooking || null, checkIn, checkOut, estimatedArrivalTime: clean(req.body.estimatedArrivalTime), rooms, adults, children, guests: Array.isArray(req.body.guests) ? req.body.guests : [], mealPlan: req.body.mealPlan || rate?.mealPlan || "room_only", bedPreference: clean(req.body.bedPreference), dietaryRequirements: clean(req.body.dietaryRequirements), accessibilityNeeds: clean(req.body.accessibilityNeeds), airportTransferRequired: Boolean(req.body.airportTransferRequired), specialRequests: clean(req.body.specialRequests), status: "pending", paymentStatus: "pending", source: req.body.source || "website", subtotal, taxes, fees, totalAmount, currency: rate?.currency || hotel.currency || room.currency || "KES", createdBy: req.user?._id || null, updatedBy: req.user?._id || null });
    // Declare invoice for use by the surrounding module or function.
    const invoice = await ensureHospitalityInvoice({ type: "hotel", booking });
    // Return the result of res.status(201).json() to the caller.
    return res.status(201).json({ success: true, data: booking, invoice: invoice || null, paymentRequired: totalAmount > 0 });
  } catch (error) { return next(error); }
}

// Define createConcurrentSafeRoomBlock; its parameters and body implement this operation.
export async function createConcurrentSafeRoomBlock(req, res, next) {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = tenantIdOf(req);
    // Declare room for use by the surrounding module or function.
    const room = await HotelRoomType.findOne({ _id: req.body.roomTypeId, tenantId, status: "active" }).lean();
    // Check the condition (!room) and run the matching branch.
    if (!room) return res.status(404).json({ success: false, message: "Room type not found." });
    // Declare start, end, quantity for use by the surrounding module or function.
    const start = new Date(req.body.startDate), end = new Date(req.body.endDate), quantity = Number(req.body.quantity);
    // Check the condition (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <=) and run the matching branch.
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start || !Number.isInteger(quantity) || quantity < 1) return res.status(400).json({ success: false, message: "Valid block dates and quantity are required." });
    // Declare guard for use by the surrounding module or function.
    const guard = await reserveInventoryVersion(room._id, tenantId);
    // Check the condition (!guard) and run the matching branch.
    if (!guard) return res.status(409).json({ success: false, message: "Room inventory changed while the block was being processed. Please retry." });
    // Declare [overlap, blocks] for use by the surrounding module or function.
    const [overlap, blocks] = await Promise.all([
      HotelBooking.aggregate([{ $match: { tenantId, roomType: room._id, status: { $nin: ["cancelled", "no_show"] }, checkIn: { $lt: end }, checkOut: { $gt: start } } }, { $group: { _id: null, rooms: { $sum: "$rooms" } } }]),
      HospitalityRoomBlock.aggregate([{ $match: { tenantId, roomType: room._id, status: "blocked", startDate: { $lt: end }, endDate: { $gt: start } } }, { $group: { _id: null, rooms: { $sum: "$quantity" } } }]),
    ]);
    // Declare used for use by the surrounding module or function.
    const used = Number(overlap[0]?.rooms || 0) + Number(blocks[0]?.rooms || 0);
    // Check the condition (used + quantity > Number(room.totalRooms || 0)) and run the matching branch.
    if (used + quantity > Number(room.totalRooms || 0)) return res.status(409).json({ success: false, message: `Only ${Math.max(Number(room.totalRooms || 0) - used, 0)} room(s) can be blocked for those dates.` });
    // Declare block for use by the surrounding module or function.
    const block = await HospitalityRoomBlock.create({ tenantId, hotel: room.hotel, roomType: room._id, startDate: start, endDate: end, quantity, reason: clean(req.body.reason) || "Maintenance", createdBy: req.user?._id || null, updatedBy: req.user?._id || null });
    // Return the result of res.status(201).json() to the caller.
    return res.status(201).json({ success: true, data: block });
  } catch (error) { return next(error); }
}
