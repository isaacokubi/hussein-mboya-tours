/**
 * Purpose: hospitality Admin Controller HTTP controller. Main declarations: tenantIdOf, roleOf, requireTenant, requireBookingAccess, ids.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import Hotel from "../models/Hotel.js";
// Load ../models/HotelRoomType.js so this module can use its exported dependencies.
import HotelRoomType from "../models/HotelRoomType.js";
// Load ../models/HotelBooking.js so this module can use its exported dependencies.
import HotelBooking from "../models/HotelBooking.js";
// Load ../models/AirportTransfer.js so this module can use its exported dependencies.
import AirportTransfer from "../models/AirportTransfer.js";
// Load ../models/AirportTransferBooking.js so this module can use its exported dependencies.
import AirportTransferBooking from "../models/AirportTransferBooking.js";
// Load ../models/Customer.js so this module can use its exported dependencies.
import Customer from "../models/Customer.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Vehicle.js so this module can use its exported dependencies.
import Vehicle from "../models/Vehicle.js";

// Declare tenantIdOf for use by the surrounding module or function.
const tenantIdOf = (req) => req.tenantId || req.user?.tenantId || null;
// Declare roleOf for use by the surrounding module or function.
const roleOf = (req) => String(req.userRole || req.user?.role || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
// Declare staffRoles for use by the surrounding module or function.
const staffRoles = new Set(["admin", "manager", "tour_manager", "tourmanager", "agent", "super_admin", "superadmin"]);

// Declare requireTenant for use by the surrounding module or function.
const requireTenant = (req, res) => {
  // Declare tenantId for use by the surrounding module or function.
  const tenantId = tenantIdOf(req);
  // Check the condition (!tenantId) and run the matching branch.
  if (!tenantId) {
    // Perform the side effect or state update expressed on the following line.
    res.status(400).json({ success: false, message: "Tenant context is required for hospitality operations." });
    // Return the expression shown below to the caller.
    return null;
  }
  // Return the value of tenantId to the caller.
  return tenantId;
};

// Declare requireBookingAccess for use by the surrounding module or function.
const requireBookingAccess = (req, res) => {
  // Declare role for use by the surrounding module or function.
  const role = roleOf(req);
  // Check the condition (!staffRoles.has(role) && role !== "customer") and run the matching branch.
  if (!staffRoles.has(role) && role !== "customer") {
    // Perform the side effect or state update expressed on the following line.
    res.status(403).json({ success: false, message: "Not allowed." });
    // Return the expression shown below to the caller.
    return false;
  }
  // Return the expression shown below to the caller.
  return true;
};

// Declare ids for use by the surrounding module or function.
const ids = (rows, key) => [...new Set(rows.map((row) => row?.[key]).filter(Boolean).map(String))];

// Declare listAdminHotelsSafe for use by the surrounding module or function.
export const listAdminHotelsSafe = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenant(req, res);
    // Check the condition (!tenantId) and run the matching branch.
    if (!tenantId) return;
    // Declare filter for use by the surrounding module or function.
    const filter = { tenantId };
    // Check the condition (req.query.status) and run the matching branch.
    if (req.query.status) filter.status = req.query.status;
    // Declare hotels for use by the surrounding module or function.
    const hotels = await Hotel.find(filter).sort({ createdAt: -1, name: 1 }).lean();
    // Check the condition (!hotels.length) and run the matching branch.
    if (!hotels.length) return res.json({ success: true, data: [] });
    // Declare hotelIds for use by the surrounding module or function.
    const hotelIds = hotels.map((hotel) => hotel._id);
    // Declare rooms for use by the surrounding module or function.
    const rooms = await HotelRoomType.find({ tenantId, hotel: { $in: hotelIds } }).sort({ nightlyRate: 1, name: 1 }).lean();
    // Declare roomsByHotel for use by the surrounding module or function.
    const roomsByHotel = new Map();
    // Repeat the enclosed work for each required iteration.
    for (const room of rooms) {
      // Declare key for use by the surrounding module or function.
      const key = String(room.hotel);
      // Declare current for use by the surrounding module or function.
      const current = roomsByHotel.get(key) || [];
      // Perform the side effect or state update expressed on the following line.
      current.push(room);
      // Perform the side effect or state update expressed on the following line.
      roomsByHotel.set(key, current);
    }
    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true, data: hotels.map((hotel) => ({ ...hotel, roomTypes: roomsByHotel.get(String(hotel._id)) || [] })) });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare listAdminTransfersSafe for use by the surrounding module or function.
export const listAdminTransfersSafe = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenant(req, res);
    // Check the condition (!tenantId) and run the matching branch.
    if (!tenantId) return;
    // Declare filter for use by the surrounding module or function.
    const filter = { tenantId };
    // Check the condition (req.query.status) and run the matching branch.
    if (req.query.status) filter.status = req.query.status;
    // Declare transfers for use by the surrounding module or function.
    const transfers = await AirportTransfer.find(filter).sort({ createdAt: -1, airportCode: 1, price: 1, name: 1 }).lean();
    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true, data: transfers });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare listHotelBookingsSafe for use by the surrounding module or function.
export const listHotelBookingsSafe = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!requireBookingAccess(req, res)) and run the matching branch.
    if (!requireBookingAccess(req, res)) return;
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenant(req, res);
    // Check the condition (!tenantId) and run the matching branch.
    if (!tenantId) return;
    // Declare role for use by the surrounding module or function.
    const role = roleOf(req);
    // Declare filter for use by the surrounding module or function.
    const filter = { tenantId };
    // Check the condition (req.query.status) and run the matching branch.
    if (req.query.status) filter.status = req.query.status;
    // Check the condition (req.query.customerId) and run the matching branch.
    if (req.query.customerId) filter.customer = req.query.customerId;
    // Check the condition (role === "customer") and run the matching branch.
    if (role === "customer") filter.user = req.user._id;
    // Declare rows for use by the surrounding module or function.
    const rows = await HotelBooking.find(filter).sort({ checkIn: 1, createdAt: -1 }).lean();
    // Check the condition (!rows.length) and run the matching branch.
    if (!rows.length) return res.json({ success: true, data: [] });

    // Declare hotelIds for use by the surrounding module or function.
    const hotelIds = ids(rows, "hotel");
    // Declare roomIds for use by the surrounding module or function.
    const roomIds = ids(rows, "roomType");
    // Declare customerIds for use by the surrounding module or function.
    const customerIds = ids(rows, "customer");
    // Declare userIds for use by the surrounding module or function.
    const userIds = ids(rows, "user");
    // Declare [hotels, rooms, customers, users] for use by the surrounding module or function.
    const [hotels, rooms, customers, users] = await Promise.all([
      Hotel.find({ tenantId, _id: { $in: hotelIds } }).select("name city county tenantId").lean(),
      HotelRoomType.find({ tenantId, _id: { $in: roomIds } }).select("name nightlyRate hotel tenantId").lean(),
      customerIds.length ? Customer.find({ tenantId, _id: { $in: customerIds } }).select("firstName lastName email phone tenantId user").lean() : [],
      userIds.length ? User.find({ tenantId, _id: { $in: userIds } }).select("name email phone tenantId").lean() : [],
    ]);
    // Declare hotelMap for use by the surrounding module or function.
    const hotelMap = new Map(hotels.map((hotel) => [String(hotel._id), hotel]));
    // Declare roomMap for use by the surrounding module or function.
    const roomMap = new Map(rooms.map((room) => [String(room._id), room]));
    // Declare customerMap for use by the surrounding module or function.
    const customerMap = new Map(customers.map((customer) => [String(customer._id), customer]));
    // Declare userMap for use by the surrounding module or function.
    const userMap = new Map(users.map((user) => [String(user._id), user]));

    // Declare valid for use by the surrounding module or function.
    const valid = rows.filter((row) => {
      // Declare hotel for use by the surrounding module or function.
      const hotel = hotelMap.get(String(row.hotel));
      // Declare room for use by the surrounding module or function.
      const room = roomMap.get(String(row.roomType));
      // Check the condition (!hotel || !room || String(room.hotel) !== String(row.hotel)) and run the matching branch.
      if (!hotel || !room || String(room.hotel) !== String(row.hotel)) return false;
      // Check the condition (row.customer && !customerMap.has(String(row.customer))) and run the matching branch.
      if (row.customer && !customerMap.has(String(row.customer))) return false;
      // Check the condition (row.user && !userMap.has(String(row.user))) and run the matching branch.
      if (row.user && !userMap.has(String(row.user))) return false;
      // Return the expression shown below to the caller.
      return true;
    });

    // Perform the side effect or state update expressed on the following line.
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
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare listTransferBookingsSafe for use by the surrounding module or function.
export const listTransferBookingsSafe = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!requireBookingAccess(req, res)) and run the matching branch.
    if (!requireBookingAccess(req, res)) return;
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenant(req, res);
    // Check the condition (!tenantId) and run the matching branch.
    if (!tenantId) return;
    // Declare role for use by the surrounding module or function.
    const role = roleOf(req);
    // Declare filter for use by the surrounding module or function.
    const filter = { tenantId };
    // Check the condition (req.query.status) and run the matching branch.
    if (req.query.status) filter.status = req.query.status;
    // Check the condition (role === "customer") and run the matching branch.
    if (role === "customer") filter.user = req.user._id;
    // Declare rows for use by the surrounding module or function.
    const rows = await AirportTransferBooking.find(filter).sort({ pickupDateTime: 1, createdAt: -1 }).lean();
    // Check the condition (!rows.length) and run the matching branch.
    if (!rows.length) return res.json({ success: true, data: [] });

    // Declare transferIds for use by the surrounding module or function.
    const transferIds = ids(rows, "transfer");
    // Declare customerIds for use by the surrounding module or function.
    const customerIds = ids(rows, "customer");
    // Declare userIds for use by the surrounding module or function.
    const userIds = ids(rows, "user");
    // Declare vehicleIds for use by the surrounding module or function.
    const vehicleIds = ids(rows, "assignedVehicle");
    // Declare driverIds for use by the surrounding module or function.
    const driverIds = ids(rows, "assignedDriver");
    // Declare [transfers, customers, users, vehicles] for use by the surrounding module or function.
    const [transfers, customers, users, vehicles] = await Promise.all([
      AirportTransfer.find({ tenantId, _id: { $in: transferIds } }).select("name airportName airportCode vehicleType tenantId").lean(),
      customerIds.length ? Customer.find({ tenantId, _id: { $in: customerIds } }).select("firstName lastName email phone tenantId user").lean() : [],
      userIds.length || driverIds.length ? User.find({ tenantId, _id: { $in: [...new Set([...userIds, ...driverIds])] } }).select("name email phone tenantId").lean() : [],
      vehicleIds.length ? Vehicle.find({ tenantId, _id: { $in: vehicleIds } }).select("name registrationNumber plateNumber tenantId").lean() : [],
    ]);
    // Declare transferMap for use by the surrounding module or function.
    const transferMap = new Map(transfers.map((transfer) => [String(transfer._id), transfer]));
    // Declare customerMap for use by the surrounding module or function.
    const customerMap = new Map(customers.map((customer) => [String(customer._id), customer]));
    // Declare userMap for use by the surrounding module or function.
    const userMap = new Map(users.map((user) => [String(user._id), user]));
    // Declare vehicleMap for use by the surrounding module or function.
    const vehicleMap = new Map(vehicles.map((vehicle) => [String(vehicle._id), vehicle]));

    // Declare valid for use by the surrounding module or function.
    const valid = rows.filter((row) => {
      // Check the condition (!transferMap.has(String(row.transfer))) and run the matching branch.
      if (!transferMap.has(String(row.transfer))) return false;
      // Check the condition (row.customer && !customerMap.has(String(row.customer))) and run the matching branch.
      if (row.customer && !customerMap.has(String(row.customer))) return false;
      // Check the condition (row.user && !userMap.has(String(row.user))) and run the matching branch.
      if (row.user && !userMap.has(String(row.user))) return false;
      // Check the condition (row.assignedVehicle && !vehicleMap.has(String(row.assignedVehicle))) and run the matching branch.
      if (row.assignedVehicle && !vehicleMap.has(String(row.assignedVehicle))) return false;
      // Check the condition (row.assignedDriver && !userMap.has(String(row.assignedDriver))) and run the matching branch.
      if (row.assignedDriver && !userMap.has(String(row.assignedDriver))) return false;
      // Return the expression shown below to the caller.
      return true;
    });

    // Perform the side effect or state update expressed on the following line.
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
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};
