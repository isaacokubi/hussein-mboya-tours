import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import CorporateAccount from "../models/CorporateAccount.js";
import { reserveSlots, validateTourCapacity, releaseSlots } from "../services/inventoryService.js";
import { PAYMENT_METHODS } from "../constants/bookingConstants.js";
import { calculateBookingAmounts } from "../utils/bookingPricing.js";
import { getSystemSettings } from "../services/settingsService.js";
import { isTenantPaymentMethodAvailable, normalizeTenantPaymentMethod } from "../services/tenantPaymentMethods.js";
import { createCustomerBookingWithReservations } from "../services/customerBookingReservation.js";

export const createCustomerBooking = async (req, res, next) => {
  requireTenantId();
  let corporateAccountId = null;
  try {
    const {
      tour, travelDate, travelers = [], numberOfGuests, contact = {}, paymentMethod = PAYMENT_METHODS.MPESA,
      pickupLocation, pickupTime, hotelName, roomNumber, emergencyContact, specialRequests = [],
      bookingType = "individual", groupReference = "", corporateAccount = null, corporateCompanyName = "",
      corporatePin = "", purchaseOrderNumber = "", paymentTerms = "immediate", billingContact = {}, roomingListReference = "",
    } = req.body || {};

    if (!tour || !travelDate) return res.status(400).json({ success: false, message: "Tour and travel date are required." });
    const normalizedPaymentMethod = normalizeTenantPaymentMethod(paymentMethod);
    const tenantSettings = await getSystemSettings(req);
    if (!normalizedPaymentMethod || !isTenantPaymentMethodAvailable(tenantSettings, normalizedPaymentMethod)) return res.status(409).json({ success: false, message: "This payment method is not currently available for this tenant. Choose another method or contact the tenant administrator." });
    const normalizedType = String(bookingType).toLowerCase();
    if (!["individual", "group", "corporate"].includes(normalizedType)) return res.status(400).json({ success: false, message: "Invalid booking type." });

    const tourData = await Tour.findOne(mergeTenantFilter({ _id: tour, isDeleted: false }));
    if (!tourData) return res.status(404).json({ success: false, message: "Tour not found." });

    const guests = Math.max(Number(numberOfGuests) || travelers.length || 1, 1);
    if (normalizedType === "group" && guests < 2) return res.status(400).json({ success: false, message: "Group bookings require at least two guests." });
    const capacityAvailable = await validateTourCapacity(tourData._id, guests, travelDate);
    if (!capacityAvailable) return res.status(409).json({ success: false, message: "Not enough available tour slots for this booking." });

    const amounts = calculateBookingAmounts(tourData, guests);
    const totalAmount = Number(amounts.totalAmount || 0);
    if (!Number.isFinite(totalAmount) || totalAmount <= 0) return res.status(409).json({ success: false, message: "This tour does not have a valid price." });

    let corporateAccountRecord = null;
    if (normalizedType === "corporate") {
      corporateAccountId = corporateAccount || req.corporateAccount?._id;
      if (!corporateAccountId) return res.status(400).json({ success: false, message: "Corporate account is required." });
      corporateAccountRecord = await CorporateAccount.findOne(mergeTenantFilter({ _id: corporateAccountId, status: "active", $expr: { $or: [{ $eq: ["$creditLimit", 0] }, { $lte: [{ $add: ["$currentBalance", totalAmount] }, "$creditLimit"] }] } }));
      if (!corporateAccountRecord) return res.status(409).json({ success: false, message: "Corporate account is inactive or the booking exceeds its credit limit." });
      if (corporateAccountRecord.requiresPurchaseOrder && !String(purchaseOrderNumber || "").trim()) return res.status(400).json({ success: false, message: "This corporate account requires a purchase order number." });
    }

    try {
      const booking = await createCustomerBookingWithReservations({
        tourId: tourData._id,
        guests,
        travelDate,
        corporateAccountId: normalizedType === "corporate" ? corporateAccountRecord._id : null,
        totalAmount,
        reserveSlots,
        releaseSlots,
        reserveCorporateCredit: async (accountId, amount) => {
          const reserved = await CorporateAccount.findOneAndUpdate(mergeTenantFilter({ _id: accountId, status: "active", $expr: { $or: [{ $eq: ["$creditLimit", 0] }, { $lte: [{ $add: ["$currentBalance", amount] }, "$creditLimit"] }] } }), { $inc: { currentBalance: amount } }, { new: true });
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
      try {
        const admins = await User.find(mergeTenantFilter({ $or: [{ role: { $in: ["admin", "super_admin", "superadmin", "manager", "tour_manager", "tourmanager"] } }, { legacyRole: { $in: ["admin", "super_admin", "superadmin", "manager", "tour_manager", "tourmanager"] } }], status: "active" })).select("_id").lean();
        if (admins.length) await Notification.insertMany(admins.map((admin) => ({ recipient: admin._id, user: admin._id, title: "New Booking", message: `New booking ${booking.bookingNumber || booking._id} is awaiting payment/confirmation.`, type: "booking", relatedModel: "Booking", relatedId: booking._id, actionUrl: "/admin/bookings" })));
      } catch (notificationError) { console.error("CUSTOMER BOOKING NOTIFICATION ERROR:", notificationError.message); }
      return res.status(201).json({ success: true, message: "Booking created successfully", data: { booking }, booking });
    } catch (createError) {
      throw createError;
    }
  } catch (error) { next(error); }
};
