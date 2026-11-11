/**
 * Purpose: booking Commercial Guard request middleware. Main declarations: fail, guardCorporateBooking.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../models/CorporateAccount.js so this module can use its exported dependencies.
import CorporateAccount from "../models/CorporateAccount.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../utils/bookingPricing.js so this module can use its exported dependencies.
import { calculateBookingAmounts } from "../utils/bookingPricing.js";

// Declare fail for use by the surrounding module or function.
const fail = (res, status, message) => res.status(status).json({ success: false, message });

// Define guardCorporateBooking; its parameters and body implement this operation.
export async function guardCorporateBooking(req, res, next) {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare body for use by the surrounding module or function.
    const body = req.body || {};
    // Declare type for use by the surrounding module or function.
    const type = String(body.bookingType || "individual").toLowerCase();
    // Check the condition (!["individual", "group", "corporate"].includes(type)) and run the matching branch.
    if (!["individual", "group", "corporate"].includes(type)) return fail(res, 400, "Invalid booking type.");
    // Declare guests for use by the surrounding module or function.
    const guests = Math.max(Number(body.numberOfGuests) || (Array.isArray(body.travelers) ? body.travelers.length : 1), 1);
    // Check the condition (type === "group" && guests < 2) and run the matching branch.
    if (type === "group" && guests < 2) return fail(res, 400, "Group bookings require at least two guests.");
    // Check the condition (type !== "corporate") and run the matching branch.
    if (type !== "corporate") return next();
    // Check the condition (!body.corporateAccount || !mongoose.isValidObjectId(body.corporateAcco) and run the matching branch.
    if (!body.corporateAccount || !mongoose.isValidObjectId(body.corporateAccount)) return fail(res, 400, "A valid corporate account is required for corporate bookings.");
    // Declare account for use by the surrounding module or function.
    const account = await CorporateAccount.findOne(mergeTenantFilter(req, { _id: body.corporateAccount }));
    // Check the condition (!account || account.status !== "active") and run the matching branch.
    if (!account || account.status !== "active") return fail(res, 409, "Corporate account is not active in this tenant.");
    // Check the condition (account.requiresPurchaseOrder && !String(body.purchaseOrderNumber || ") and run the matching branch.
    if (account.requiresPurchaseOrder && !String(body.purchaseOrderNumber || "").trim()) return fail(res, 400, "This corporate account requires a purchase order number.");

    // Declare amount for use by the surrounding module or function.
    let amount = Number(body.totalAmount || body.amount || 0);
    // Check the condition (body.tour && mongoose.isValidObjectId(body.tour)) and run the matching branch.
    if (body.tour && mongoose.isValidObjectId(body.tour)) {
      // Declare tour for use by the surrounding module or function.
      const tour = await Tour.findOne(mergeTenantFilter(req, { _id: body.tour, isDeleted: { $ne: true } })).lean();
      // Check the condition (!tour) and run the matching branch.
      if (!tour) return fail(res, 404, "Tour not found.");
      // Perform the side effect or state update expressed on the following line.
      amount = Number(calculateBookingAmounts(tour, guests).totalAmount || 0);
    }
    // Check the condition (!Number.isFinite(amount) || amount <= 0) and run the matching branch.
    if (!Number.isFinite(amount) || amount <= 0) return fail(res, 400, "A valid booking amount is required for corporate credit control.");
    // Declare availableCredit for use by the surrounding module or function.
    const availableCredit = account.creditLimit > 0 ? Math.max(0, account.creditLimit - Number(account.currentBalance || 0)) : null;
    // Check the condition (availableCredit !== null && amount > availableCredit) and run the matching branch.
    if (availableCredit !== null && amount > availableCredit) return fail(res, 409, `Corporate credit limit exceeded. Available credit is KES ${availableCredit.toFixed(2)}.`);
    // Perform the side effect or state update expressed on the following line.
    req.corporateAccount = account;
    // Perform the side effect or state update expressed on the following line.
    req.corporateExposureAmount = amount;
    // Perform the side effect or state update expressed on the following line.
    next();
  } catch (error) { next(error); }
}
