import Booking from "../models/Booking.js";
import Customer from "../models/Customer.js";
import User from "../models/User.js";
import Tour from "../models/Tour.js";
import CustomTourRequest from "../models/CustomTourRequest.js";
import Vehicle from "../models/Vehicle.js";
import Staff from "../models/Staff.js";
import Supplier from "../models/Supplier.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import TourCost from "../models/TourCost.js";
import SupplierPayable from "../models/SupplierPayable.js";
import CorporateAccount from "../models/CorporateAccount.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";
import { requireTenantId } from "../tenancy/context.js";

const refId = (value) => value ? String(value._id || value) : "";

const ownedIds = async (Model, ids, tenantId) => {
  const values = [...new Set(ids.map(refId).filter(Boolean))];
  if (!values.length) return new Set();
  const rows = await Model.find({ _id: { $in: values }, tenantId }).select("_id").lean();
  return new Set(rows.map((row) => String(row._id)));
};

const filterTenantBookings = async (rows, tenantId) => {
  if (!rows.length) return [];
  const [customers, users, tours, customTourRequests, staff, vehicles] = await Promise.all([
    ownedIds(Customer, rows.map((b) => b.customer), tenantId),
    ownedIds(User, rows.map((b) => b.user), tenantId),
    ownedIds(Tour, rows.map((b) => b.tour), tenantId),
    ownedIds(CustomTourRequest, rows.map((b) => b.customTourRequest), tenantId),
    ownedIds(Staff, rows.flatMap((b) => [b.assignedGuide, b.assignedDriver]), tenantId),
    ownedIds(Vehicle, rows.map((b) => b.assignedVehicle), tenantId),
  ]);
  return rows.filter((b) => {
    if (!b.tenantId || String(b.tenantId) !== String(tenantId)) return false;
    if (b.customer && !customers.has(refId(b.customer))) return false;
    if (b.user && !users.has(refId(b.user))) return false;
    if (b.tour && !tours.has(refId(b.tour))) return false;
    if (b.customTourRequest && !customTourRequests.has(refId(b.customTourRequest))) return false;
    if (b.assignedGuide && !staff.has(refId(b.assignedGuide))) return false;
    if (b.assignedDriver && !staff.has(refId(b.assignedDriver))) return false;
    if (b.assignedVehicle && !vehicles.has(refId(b.assignedVehicle))) return false;
    return Boolean(b.tour || b.customTourRequest);
  });
};

export const getOperationsOverview = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const filter = tenantFilter(req);
    const bookingFilter = { ...filter, isDeleted: { $ne: true } };
    const [rawBookings, vehicles, staff, rawSchedule, suppliers, purchaseOrders, tourCosts, payables, corporateAccounts] = await Promise.all([
      Booking.find(bookingFilter).populate("tour", "title destination durationDays").populate("user", "name email phone").populate("agent", "commissionRate").sort({ travelDate: 1 }).limit(200).lean(),
      Vehicle.find({ ...filter, isDeleted: { $ne: true } }).select("name registrationNumber plateNumber status availability").lean(),
      Staff.find({ ...filter, isDeleted: { $ne: true } }).select("name email role availability status").lean(),
      Booking.find({ ...bookingFilter, status: { $in: ["confirmed", "ongoing", "pending"] }, travelDate: { $gte: new Date() } }).populate("tour", "title").sort({ travelDate: 1 }).limit(50).lean(),
      Supplier.countDocuments({ ...filter, status: "active" }),
      PurchaseOrder.find({ ...filter, isDeleted: { $ne: true } }).select("status totalAmount").lean(),
      TourCost.find({ ...filter, isDeleted: { $ne: true }, status: { $ne: "cancelled" } }).select("totalCost").lean(),
      SupplierPayable.find({ ...filter, isDeleted: { $ne: true }, status: { $nin: ["paid", "cancelled"] } }).select("balance").lean(),
      CorporateAccount.find({ ...filter, isDeleted: { $ne: true }, status: "active" }).select("creditLimit currentBalance").lean(),
    ]);
    const bookings = await filterTenantBookings(rawBookings, tenantId);
    const schedule = await filterTenantBookings(rawSchedule, tenantId);
    const guides = staff.filter((s) => ["guide", "tour_guide"].includes(String(s.role || "").toLowerCase()));
    const drivers = staff.filter((s) => String(s.role || "").toLowerCase() === "driver");
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const todayBookings = bookings.filter((b) => { const d = new Date(b.travelDate); return d >= today && d < tomorrow; });
    const assigned = bookings.filter((b) => b.assignedDriver || b.assignedGuide || b.assignedVehicle).length;
    const procurementValue = purchaseOrders.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
    const outstandingPayables = payables.reduce((sum, item) => sum + Number(item.balance || 0), 0);
    const totalTourCost = tourCosts.reduce((sum, item) => sum + Number(item.totalCost || 0), 0);
    const corporateExposure = corporateAccounts.reduce((sum, item) => sum + Number(item.currentBalance || 0), 0);
    res.json({ success: true, data: { bookings, schedule, vehicles, guides, drivers, procurement: { activeSuppliers: suppliers, purchaseOrderCount: purchaseOrders.length, purchaseOrderValue: procurementValue, totalTourCost, outstandingPayables, corporateExposure }, stats: { todayTrips: todayBookings.length, upcomingTrips: schedule.length, confirmedBookings: bookings.filter((b) => String(b.status).toLowerCase() === "confirmed").length, resourceCoverage: bookings.length ? Math.round((assigned / bookings.length) * 100) : 0, availableVehicles: vehicles.filter((v) => ["available", "active", "ready"].includes(String(v.status || v.availability || "").toLowerCase())).length, availableGuides: guides.filter((v) => ["available", "active", "ready"].includes(String(v.status || v.availability || "").toLowerCase())).length, availableDrivers: drivers.filter((v) => ["available", "active", "ready"].includes(String(v.status || v.availability || "").toLowerCase())).length } } });
  } catch (e) { next(e); }
};
