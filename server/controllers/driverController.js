import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";
import Staff from "../models/Staff.js";
import Vehicle from "../models/Vehicle.js";

const DRIVER_POSITIONS = ["driver", "tour_driver", "tourdriver"];

const resolveDriver = async (user) => {
  const tenantFilter = mergeTenantFilter({});
  const email = String(user.email || "").trim().toLowerCase();
  let driver = await Staff.findOne({
    ...tenantFilter,
    $or: [{ user: user._id }, ...(email ? [{ email }] : [])],
    position: { $in: DRIVER_POSITIONS },
    isDeleted: { $ne: true },
  });
  if (driver) {
    const updates = {};
    if (!driver.user || driver.user.toString() !== user._id.toString()) updates.user = user._id;
    if (driver.position !== "driver") updates.position = "driver";
    if (driver.role !== "driver") updates.role = "driver";
    if (!driver.isActive || driver.status !== "active") { updates.isActive = true; updates.status = "active"; }
    if (Object.keys(updates).length) {
      await Staff.updateOne(mergeTenantFilter({ _id: driver._id }), { $set: updates });
      driver = { ...driver.toObject(), ...updates };
    }
    return driver;
  }
  if (!email) return null;
  driver = await Staff.findOne({ ...tenantFilter, email, position: { $in: DRIVER_POSITIONS }, isDeleted: { $ne: true } });
  if (driver) return driver;
  driver = new Staff({ tenantId: requireTenantId(), name: user.name || user.email, email, phone: user.phone || "", position: "driver", role: "driver", user: user._id, availability: "available", isActive: true, status: "active", isDeleted: false, createdBy: user._id });
  await driver.save();
  return driver;
};

const driverTourFilter = (driver, user) => {
  const alternatives = [
    { assignedDriver: driver._id },
    { driver: driver._id },
    ...(user?._id ? [{ assignedDriver: user._id }, { driver: user._id }] : []),
  ];
  if (Array.isArray(driver.assignedTours) && driver.assignedTours.length) alternatives.push({ _id: { $in: driver.assignedTours } });
  return mergeTenantFilter({ $or: alternatives, isDeleted: { $ne: true } });
};

export const driverDashboard = async (req, res, next) => {
  requireTenantId();
  try {
    const driver = await resolveDriver(req.user);
    if (!driver) return res.status(404).json({ success: false, message: "Driver profile not found. Ask an administrator to complete the driver account." });

    const filter = driverTourFilter(driver, req.user);
    const tours = await Tour.find(filter).populate("destination").populate("assignedGuide").populate("assignedVehicle").sort({ startDate: 1, date: 1 }).limit(25).lean();
    const tourIds = tours.map((tour) => tour._id);
    const guestStats = tourIds.length ? await Booking.aggregate([
      { $match: mergeTenantFilter({ tour: { $in: tourIds }, isDeleted: { $ne: true }, status: { $in: ["confirmed", "assigned", "ongoing", "completed"] } }) },
      { $group: { _id: "$tour", guests: { $sum: { $ifNull: ["$numberOfGuests", 1] } }, bookings: { $sum: 1 } } },
    ]) : [];
    const guestMap = new Map(guestStats.map((item) => [item._id.toString(), { guests: item.guests || 0, bookings: item.bookings || 0 }]));
    const formatted = tours.map((tour) => ({ ...tour, guests: guestMap.get(tour._id.toString())?.guests || 0, bookings: guestMap.get(tour._id.toString())?.bookings || 0, startDate: tour.startDate || tour.date || tour.travelDate }));

    let assignedVehicle = formatted.find((tour) => tour.assignedVehicle)?.assignedVehicle || null;
    if (!assignedVehicle) assignedVehicle = await Vehicle.findOne(mergeTenantFilter({ driver: driver._id, isDeleted: { $ne: true } })).lean();
    if (!assignedVehicle && req.user?._id) assignedVehicle = await Vehicle.findOne(mergeTenantFilter({ driver: req.user._id, isDeleted: { $ne: true } })).lean();

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const upcoming = formatted.filter((t) => !["completed", "cancelled"].includes(String(t.status || "").toLowerCase()) && new Date(t.startDate || 0) >= today);
    const todayTrips = formatted.filter((t) => { const d = new Date(t.startDate || 0); d.setHours(0,0,0,0); const end = new Date(t.endDate || t.startDate || 0); end.setHours(0,0,0,0); return d <= today && today <= end && !["completed","cancelled"].includes(String(t.status || "").toLowerCase()); });

    return res.status(200).json({
      success: true,
      driver: { _id: driver._id, name: driver.name, phone: driver.phone, email: driver.email, availability: driver.availability, status: driver.status, licenseNumber: driver.licenseNumber, licenseExpiry: driver.licenseExpiry, employeeNumber: driver.employeeNumber },
      vehicle: assignedVehicle,
      assignedVehicle,
      stats: { totalTours: formatted.length, upcomingTours: upcoming.length, todayTrips: todayTrips.length, ongoingTours: formatted.filter((t) => String(t.status || "").toLowerCase() === "ongoing").length, completedTours: formatted.filter((t) => String(t.status || "").toLowerCase() === "completed").length, totalGuests: formatted.reduce((sum, t) => sum + Number(t.guests || 0), 0) },
      tours: formatted,
      data: { tours: formatted, vehicle: assignedVehicle },
    });
  } catch (error) { next(error); }
};