import Hotel from "../models/Hotel.js";
import HotelRoomType from "../models/HotelRoomType.js";
import HotelBooking from "../models/HotelBooking.js";

const tenantIdOf = (req) => req.tenantId || req.user?.tenantId;
const nightsBetween = (from, to) => Math.ceil((new Date(to) - new Date(from)) / 86400000);

export async function checkHotelAvailability(req, res, next) {
  try {
    const tenantId = tenantIdOf(req);
    const { hotelId, checkIn, checkOut } = req.query;
    const start = new Date(checkIn);
    const end = new Date(checkOut);

    if (!hotelId || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      return res.status(400).json({ success: false, message: "Valid hotel, check-in and check-out dates are required." });
    }

    const hotel = await Hotel.findOne({ _id: hotelId, tenantId, status: "active" }).lean();
    if (!hotel) return res.status(404).json({ success: false, message: "Hotel not found." });

    const rooms = await HotelRoomType.find({ tenantId, hotel: hotel._id, status: "active" }).sort({ nightlyRate: 1 }).lean();
    const nights = nightsBetween(start, end);
    const result = await Promise.all(rooms.map(async (room) => {
      const booked = await HotelBooking.aggregate([
        { $match: { tenantId, roomType: room._id, status: { $nin: ["cancelled", "no_show"] }, checkIn: { $lt: end }, checkOut: { $gt: start } } },
        { $group: { _id: null, rooms: { $sum: "$rooms" } } },
      ]);
      const reserved = Number(booked[0]?.rooms || 0);
      const available = Math.max(Number(room.totalRooms || 0) - reserved, 0);
      return { ...room, availableRooms: available, reservedRooms: reserved, nights, stayTotal: nights * Number(room.nightlyRate || 0) };
    }));

    res.json({ success: true, data: { hotel: { _id: hotel._id, name: hotel.name, currency: hotel.currency || "KES", checkInTime: hotel.checkInTime, checkOutTime: hotel.checkOutTime, cancellationPolicy: hotel.cancellationPolicy }, checkIn: start, checkOut: end, nights, roomTypes: result } });
  } catch (error) {
    next(error);
  }
}
