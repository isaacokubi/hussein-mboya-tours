import mongoose from "mongoose";
import CorporateAccount from "../models/CorporateAccount.js";
import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import { calculateBookingAmounts } from "../utils/bookingPricing.js";

const fail = (res, status, message) => res.status(status).json({ success: false, message });

export async function guardCorporateBooking(req, res, next) {
  requireTenantId();
  try {
    const body = req.body || {};
    const type = String(body.bookingType || "individual").toLowerCase();
    if (!["individual", "group", "corporate"].includes(type)) return fail(res, 400, "Invalid booking type.");
    const guests = Math.max(Number(body.numberOfGuests) || (Array.isArray(body.travelers) ? body.travelers.length : 1), 1);
    if (type === "group" && guests < 2) return fail(res, 400, "Group bookings require at least two guests.");
    if (type !== "corporate") return next();
    if (!body.corporateAccount || !mongoose.isValidObjectId(body.corporateAccount)) return fail(res, 400, "A valid corporate account is required for corporate bookings.");
    const account = await CorporateAccount.findOne(mergeTenantFilter(req, { _id: body.corporateAccount }));
    if (!account || account.status !== "active") return fail(res, 409, "Corporate account is not active in this tenant.");
    if (account.requiresPurchaseOrder && !String(body.purchaseOrderNumber || "").trim()) return fail(res, 400, "This corporate account requires a purchase order number.");

    let amount = Number(body.totalAmount || body.amount || 0);
    if (body.tour && mongoose.isValidObjectId(body.tour)) {
      const tour = await Tour.findOne(mergeTenantFilter(req, { _id: body.tour, isDeleted: { $ne: true } })).lean();
      if (!tour) return fail(res, 404, "Tour not found.");
      amount = Number(calculateBookingAmounts(tour, guests).totalAmount || 0);
    }
    if (!Number.isFinite(amount) || amount <= 0) return fail(res, 400, "A valid booking amount is required for corporate credit control.");
    const availableCredit = account.creditLimit > 0 ? Math.max(0, account.creditLimit - Number(account.currentBalance || 0)) : null;
    if (availableCredit !== null && amount > availableCredit) return fail(res, 409, `Corporate credit limit exceeded. Available credit is KES ${availableCredit.toFixed(2)}.`);
    req.corporateAccount = account;
    req.corporateExposureAmount = amount;
    next();
  } catch (error) { next(error); }
}
