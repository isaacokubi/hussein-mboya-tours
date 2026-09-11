import Hotel from "../models/Hotel.js";
import HotelRoomType from "../models/HotelRoomType.js";
import HotelBooking from "../models/HotelBooking.js";
import AirportTransfer from "../models/AirportTransfer.js";
import AirportTransferBooking from "../models/AirportTransferBooking.js";

const tenantIdOf = (req) => req.tenantId || req.user?.tenantId || null;
const roleOf = (req) => String(req.userRole || req.user?.role || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
const staffRoles = new Set(["admin", "manager", "tour_manager", "tourmanager", "agent", "super_admin", "superadmin"]);

const requireTenant = (req, res) => {
  const tenantId = tenantIdOf(req);
  if (!tenantId) {
    res.status(400).json({ success: false, message: "Tenant context is required for hospitality operations." });
    return null;
  }
  return tenantId;
};

const requireBookingAccess = (req, res) => {
  const role = roleOf(req);
  if (!staffRoles.has(role) && role !== "customer") {
    res.status(403).json({ success: false, message: "Not allowed." });
    return false;
  }
  return true;
};

export const listAdminHotelsSafe = async (req, res, next) => {
  try {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    const filter = { tenantId };
    if (req.query.status) filter.status = req.query.status;
    const hotels = await Hotel.find(filter).sort({ createdAt: -1, name: 1 }).lean();
    if (!hotels.length) return res.json({ success: true, data: [] });
    const hotelIds = hotels.map((hotel) => hotel._id);
    const rooms = await HotelRoomType.find({ tenantId, hotel: { $in: hotelIds } }).sort({ nightlyRate: 1, name: 1 }).lean();
    const roomsByHotel = new Map();
    for (const room of rooms) {
      const key = String(room.hotel);
      const current = roomsByHotel.get(key) || [];
      current.push(room);
      roomsByHotel.set(key, current);
    }
    res.json({ success: true, data: hotels.map((hotel) => ({ ...hotel, roomTypes: roomsByHotel.get(String(hotel._id)) || [] })) });
  } catch (error) {
    next(error);
  }
};

export const listAdminTransfersSafe = async (req, res, next) => {
  try {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    const filter = { tenantId };
    if (req.query.status) filter.status = req.query.status;
    const transfers = await AirportTransfer.find(filter).sort({ createdAt: -1, airportCode: 1, price: 1, name: 1 }).lean();
    res.json({ success: true, data: transfers });
  } catch (error) {
    next(error);
  }
};

export const listHotelBookingsSafe = async (req, res, next) => {
  try {
    if (!requireBookingAccess(req, res)) return;
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    const role = roleOf(req);
    const filter = { tenantId };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.customerId) filter.customer = req.query.customerId;
    if (role === "customer") filter.user = req.user._id;
    const rows = await HotelBooking.find(filter).sort({ checkIn: 1, createdAt: -1 }).lean();
    if (!rows.length) return res.json({ success: true, data: [] });
    const hotelIds = [...new Set(rows.map((row) => String(row.hotel)).filter(Boolean))];
    const roomIds = [...new Set(rows.map((row) => String(row.roomType)).filter(Boolean))];
    const [hotels, rooms] = await Promise.all([
      hotelIds.length ? Hotel.find({ tenantId, _id: { $in: hotelIds } }).select("name city county").lean() : [],
      roomIds.length ? HotelRoomType.find({ tenantId, _id: { $in: roomIds } }).select("name nightlyRate").lean() : [],
    ]);
    const hotelMap = new Map(hotels.map((hotel) => [String(hotel._id), hotel]));
    const roomMap = new Map(rooms.map((room) => [String(room._id), room]));
    res.json({ success: true, data: rows.map((row) => ({ ...row, hotel: hotelMap.get(String(row.hotel)) || null, roomType: roomMap.get(String(row.roomType)) || null })) });
  } catch (error) {
    next(error);
  }
};

export const listTransferBookingsSafe = async (req, res, next) => {
  try {
    if (!requireBookingAccess(req, res)) return;
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    const role = roleOf(req);
    const filter = { tenantId };
    if (req.query.status) filter.status = req.query.status;
    if (role === "customer") filter.user = req.user._id;
    const rows = await AirportTransferBooking.find(filter).sort({ pickupDateTime: 1, createdAt: -1 }).lean();
    if (!rows.length) return res.json({ success: true, data: [] });
    const transferIds = [...new Set(rows.map((row) => String(row.transfer)).filter(Boolean))];
    const transfers = transferIds.length
      ? await AirportTransfer.find({ tenantId, _id: { $in: transferIds } }).select("name airportName airportCode vehicleType").lean()
      : [];
    const transferMap = new Map(transfers.map((transfer) => [String(transfer._id), transfer]));
    res.json({ success: true, data: rows.map((row) => ({ ...row, transfer: transferMap.get(String(row.transfer)) || null })) });
  } catch (error) {
    next(error);
  }
};
