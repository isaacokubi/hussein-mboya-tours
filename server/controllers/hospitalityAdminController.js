import Hotel from "../models/Hotel.js";
import HotelRoomType from "../models/HotelRoomType.js";
import HotelBooking from "../models/HotelBooking.js";
import AirportTransfer from "../models/AirportTransfer.js";
import AirportTransferBooking from "../models/AirportTransferBooking.js";
import Customer from "../models/Customer.js";
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";

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

const ids = (rows, key) => [...new Set(rows.map((row) => row?.[key]).filter(Boolean).map(String))];

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

    const hotelIds = ids(rows, "hotel");
    const roomIds = ids(rows, "roomType");
    const customerIds = ids(rows, "customer");
    const userIds = ids(rows, "user");
    const [hotels, rooms, customers, users] = await Promise.all([
      Hotel.find({ tenantId, _id: { $in: hotelIds } }).select("name city county tenantId").lean(),
      HotelRoomType.find({ tenantId, _id: { $in: roomIds } }).select("name nightlyRate hotel tenantId").lean(),
      customerIds.length ? Customer.find({ tenantId, _id: { $in: customerIds } }).select("firstName lastName email phone tenantId user").lean() : [],
      userIds.length ? User.find({ tenantId, _id: { $in: userIds } }).select("name email phone tenantId").lean() : [],
    ]);
    const hotelMap = new Map(hotels.map((hotel) => [String(hotel._id), hotel]));
    const roomMap = new Map(rooms.map((room) => [String(room._id), room]));
    const customerMap = new Map(customers.map((customer) => [String(customer._id), customer]));
    const userMap = new Map(users.map((user) => [String(user._id), user]));

    const valid = rows.filter((row) => {
      const hotel = hotelMap.get(String(row.hotel));
      const room = roomMap.get(String(row.roomType));
      if (!hotel || !room || String(room.hotel) !== String(row.hotel)) return false;
      if (row.customer && !customerMap.has(String(row.customer))) return false;
      if (row.user && !userMap.has(String(row.user))) return false;
      return true;
    });

    res.json({
      success: true,
      data: valid.map((row) => ({
        ...row,
        hotel: hotelMap.get(String(row.hotel)),
        roomType: roomMap.get(String(row.roomType)),
        customer: row.customer ? customerMap.get(String(row.customer)) || null : null,
        user: row.user ? userMap.get(String(row.user)) || null : null,
      })),
    });
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

    const transferIds = ids(rows, "transfer");
    const customerIds = ids(rows, "customer");
    const userIds = ids(rows, "user");
    const vehicleIds = ids(rows, "assignedVehicle");
    const driverIds = ids(rows, "assignedDriver");
    const [transfers, customers, users, vehicles] = await Promise.all([
      AirportTransfer.find({ tenantId, _id: { $in: transferIds } }).select("name airportName airportCode vehicleType tenantId").lean(),
      customerIds.length ? Customer.find({ tenantId, _id: { $in: customerIds } }).select("firstName lastName email phone tenantId user").lean() : [],
      userIds.length || driverIds.length ? User.find({ tenantId, _id: { $in: [...new Set([...userIds, ...driverIds])] } }).select("name email phone tenantId").lean() : [],
      vehicleIds.length ? Vehicle.find({ tenantId, _id: { $in: vehicleIds } }).select("name registrationNumber plateNumber tenantId").lean() : [],
    ]);
    const transferMap = new Map(transfers.map((transfer) => [String(transfer._id), transfer]));
    const customerMap = new Map(customers.map((customer) => [String(customer._id), customer]));
    const userMap = new Map(users.map((user) => [String(user._id), user]));
    const vehicleMap = new Map(vehicles.map((vehicle) => [String(vehicle._id), vehicle]));

    const valid = rows.filter((row) => {
      if (!transferMap.has(String(row.transfer))) return false;
      if (row.customer && !customerMap.has(String(row.customer))) return false;
      if (row.user && !userMap.has(String(row.user))) return false;
      if (row.assignedVehicle && !vehicleMap.has(String(row.assignedVehicle))) return false;
      if (row.assignedDriver && !userMap.has(String(row.assignedDriver))) return false;
      return true;
    });

    res.json({
      success: true,
      data: valid.map((row) => ({
        ...row,
        transfer: transferMap.get(String(row.transfer)),
        customer: row.customer ? customerMap.get(String(row.customer)) || null : null,
        user: row.user ? userMap.get(String(row.user)) || null : null,
        assignedVehicle: row.assignedVehicle ? vehicleMap.get(String(row.assignedVehicle)) || null : null,
        assignedDriver: row.assignedDriver ? userMap.get(String(row.assignedDriver)) || null : null,
      })),
    });
  } catch (error) {
    next(error);
  }
};
