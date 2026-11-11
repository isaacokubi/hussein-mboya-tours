/**
 * Purpose: hotel Availability Controller HTTP controller. Main declarations: tenantIdOf, nightsBetween, checkHotelAvailability.
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

// Declare tenantIdOf for use by the surrounding module or function.
const tenantIdOf = (req) => req.tenantId || req.user?.tenantId;
// Declare nightsBetween for use by the surrounding module or function.
const nightsBetween = (from, to) => Math.ceil((new Date(to) - new Date(from)) / 86400000);

// Define checkHotelAvailability; its parameters and body implement this operation.
export async function checkHotelAvailability(req, res, next) {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = tenantIdOf(req);
    // Declare { hotelId, checkIn, checkOut, ratePlanId } for use by the surrounding module or function.
    const { hotelId, checkIn, checkOut, ratePlanId } = req.query;
    // Declare start for use by the surrounding module or function.
    const start = new Date(checkIn);
    // Declare end for use by the surrounding module or function.
    const end = new Date(checkOut);
    // Check the condition (!tenantId) and run the matching branch.
    if (!tenantId) return res.status(400).json({ success: false, message: "Tenant context is required." });
    // Check the condition (!hotelId || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime() and run the matching branch.
    if (!hotelId || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return res.status(400).json({ success: false, message: "Valid hotel, check-in and check-out dates are required." });

    // Declare hotel for use by the surrounding module or function.
    const hotel = await Hotel.findOne({ _id: hotelId, tenantId, status: "active" }).lean();
    // Check the condition (!hotel) and run the matching branch.
    if (!hotel) return res.status(404).json({ success: false, message: "Hotel not found." });
    // Declare rooms for use by the surrounding module or function.
    const rooms = await HotelRoomType.find({ tenantId, hotel: hotel._id, status: "active" }).sort({ nightlyRate: 1 }).lean();
    // Declare nights for use by the surrounding module or function.
    const nights = nightsBetween(start, end);

    // Declare result for use by the surrounding module or function.
    const result = await Promise.all(rooms.map(async (room) => {
      // Declare [booked, blocks, rates] for use by the surrounding module or function.
      const [booked, blocks, rates] = await Promise.all([
        HotelBooking.aggregate([{ $match: { tenantId, roomType: room._id, status: { $nin: ["cancelled", "no_show"] }, checkIn: { $lt: end }, checkOut: { $gt: start } } }, { $group: { _id: null, rooms: { $sum: "$rooms" } } }]),
        HospitalityRoomBlock.aggregate([{ $match: { tenantId, roomType: room._id, status: "blocked", startDate: { $lt: end }, endDate: { $gt: start } } }, { $group: { _id: null, rooms: { $sum: "$quantity" } } }]),
        HospitalityRatePlan.find({ tenantId, hotel: hotel._id, roomType: room._id, status: "active", $or: [{ validFrom: null }, { validFrom: { $lte: start } }], $and: [{ $or: [{ validTo: null }, { validTo: { $gte: end } }] }] }).sort({ nightlyRate: 1 }).lean(),
      ]);

      // Declare reserved for use by the surrounding module or function.
      const reserved = Number(booked[0]?.rooms || 0);
      // Declare blocked for use by the surrounding module or function.
      const blocked = Number(blocks[0]?.rooms || 0);
      // Declare availableBase for use by the surrounding module or function.
      const availableBase = Math.max(Number(room.totalRooms || 0) - reserved - blocked, 0);
      // Declare validRates for use by the surrounding module or function.
      const validRates = rates.filter(r => nights >= Number(r.minNights || 1) && (!r.maxNights || nights <= Number(r.maxNights)));
      // Declare selected for use by the surrounding module or function.
      const selected = ratePlanId ? validRates.find(r => String(r._id) === String(ratePlanId)) : validRates.find(r => !r.stopSell);
      // Declare selectedStopSell for use by the surrounding module or function.
      const selectedStopSell = Boolean(selected?.stopSell);
      // Declare available for use by the surrounding module or function.
      const available = selectedStopSell ? 0 : availableBase;
      // Declare nightlyRate for use by the surrounding module or function.
      const nightlyRate = selected?.nightlyRate ?? room.nightlyRate;

      // Return the object assembled below to the caller.
      return {
        ...room,
        availableRooms: available,
        reservedRooms: reserved,
        blockedRooms: blocked,
        nights,
        nightlyRate,
        currency: selected?.currency || room.currency,
        ratePlans: validRates.map(r => ({ _id: r._id, name: r.name, code: r.code, nightlyRate: r.nightlyRate, currency: r.currency, mealPlan: r.mealPlan, refundable: r.refundable, cancellationPolicy: r.cancellationPolicy, stopSell: Boolean(r.stopSell), minNights: r.minNights, maxNights: r.maxNights })),
        selectedRatePlan: selected ? { _id: selected._id, name: selected.name, code: selected.code, mealPlan: selected.mealPlan, refundable: selected.refundable, cancellationPolicy: selected.cancellationPolicy, stopSell: selectedStopSell } : null,
        stayTotal: nights * Number(nightlyRate || 0),
      };
    }));

    // Return the result of res.json() to the caller.
    return res.json({ success: true, data: { hotel: { _id: hotel._id, name: hotel.name, currency: hotel.currency || "KES", checkInTime: hotel.checkInTime, checkOutTime: hotel.checkOutTime, cancellationPolicy: hotel.cancellationPolicy }, checkIn: start, checkOut: end, nights, roomTypes: result } });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
}
