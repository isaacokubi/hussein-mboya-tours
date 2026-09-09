import Booking from "../models/Booking.js";
import Vehicle from "../models/Vehicle.js";
import Staff from "../models/Staff.js";
import Supplier from "../models/Supplier.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import TourCost from "../models/TourCost.js";
import SupplierPayable from "../models/SupplierPayable.js";
import CorporateAccount from "../models/CorporateAccount.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";
import { requireTenantId } from "../tenancy/context.js";

export const getOperationsOverview = async (req, res, next) => {
  try {
    requireTenantId();
    const filter = tenantFilter(req);
    const bookingFilter = { ...filter, isDeleted: { $ne: true } };
    const [bookings, vehicles, staff, schedule, suppliers, purchaseOrders, tourCosts, payables, corporateAccounts] = await Promise.all([
      Booking.find(bookingFilter).populate("tour", "title destination durationDays").populate("user", "name email phone").populate("agent", "commissionRate").sort({ travelDate: 1 }).limit(100).lean(),
      Vehicle.find({ ...filter, isDeleted: { $ne: true } }).select("name registrationNumber plateNumber status availability").lean(),
      Staff.find({ ...filter, isDeleted: { $ne: true } }).select("name email role availability status").lean(),
      Booking.find({ ...bookingFilter, status: { $in: ["confirmed", "ongoing", "pending"] }, travelDate: { $gte: new Date() } }).populate("tour", "title").sort({ travelDate: 1 }).limit(20).lean(),
      Supplier.countDocuments({ ...filter, status: "active" }),
      PurchaseOrder.find(filter).select("status totalAmount").lean(),
      TourCost.find({ ...filter, status: { $ne: "cancelled" } }).select("totalCost").lean(),
      SupplierPayable.find({ ...filter, status: { $nin: ["paid", "cancelled"] } }).select("balance").lean(),
      CorporateAccount.find({ ...filter, status: "active" }).select("creditLimit currentBalance").lean(),
    ]);
    const guides = staff.filter(s => ["guide", "tour_guide"].includes(String(s.role || "").toLowerCase()));
    const drivers = staff.filter(s => ["driver"].includes(String(s.role || "").toLowerCase()));
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
    const todayBookings = bookings.filter(b => { const d = new Date(b.travelDate); return d >= today && d < tomorrow; });
    const assigned = bookings.filter(b => b.assignedDriver || b.driver || b.assignedGuide || b.guide).length;
    const procurementValue = purchaseOrders.reduce((sum, po) => sum + Number(po.totalAmount || 0), 0);
    const outstandingPayables = payables.reduce((sum, p) => sum + Number(p.balance || 0), 0);
    const totalTourCost = tourCosts.reduce((sum, c) => sum + Number(c.totalCost || 0), 0);
    const corporateExposure = corporateAccounts.reduce((sum, a) => sum + Number(a.currentBalance || 0), 0);
    res.json({ success:true, data:{ bookings, schedule, vehicles, guides, drivers, procurement:{ activeSuppliers: suppliers, purchaseOrderCount: purchaseOrders.length, purchaseOrderValue: procurementValue, totalTourCost, outstandingPayables, corporateExposure }, stats:{ todayTrips: todayBookings.length, upcomingTrips: schedule.length, confirmedBookings: bookings.filter(b => String(b.status).toLowerCase()==="confirmed").length, resourceCoverage: bookings.length ? Math.round((assigned / bookings.length) * 100) : 0, availableVehicles: vehicles.filter(v => ["available","active","ready"].includes(String(v.status||v.availability).toLowerCase())).length, availableGuides: guides.filter(v => ["available","active","ready"].includes(String(v.status||v.availability).toLowerCase())).length, availableDrivers: drivers.filter(v => ["available","active","ready"].includes(String(v.status||v.availability).toLowerCase())).length } } });
  } catch(e){ next(e); }
};
