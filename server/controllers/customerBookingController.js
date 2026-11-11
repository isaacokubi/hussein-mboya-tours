/**
 * Purpose: customer Booking Controller HTTP controller. Main declarations: createCustomerBooking.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Notification.js so this module can use its exported dependencies.
import Notification from "../models/Notification.js";
// Load ../models/CorporateAccount.js so this module can use its exported dependencies.
import CorporateAccount from "../models/CorporateAccount.js";
// Load ../services/inventoryService.js so this module can use its exported dependencies.
import { reserveSlots, validateTourCapacity, releaseSlots } from "../services/inventoryService.js";
// Load ../constants/bookingConstants.js so this module can use its exported dependencies.
import { PAYMENT_METHODS } from "../constants/bookingConstants.js";
// Load ../utils/bookingPricing.js so this module can use its exported dependencies.
import { calculateBookingAmounts } from "../utils/bookingPricing.js";
// Load ../services/settingsService.js so this module can use its exported dependencies.
import { getSystemSettings } from "../services/settingsService.js";
// Load ../services/tenantPaymentMethods.js so this module can use its exported dependencies.
import { isTenantPaymentMethodAvailable, normalizeTenantPaymentMethod } from "../services/tenantPaymentMethods.js";
// Load ../services/customerBookingReservation.js so this module can use its exported dependencies.
import { createCustomerBookingWithReservations } from "../services/customerBookingReservation.js";

// Declare createCustomerBooking for use by the surrounding module or function.
export const createCustomerBooking = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Declare corporateAccountId for use by the surrounding module or function.
  let corporateAccountId = null;
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { tour, travelDate, travelers = [], numberOfGuests, contact = {}, paymentMethod = PAYMENT_METHODS.MPESA, pickupLocation, pickupTime, hotelName, roomNumber, emergencyContact, specialRequests = [], bookingType = "individual", groupReference = "", corporateAccount = null, corporateCompanyName = "", corporatePin = "", purchaseOrderNumber = "", paymentTerms = "immediate", billingContact = {}, roomingListReference = "", } for use by the surrounding module or function.
    const {
      tour, travelDate, travelers = [], numberOfGuests, contact = {}, paymentMethod = PAYMENT_METHODS.MPESA,
      pickupLocation, pickupTime, hotelName, roomNumber, emergencyContact, specialRequests = [],
      bookingType = "individual", groupReference = "", corporateAccount = null, corporateCompanyName = "",
      corporatePin = "", purchaseOrderNumber = "", paymentTerms = "immediate", billingContact = {}, roomingListReference = "",
    } = req.body || {};

    // Check the condition (!tour || !travelDate) and run the matching branch.
    if (!tour || !travelDate) return res.status(400).json({ success: false, message: "Tour and travel date are required." });
    // Declare normalizedPaymentMethod for use by the surrounding module or function.
    const normalizedPaymentMethod = normalizeTenantPaymentMethod(paymentMethod);
    // Declare tenantSettings for use by the surrounding module or function.
    const tenantSettings = await getSystemSettings(req);
    // Check the condition (!normalizedPaymentMethod || !isTenantPaymentMethodAvailable(tenantSett) and run the matching branch.
    if (!normalizedPaymentMethod || !isTenantPaymentMethodAvailable(tenantSettings, normalizedPaymentMethod)) return res.status(409).json({ success: false, message: "This payment method is not currently available for this tenant. Choose another method or contact the tenant administrator." });
    // Declare normalizedType for use by the surrounding module or function.
    const normalizedType = String(bookingType).toLowerCase();
    // Check the condition (!["individual", "group", "corporate"].includes(normalizedType)) and run the matching branch.
    if (!["individual", "group", "corporate"].includes(normalizedType)) return res.status(400).json({ success: false, message: "Invalid booking type." });

    // Declare tourData for use by the surrounding module or function.
    const tourData = await Tour.findOne(mergeTenantFilter({ _id: tour, isDeleted: false }));
    // Check the condition (!tourData) and run the matching branch.
    if (!tourData) return res.status(404).json({ success: false, message: "Tour not found." });

    // Declare guests for use by the surrounding module or function.
    const guests = Math.max(Number(numberOfGuests) || travelers.length || 1, 1);
    // Check the condition (normalizedType === "group" && guests < 2) and run the matching branch.
    if (normalizedType === "group" && guests < 2) return res.status(400).json({ success: false, message: "Group bookings require at least two guests." });
    // Declare capacityAvailable for use by the surrounding module or function.
    const capacityAvailable = await validateTourCapacity(tourData._id, guests, travelDate);
    // Check the condition (!capacityAvailable) and run the matching branch.
    if (!capacityAvailable) return res.status(409).json({ success: false, message: "Not enough available tour slots for this booking." });

    // Declare amounts for use by the surrounding module or function.
    const amounts = calculateBookingAmounts(tourData, guests);
    // Declare totalAmount for use by the surrounding module or function.
    const totalAmount = Number(amounts.totalAmount || 0);
    // Check the condition (!Number.isFinite(totalAmount) || totalAmount <= 0) and run the matching branch.
    if (!Number.isFinite(totalAmount) || totalAmount <= 0) return res.status(409).json({ success: false, message: "This tour does not have a valid price." });

    // Declare corporateAccountRecord for use by the surrounding module or function.
    let corporateAccountRecord = null;
    // Check the condition (normalizedType === "corporate") and run the matching branch.
    if (normalizedType === "corporate") {
      // Perform the side effect or state update expressed on the following line.
      corporateAccountId = corporateAccount || req.corporateAccount?._id;
      // Check the condition (!corporateAccountId) and run the matching branch.
      if (!corporateAccountId) return res.status(400).json({ success: false, message: "Corporate account is required." });
      // Perform the side effect or state update expressed on the following line.
      corporateAccountRecord = await CorporateAccount.findOne(mergeTenantFilter({ _id: corporateAccountId, status: "active", $expr: { $or: [{ $eq: ["$creditLimit", 0] }, { $lte: [{ $add: ["$currentBalance", totalAmount] }, "$creditLimit"] }] } }));
      // Check the condition (!corporateAccountRecord) and run the matching branch.
      if (!corporateAccountRecord) return res.status(409).json({ success: false, message: "Corporate account is inactive or the booking exceeds its credit limit." });
      // Check the condition (corporateAccountRecord.requiresPurchaseOrder && !String(purchaseOrderN) and run the matching branch.
      if (corporateAccountRecord.requiresPurchaseOrder && !String(purchaseOrderNumber || "").trim()) return res.status(400).json({ success: false, message: "This corporate account requires a purchase order number." });
    }

    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Declare booking for use by the surrounding module or function.
      const booking = await createCustomerBookingWithReservations({
        tourId: tourData._id,
        guests,
        travelDate,
        corporateAccountId: normalizedType === "corporate" ? corporateAccountRecord._id : null,
        totalAmount,
        reserveSlots,
        releaseSlots,
        reserveCorporateCredit: async (accountId, amount) => {
          // Declare reserved for use by the surrounding module or function.
          const reserved = await CorporateAccount.findOneAndUpdate(mergeTenantFilter({ _id: accountId, status: "active", $expr: { $or: [{ $eq: ["$creditLimit", 0] }, { $lte: [{ $add: ["$currentBalance", amount] }, "$creditLimit"] }] } }), { $inc: { currentBalance: amount } }, { new: true });
          // Return the value of reserved to the caller.
          return reserved;
        },
        releaseCorporateCredit: (accountId, amount) => CorporateAccount.updateOne(mergeTenantFilter({ _id: accountId }), { $inc: { currentBalance: -amount } }),
        createBooking: () => Booking.create({
        customer: null, user: req.user._id,
        customerSnapshot: { name: req.user.name || "", email: req.user.email || "", phone: contact.phone || req.user.phone || "" },
        tour: tourData._id, bookingSource: "website", bookingType: normalizedType, groupReference: String(groupReference || "").trim(),
        corporateAccount: corporateAccountId, corporateCompanyName: String(corporateCompanyName || req.corporateAccount?.companyName || "").trim(), corporatePin: String(corporatePin || req.corporateAccount?.kraPin || "").trim().toUpperCase(), purchaseOrderNumber: String(purchaseOrderNumber || "").trim(), paymentTerms, billingContact: billingContact || undefined, roomingListReference: String(roomingListReference || "").trim(),
        travelDate, travelers, numberOfGuests: guests,
        contact: { name: contact.name || req.user.name || "", email: contact.email || req.user.email || "", phone: contact.phone || req.user.phone || "" },
        pickupLocation: String(pickupLocation || "").trim(), pickupTime: pickupTime ? new Date(pickupTime) : null, hotelName: String(hotelName || "").trim(), roomNumber: String(roomNumber || "").trim(), emergencyContact,
        specialRequests: Array.isArray(specialRequests) ? specialRequests.map(String).map((x) => x.trim()).filter(Boolean) : [], subtotal: Number(amounts.subtotal || 0), discountAmount: Number(amounts.discountAmount || 0), totalAmount, depositAmount: 0, balanceAmount: totalAmount, paymentMethod: normalizedPaymentMethod, paymentStatus: "pending", status: "pending", assigned: false,
        }),
        onCompensationError: (kind, error) => console.error(kind === "capacity" ? "BOOKING CAPACITY ROLLBACK ERROR:" : "CORPORATE CREDIT ROLLBACK ERROR:", error),
      });
      // Run this operation with a dedicated error-handling path for failures.
      try {
        // Declare admins for use by the surrounding module or function.
        const admins = await User.find(mergeTenantFilter({ $or: [{ role: { $in: ["admin", "super_admin", "superadmin", "manager", "tour_manager", "tourmanager"] } }, { legacyRole: { $in: ["admin", "super_admin", "superadmin", "manager", "tour_manager", "tourmanager"] } }], status: "active" })).select("_id").lean();
        // Check the condition (admins.length) and run the matching branch.
        if (admins.length) await Notification.insertMany(admins.map((admin) => ({ recipient: admin._id, user: admin._id, title: "New Booking", message: `New booking ${booking.bookingNumber || booking._id} is awaiting payment/confirmation.`, type: "booking", relatedModel: "Booking", relatedId: booking._id, actionUrl: "/admin/bookings" })));
      } catch (notificationError) { console.error("CUSTOMER BOOKING NOTIFICATION ERROR:", notificationError.message); }
      // Return the result of res.status(201).json() to the caller.
      return res.status(201).json({ success: true, message: "Booking created successfully", data: { booking }, booking });
    } catch (createError) {
      // Stop the current operation by raising the value of createError.
      throw createError;
    }
  } catch (error) { next(error); }
};
