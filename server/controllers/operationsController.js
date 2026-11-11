/**
 * Purpose: operations Controller HTTP controller. Main declarations: refId, ownedIds, filterTenantBookings, getOperationsOverview.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import Booking from "../models/Booking.js";
// Load ../models/Customer.js so this module can use its exported dependencies.
import Customer from "../models/Customer.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/CustomTourRequest.js so this module can use its exported dependencies.
import CustomTourRequest from "../models/CustomTourRequest.js";
// Load ../models/Vehicle.js so this module can use its exported dependencies.
import Vehicle from "../models/Vehicle.js";
// Load ../models/Staff.js so this module can use its exported dependencies.
import Staff from "../models/Staff.js";
// Load ../models/Supplier.js so this module can use its exported dependencies.
import Supplier from "../models/Supplier.js";
// Load ../models/PurchaseOrder.js so this module can use its exported dependencies.
import PurchaseOrder from "../models/PurchaseOrder.js";
// Load ../models/TourCost.js so this module can use its exported dependencies.
import TourCost from "../models/TourCost.js";
// Load ../models/SupplierPayable.js so this module can use its exported dependencies.
import SupplierPayable from "../models/SupplierPayable.js";
// Load ../models/CorporateAccount.js so this module can use its exported dependencies.
import CorporateAccount from "../models/CorporateAccount.js";
// Load ../tenancy/tenantQuery.js so this module can use its exported dependencies.
import { tenantFilter } from "../tenancy/tenantQuery.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { requireTenantId } from "../tenancy/context.js";

// Declare refId for use by the surrounding module or function.
const refId = (value) => value ? String(value._id || value) : "";

// Declare ownedIds for use by the surrounding module or function.
const ownedIds = async (Model, ids, tenantId) => {
  // Declare values for use by the surrounding module or function.
  const values = [...new Set(ids.map(refId).filter(Boolean))];
  // Check the condition (!values.length) and run the matching branch.
  if (!values.length) return new Set();
  // Declare rows for use by the surrounding module or function.
  const rows = await Model.find({ _id: { $in: values }, tenantId }).select("_id").lean();
  // Return a new Set instance to the caller.
  return new Set(rows.map((row) => String(row._id)));
};

// Declare filterTenantBookings for use by the surrounding module or function.
const filterTenantBookings = async (rows, tenantId) => {
  // Check the condition (!rows.length) and run the matching branch.
  if (!rows.length) return [];
  // Declare [customers, users, tours, customTourRequests, staff, vehicles] for use by the surrounding module or function.
  const [customers, users, tours, customTourRequests, staff, vehicles] = await Promise.all([
    ownedIds(Customer, rows.map((b) => b.customer), tenantId),
    ownedIds(User, rows.map((b) => b.user), tenantId),
    ownedIds(Tour, rows.map((b) => b.tour), tenantId),
    ownedIds(CustomTourRequest, rows.map((b) => b.customTourRequest), tenantId),
    ownedIds(Staff, rows.flatMap((b) => [b.assignedGuide, b.assignedDriver]), tenantId),
    ownedIds(Vehicle, rows.map((b) => b.assignedVehicle), tenantId),
  ]);
  // Return the result of rows.filter() to the caller.
  return rows.filter((b) => {
    // Check the condition (!b.tenantId || String(b.tenantId) !== String(tenantId)) and run the matching branch.
    if (!b.tenantId || String(b.tenantId) !== String(tenantId)) return false;
    // Check the condition (b.customer && !customers.has(refId(b.customer))) and run the matching branch.
    if (b.customer && !customers.has(refId(b.customer))) return false;
    // Check the condition (b.user && !users.has(refId(b.user))) and run the matching branch.
    if (b.user && !users.has(refId(b.user))) return false;
    // Check the condition (b.tour && !tours.has(refId(b.tour))) and run the matching branch.
    if (b.tour && !tours.has(refId(b.tour))) return false;
    // Check the condition (b.customTourRequest && !customTourRequests.has(refId(b.customTourReque) and run the matching branch.
    if (b.customTourRequest && !customTourRequests.has(refId(b.customTourRequest))) return false;
    // Check the condition (b.assignedGuide && !staff.has(refId(b.assignedGuide))) and run the matching branch.
    if (b.assignedGuide && !staff.has(refId(b.assignedGuide))) return false;
    // Check the condition (b.assignedDriver && !staff.has(refId(b.assignedDriver))) and run the matching branch.
    if (b.assignedDriver && !staff.has(refId(b.assignedDriver))) return false;
    // Check the condition (b.assignedVehicle && !vehicles.has(refId(b.assignedVehicle))) and run the matching branch.
    if (b.assignedVehicle && !vehicles.has(refId(b.assignedVehicle))) return false;
    // Return the result of Boolean() to the caller.
    return Boolean(b.tour || b.customTourRequest);
  });
};

// Declare getOperationsOverview for use by the surrounding module or function.
export const getOperationsOverview = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId();
    // Declare filter for use by the surrounding module or function.
    const filter = tenantFilter(req);
    // Declare bookingFilter for use by the surrounding module or function.
    const bookingFilter = { ...filter, isDeleted: { $ne: true } };
    // Declare [rawBookings, vehicles, staff, rawSchedule, suppliers, purchaseOrders, tourCosts, payables, corporateAccounts] for use by the surrounding module or function.
    const [rawBookings, vehicles, staff, rawSchedule, suppliers, purchaseOrders, tourCosts, payables, corporateAccounts] = await Promise.all([
      Booking.find(bookingFilter).populate("tour", "title destination durationDays").populate("user", "name email phone").sort({ travelDate: 1 }).limit(200).lean(),
      Vehicle.find({ ...filter, isDeleted: { $ne: true } }).select("name registrationNumber plateNumber status availability").lean(),
      Staff.find({ ...filter, isDeleted: { $ne: true } }).select("name email role availability status").lean(),
      Booking.find({ ...bookingFilter, status: { $in: ["confirmed", "assigned", "ongoing", "pending"] }, travelDate: { $gte: new Date() } }).populate("tour", "title").populate("customTourRequest", "title destination").sort({ travelDate: 1 }).limit(50).lean(),
      Supplier.countDocuments({ ...filter, status: "active" }),
      PurchaseOrder.find({ ...filter, isDeleted: { $ne: true } }).select("status totalAmount").lean(),
      TourCost.find({ ...filter, isDeleted: { $ne: true }, status: { $ne: "cancelled" } }).select("totalCost").lean(),
      SupplierPayable.find({ ...filter, isDeleted: { $ne: true }, status: { $nin: ["paid", "cancelled"] } }).select("balance").lean(),
      CorporateAccount.find({ ...filter, isDeleted: { $ne: true }, status: "active" }).select("creditLimit currentBalance").lean(),
    ]);
    // Declare bookings for use by the surrounding module or function.
    const bookings = await filterTenantBookings(rawBookings, tenantId);
    // Declare schedule for use by the surrounding module or function.
    const schedule = await filterTenantBookings(rawSchedule, tenantId);
    // Declare guides for use by the surrounding module or function.
    const guides = staff.filter((s) => ["guide", "tour_guide"].includes(String(s.role || "").toLowerCase()));
    // Declare drivers for use by the surrounding module or function.
    const drivers = staff.filter((s) => String(s.role || "").toLowerCase() === "driver");
    // Declare today for use by the surrounding module or function.
    const today = new Date(); today.setHours(0, 0, 0, 0);
    // Declare tomorrow for use by the surrounding module or function.
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    // Declare todayBookings for use by the surrounding module or function.
    const todayBookings = bookings.filter((b) => { const d = new Date(b.travelDate); return d >= today && d < tomorrow; });
    // Declare assigned for use by the surrounding module or function.
    const assigned = schedule.filter((b) => b.assignedDriver || b.assignedGuide || b.assignedVehicle).length;
    // Only submitted/approved/received POs represent committed procurement value.
    // Draft and cancelled POs must not inflate operational commitments.
    // Declare committedPoStatuses for use by the surrounding module or function.
    const committedPoStatuses = new Set(["submitted", "approved", "partially_received", "received"]);
    // Declare procurementValue for use by the surrounding module or function.
    const procurementValue = purchaseOrders
      .filter((item) => committedPoStatuses.has(String(item.status || "").toLowerCase()))
      .reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
    // Declare outstandingPayables for use by the surrounding module or function.
    const outstandingPayables = payables.reduce((sum, item) => sum + Number(item.balance || 0), 0);
    // Declare totalTourCost for use by the surrounding module or function.
    const totalTourCost = tourCosts.reduce((sum, item) => sum + Number(item.totalCost || 0), 0);
    // Declare corporateExposure for use by the surrounding module or function.
    const corporateExposure = corporateAccounts.reduce((sum, item) => sum + Number(item.currentBalance || 0), 0);
    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true, data: { bookings, schedule, vehicles, guides, drivers, procurement: { activeSuppliers: suppliers, purchaseOrderCount: purchaseOrders.length, purchaseOrderValue: procurementValue, totalTourCost, outstandingPayables, corporateExposure }, stats: { todayTrips: todayBookings.length, upcomingTrips: schedule.length, confirmedBookings: bookings.filter((b) => String(b.status).toLowerCase() === "confirmed").length, resourceCoverage: schedule.length ? Math.round((assigned / schedule.length) * 100) : 0, availableVehicles: vehicles.filter((v) => ["available", "active", "ready"].includes(String(v.status || "").toLowerCase()) || ["available", "active", "ready"].includes(String(v.availability || "").toLowerCase())).length, availableGuides: guides.filter((v) => ["available", "active", "ready"].includes(String(v.status || "").toLowerCase()) || ["available", "active", "ready"].includes(String(v.availability || "").toLowerCase())).length, availableDrivers: drivers.filter((v) => ["available", "active", "ready"].includes(String(v.status || "").toLowerCase()) || ["available", "active", "ready"].includes(String(v.availability || "").toLowerCase())).length } } });
  } catch (e) { next(e); }
};
