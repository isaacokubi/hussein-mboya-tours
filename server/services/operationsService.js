import mongoose from "mongoose";
import Supplier from "../models/Supplier.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import TourCost from "../models/TourCost.js";
import SupplierPayable from "../models/SupplierPayable.js";
import CorporateAccount from "../models/CorporateAccount.js";
import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";
import { requireTenantId, mergeTenantFilter } from "../tenancy/context.js";

const money = (n) => Math.round(Number(n || 0) * 100) / 100;
const tenant = (filter = {}) => mergeTenantFilter(filter);
const assertObjectId = (id, label) => { if (id && !mongoose.isValidObjectId(id)) throw new Error(`${label} is invalid.`); };

export async function createSupplier(data, userId) { requireTenantId(); return Supplier.create({ ...data, createdBy: userId }); }

export async function createPurchaseOrder(data, userId) {
  requireTenantId(); assertObjectId(data.supplier, "Supplier"); if (data.booking) assertObjectId(data.booking, "Booking"); if (data.tour) assertObjectId(data.tour, "Tour");
  const supplier = await Supplier.findOne({ ...tenant({ _id: data.supplier }), status: "active" });
  if (!supplier) throw new Error("Supplier not found in this tenant or is inactive.");
  if (data.booking && !(await Booking.exists({ ...tenant({ _id: data.booking, isDeleted: { $ne: true } }) }))) throw new Error("Booking not found in this tenant.");
  if (data.tour && !(await Tour.exists({ ...tenant({ _id: data.tour, isDeleted: { $ne: true } }) }))) throw new Error("Tour not found in this tenant.");
  return PurchaseOrder.create({ ...data, createdBy: userId });
}

export async function transitionPurchaseOrder(id, status, userId) {
  requireTenantId(); assertObjectId(id, "Purchase order");
  const allowed = { draft: ["submitted", "cancelled"], submitted: ["approved", "cancelled"], approved: ["partially_received", "received", "cancelled"], partially_received: ["received", "cancelled"], received: [], cancelled: [] };
  const po = await PurchaseOrder.findOne(tenant({ _id: id }));
  if (!po) throw new Error("Purchase order not found.");
  if (!allowed[po.status]?.includes(status)) throw new Error(`Invalid purchase order transition: ${po.status} -> ${status}.`);
  po.status = status; if (status === "approved") { po.approvedBy = userId || null; po.approvedAt = new Date(); } if (status === "received") po.receivedAt = new Date();
  return po.save();
}

export async function createTourCost(data, userId) {
  requireTenantId(); assertObjectId(data.tour, "Tour");
  if (!(await Tour.exists(tenant({ _id: data.tour, isDeleted: { $ne: true } })))) throw new Error("Tour not found in this tenant.");
  if (data.booking && !(await Booking.exists(tenant({ _id: data.booking, isDeleted: { $ne: true } })))) throw new Error("Booking not found in this tenant.");
  if (data.supplier && !(await Supplier.exists(tenant({ _id: data.supplier })))) throw new Error("Supplier not found in this tenant.");
  if (data.purchaseOrder && !(await PurchaseOrder.exists(tenant({ _id: data.purchaseOrder })))) throw new Error("Purchase order not found in this tenant.");
  return TourCost.create({ ...data, createdBy: userId });
}

export async function getTourProfitability(tourId) {
  requireTenantId(); assertObjectId(tourId, "Tour");
  const filter = tenant(); const tour = await Tour.findOne({ ...filter, _id: tourId, isDeleted: { $ne: true } }).lean(); if (!tour) throw new Error("Tour not found in this tenant.");
  const [costs, bookings] = await Promise.all([
    TourCost.find({ ...filter, tour: tourId, status: { $ne: "cancelled" } }).lean(),
    Booking.find({ ...filter, tour: tourId, isDeleted: { $ne: true }, status: { $nin: ["cancelled", "refunded"] } }).select("totalAmount paymentStatus").lean(),
  ]);
  const estimatedRevenue = money(bookings.reduce((s, b) => s + Number(b.totalAmount || 0), 0));
  const totalCost = money(costs.reduce((s, c) => s + Number(c.totalCost || 0), 0));
  const grossProfit = money(estimatedRevenue - totalCost);
  return { tour: { _id: tour._id, title: tour.title, price: tour.price }, bookingCount: bookings.length, estimatedRevenue, totalCost, grossProfit, marginPercent: estimatedRevenue ? money((grossProfit / estimatedRevenue) * 100) : 0, costsByCategory: costs.reduce((a, c) => { a[c.category] = money((a[c.category] || 0) + Number(c.totalCost || 0)); return a; }, {}) };
}

export async function createSupplierPayable(data, userId) {
  requireTenantId(); assertObjectId(data.supplier, "Supplier");
  if (!(await Supplier.exists(tenant({ _id: data.supplier })))) throw new Error("Supplier not found in this tenant.");
  for (const [key, label, Model] of [["purchaseOrder", "Purchase order", PurchaseOrder], ["expense", "Expense", null], ["booking", "Booking", Booking], ["tour", "Tour", Tour]]) {
    if (data[key] && Model && !(await Model.exists(tenant({ _id: data[key] })))) throw new Error(`${label} not found in this tenant.`);
  }
  return SupplierPayable.create({ ...data, createdBy: userId });
}

export async function paySupplierPayable(id, amount, paymentReference = "") {
  requireTenantId(); const payable = await SupplierPayable.findOne(tenant({ _id: id })); if (!payable) throw new Error("Supplier payable not found.");
  const payment = money(amount); if (!(payment > 0)) throw new Error("Payment amount must be greater than zero."); if (payment > payable.balance) throw new Error("Payment exceeds supplier payable balance.");
  payable.amountPaid = money(payable.amountPaid + payment); payable.paymentReference = paymentReference || payable.paymentReference; return payable.save();
}

export async function createCorporateAccount(data, userId) { requireTenantId(); return CorporateAccount.create({ ...data, createdBy: userId }); }

export async function getResourceConflicts({ resourceType, resourceId, travelDate, excludeBookingId }) {
  requireTenantId(); assertObjectId(resourceId, "Resource"); if (!travelDate) throw new Error("travelDate is required.");
  const start = new Date(travelDate); if (Number.isNaN(start.getTime())) throw new Error("travelDate is invalid."); start.setHours(0, 0, 0, 0); const end = new Date(start); end.setDate(end.getDate() + 1);
  const field = { vehicle: "assignedVehicle", guide: "assignedGuide", driver: "assignedDriver" }[resourceType]; if (!field) throw new Error("resourceType must be vehicle, guide, or driver.");
  const query = tenant({ [field]: resourceId, travelDate: { $gte: start, $lt: end }, status: { $nin: ["cancelled", "refunded", "completed"] }, isDeleted: { $ne: true } }); if (excludeBookingId) query._id = { $ne: excludeBookingId };
  const conflicts = await Booking.find(query).select("bookingNumber travelDate status customerSnapshot tour assignedVehicle assignedGuide assignedDriver").populate("tour", "title").lean();
  return { hasConflict: conflicts.length > 0, conflicts };
}
