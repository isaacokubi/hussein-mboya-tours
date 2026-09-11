import Hotel from "../models/Hotel.js";
import HotelRoomType from "../models/HotelRoomType.js";
import HotelBooking from "../models/HotelBooking.js";
import HospitalityRoomBlock from "../models/HospitalityRoomBlock.js";
import HospitalityRatePlan from "../models/HospitalityRatePlan.js";

const tenantIdOf = (req) => req.tenantId || req.user?.tenantId;
const nightsBetween = (from, to) => Math.ceil((new Date(to) - new Date(from)) / 86400000);

export async function checkHotelAvailability(req, res, next) {
  try {
    const tenantId = tenantIdOf(req);
    const { hotelId, checkIn, checkOut, ratePlanId } = req.query;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (!tenantId) return res.status(400).json({ success: false, message: "Tenant context is required." });
    if (!hotelId || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return res.status(400).json({ success: false, message: "Valid hotel, check-in and check-out dates are required." });

    const hotel = await Hotel.findOne({ _id: hotelId, tenantId, status: "active" }).lean();
    if (!hotel) return res.status(404).json({ success: false, message: "Hotel not found." });
    const rooms = await HotelRoomType.find({ tenantId, hotel: hotel._id, status: "active" }).sort({ nightlyRate: 1 }).lean();
    const nights = nightsBetween(start, end);

    const result = await Promise.all(rooms.map(async (room) => {
      const [booked, blocks, rates] = await Promise.all([
        HotelBooking.aggregate([{ $match: { tenantId, roomType: room._id, status: { $nin: ["cancelled", "no_show"] }, checkIn: { $lt: end }, checkOut: { $gt: start } } }, { $group: { _id: null, rooms: { $sum: "$rooms" } } }]),
        HospitalityRoomBlock.aggregate([{ $match: { tenantId, roomType: room._id, status: "blocked", startDate: { $lt: end }, endDate: { $gt: start } } }, { $group: { _id: null, rooms: { $sum: "$quantity" } } }]),
        HospitalityRatePlan.find({ tenantId, hotel: hotel._id, roomType: room._id, status: "active", $or: [{ validFrom: null }, { validFrom: { $lte: start } }], $and: [{ $or: [{ validTo: null }, { validTo: { $gte: end } }] }] }).sort({ nightlyRate: 1 }).lean(),
      ]);

      const reserved = Number(booked[0]?.rooms || 0);
      const blocked = Number(blocks[0]?.rooms || 0);
      const availableBase = Math.max(Number(room.totalRooms || 0) - reserved - blocked, 0);
      const validRates = rates.filter(r => nights >= Number(r.minNights || 1) && (!r.maxNights || nights <= Number(r.maxNights)));
      const selected = ratePlanId ? validRates.find(r => String(r._id) === String(ratePlanId)) : validRates.find(r => !r.stopSell);
      const selectedStopSell = Boolean(selected?.stopSell);
      const available = selectedStopSell ? 0 : availableBase;
      const nightlyRate = selected?.nightlyRate ?? room.nightlyRate;

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

    return res.json({ success: true, data: { hotel: { _id: hotel._id, name: hotel.name, currency: hotel.currency || "KES", checkInTime: hotel.checkInTime, checkOutTime: hotel.checkOutTime, cancellationPolicy: hotel.cancellationPolicy }, checkIn: start, checkOut: end, nights, roomTypes: result } });
  } catch (error) {
    next(error);
  }
}
