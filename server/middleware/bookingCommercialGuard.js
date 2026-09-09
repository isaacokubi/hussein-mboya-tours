import mongoose from "mongoose";
import CorporateAccount from "../models/CorporateAccount.js";
import Booking from "../models/Booking.js";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";

const fail = (res, status, message) => res.status(status).json({ success: false, message });

export async function guardCorporateBooking(req, res, next) {
  requireTenantId();
  try {
    const body = req.body || {};
    const type = String(body.bookingType || "individual").toLowerCase();
    if (!["individual", "group", "corporate"].includes(type)) return fail(res, 400, "Invalid booking type.");

    if (type === "individual") return next();

    const guests = Math.max(Number(body.numberOfGuests) || (Array.isArray(body.travelers) ? body.travelers.length : 1), 1);
    if (type === "group" && guests < 2) return fail(res, 400, "Group bookings require at least two guests.");

    if (type !== "corporate") return next();
    if (!body.corporateAccount || !mongoose.isValidObjectId(body.corporateAccount)) return fail(res, 400, "A valid corporate account is required for corporate bookings.");

    const account = await CorporateAccount.findOne(mergeTenantFilter(req, { _id: body.corporateAccount }));
    if (!account || account.status !== "active") return fail(res, 409, "Corporate account is not active in this tenant.");

    const amount = Number(body.totalAmount || body.amount || 0);
    const projectedBalance = Number(account.currentBalance || 0) + Math.max(amount, 0);
    if (account.creditLimit > 0 && projectedBalance > account.creditLimit) return fail(res, 409, `Corporate credit limit exceeded. Available credit is KES ${Math.max(0, account.creditLimit - account.currentBalance).toFixed(2)}.`);
    if (account.requiresPurchaseOrder && !String(body.purchaseOrderNumber || "").trim()) return fail(res, 400, "This corporate account requires a purchase order number.");

    req.corporateAccount = account;
    next();
  } catch (error) { next(error); }
}

export async function enforceCorporateAssignmentBalance(req, res, next) {
  requireTenantId();
  try {
    const booking = await Booking.findOne(mergeTenantFilter(req, { _id: req.params.id })).select("_id bookingType corporateAccount totalAmount paymentStatus status isDeleted").lean();
    if (!booking) return fail(res, 404, "Booking not found.");
    if (booking.bookingType === "corporate" && booking.corporateAccount) {
      const account = await CorporateAccount.findOne(mergeTenantFilter(req, { _id: booking.corporateAccount })).lean();
      if (!account || account.status !== "active") return fail(res, 409, "Corporate account is no longer active.");
    }
    req.booking = booking;
    next();
  } catch (error) { next(error); }
}
