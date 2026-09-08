import Booking from "../models/Booking.js";
import Vehicle from "../models/Vehicle.js";
import Staff from "../models/Staff.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";
import { requireTenantId } from "../tenancy/context.js";

export const getOperationsOverview = async (req, res, next) => {
  try {
    requireTenantId();
    const filter = tenantFilter(req);
    const bookingFilter = { ...filter, isDeleted: { $ne: true } };
    const [bookings, vehicles, staff, schedule] = await Promise.all([
      Booking.find(bookingFilter)
        .populate("tour", "title destination durationDays")
        .populate("user", "name email phone")
        .populate("agent", "commissionRate")
        .sort({ travelDate: 1 })
        .limit(100)
        .lean(),
      Vehicle.find({ ...filter, isDeleted: { $ne: true } }).select("name registrationNumber plateNumber status availability").lean(),
      Staff.find({ ...filter, isDeleted: { $ne: true } }).select("name email role availability status").lean(),
      Booking.find({ ...bookingFilter, status: { $in: ["confirmed", "ongoing", "pending"] }, travelDate: { $gte: new Date() } })
        .populate("tour", "title")
        .sort({ travelDate: 1 })
        .limit(20)
        .lean(),
    ]);
    const guides = staff.filter(s => ["guide", "tour_guide"].includes(String(s.role || "").toLowerCase()));
    const drivers = staff.filter(s => ["driver"].includes(String(s.role || "").toLowerCase()));
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
    const todayBookings = bookings.filter(b => { const d = new Date(b.travelDate); return d >= today && d < tomorrow; });
    const assigned = bookings.filter(b => b.assignedDriver || b.driver || b.assignedGuide || b.guide).length;
    res.json({
      success:true,
      data:{
        bookings, schedule, vehicles, guides, drivers,
        stats:{
          todayTrips: todayBookings.length,
          upcomingTrips: schedule.length,
          confirmedBookings: bookings.filter(b => String(b.status).toLowerCase()==="confirmed").length,
          resourceCoverage: bookings.length ? Math.round((assigned / bookings.length) * 100) : 0,
          availableVehicles: vehicles.filter(v => ["available","active","ready"].includes(String(v.status||v.availability).toLowerCase())).length,
          availableGuides: guides.filter(v => ["available","active","ready"].includes(String(v.status||v.availability).toLowerCase())).length,
          availableDrivers: drivers.filter(v => ["available","active","ready"].includes(String(v.status||v.availability).toLowerCase())).length,
        }
      }
    });
  } catch(e){ next(e); }
};
