import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import CorporateAccount from "../models/CorporateAccount.js";
import { reserveSlots, validateTourCapacity, releaseSlots } from "../services/inventoryService.js";
import { PAYMENT_METHODS } from "../constants/bookingConstants.js";
import { calculateBookingAmounts } from "../utils/bookingPricing.js";

export const createCustomerBooking = async (req, res, next) => {
  requireTenantId();
  let corporateReserved = false;
  try {
    const {
      tour, travelDate, travelers = [], numberOfGuests, contact = {}, paymentMethod = PAYMENT_METHODS.MPESA,
      pickupLocation, pickupTime, hotelName, roomNumber, emergencyContact, specialRequests = [],
      bookingType = "individual", groupReference = "", corporateAccount = null, corporateCompanyName = "",
      corporatePin = "", purchaseOrderNumber = "", paymentTerms = "immediate", billingContact = {}, roomingListReference = "",
    } = req.body || {};

    const normalizedType = String(bookingType).toLowerCase();
    if (!["individual", "group", "corporate"].includes(normalizedType)) return res.status(400).json({ success: false, message: "Invalid booking type." });
    if (!tour || !travelDate) return res.status(400).json({ success: false, message: "Tour and travel date are required." });

    const tourData = await Tour.findOne(mergeTenantFilter({ _id: tour, isDeleted: false }));
    if (!tourData) return res.status(404).json({ success: false, message: "Tour not found." });

    const guests = Math.max(Number(numberOfGuests) || travelers.length || 1, 1);
    if (normalizedType === "group" && guests < 2) return res.status(400).json({ success: false, message: "Group bookings require at least two guests." });

    const capacityAvailable = await validateTourCapacity(tourData._id, guests, travelDate);
    if (!capacityAvailable) return res.status(409).json({ success: false, message: "Not enough available tour slots for this booking." });

    const amounts = calculateBookingAmounts(tourData, guests);
    const totalAmount = Number(amounts.totalAmount || 0);
    if (!Number.isFinite(totalAmount) || totalAmount <= 0) return res.status(409).json({ success: false, message: "This tour does not have a valid price." });

    let accountId = null;
    if (normalizedType === "corporate") {
      accountId = corporateAccount || req.corporateAccount?._id;
      if (!accountId) return res.status(400).json({ success: false, message: "Corporate account is required." });
      const account = await CorporateAccount.findOneAndUpdate(
        mergeTenantFilter({ _id: accountId, status: "active" }),
        [
          { $set: { currentBalance: { $add: ["$currentBalance", totalAmount] } } },
          { $set: { _creditExceeded: { $and: [{ $gt: ["$creditLimit", 0] }, { $gt: ["$currentBalance", "$creditLimit"] }] } } },
        ],
        { new: true }
      );
      if (!account) return res.status(409).json({ success: false, message: "Corporate account is not active in this tenant." });
      if (account._creditExceeded) {
        await CorporateAccount.updateOne(mergeTenantFilter({ _id: account._id }), { $inc: { currentBalance: -totalAmount }, $unset: { _creditExceeded: 1 } });
        return res.status(409).json({ success: false, message: "Corporate credit limit exceeded." });
      }
      await CorporateAccount.updateOne(mergeTenantFilter({ _id: account._id }), { $unset: { _creditExceeded: 1 } });
      corporateReserved = true;
    }

    await reserveSlots(tourData._id, guests);
    try {
      const booking = await Booking.create({
        customer: null,
        user: req.user._id,
        customerSnapshot: { name: req.user.name || "", email: req.user.email || "", phone: contact.phone || req.user.phone || "" },
        tour: tourData._id,
        bookingSource: "website",
        bookingType: normalizedType,
        groupReference: String(groupReference || "").trim(),
        corporateAccount: accountId,
        corporateCompanyName: String(corporateCompanyName || req.corporateAccount?.companyName || "").trim(),
        corporatePin: String(corporatePin || req.corporateAccount?.kraPin || "").trim().toUpperCase(),
        purchaseOrderNumber: String(purchaseOrderNumber || "").trim(),
        paymentTerms,
        billingContact: billingContact || undefined,
        roomingListReference: String(roomingListReference || "").trim(),
        travelDate,
        travelers,
        numberOfGuests: guests,
        contact: { name: contact.name || req.user.name || "", email: contact.email || req.user.email || "", phone: contact.phone || req.user.phone || "" },
        pickupLocation: String(pickupLocation || "").trim(),
        pickupTime: pickupTime ? new Date(pickupTime) : null,
        hotelName: String(hotelName || "").trim(),
        roomNumber: String(roomNumber || "").trim(),
        emergencyContact,
        specialRequests: Array.isArray(specialRequests) ? specialRequests.map(String).map((x) => x.trim()).filter(Boolean) : [],
        subtotal: Number(amounts.subtotal || 0),
        discountAmount: Number(amounts.discountAmount || 0),
        totalAmount,
        depositAmount: 0,
        balanceAmount: totalAmount,
        paymentMethod,
        paymentStatus: "pending",
        status: "pending",
        assigned: false,
      });

      try {
        const admins = await User.find(mergeTenantFilter({ $or: [
          { role: { $in: ["admin", "super_admin", "superadmin", "manager", "tour_manager", "tourmanager"] } },
          { legacyRole: { $in: ["admin", "super_admin", "superadmin", "manager", "tour_manager", "tourmanager"] } },
        ], status: "active" })).select("_id").lean();
        if (admins.length) await Notification.insertMany(admins.map((admin) => ({ recipient: admin._id, user: admin._id, title: "New Booking", message: `New booking ${booking.bookingNumber || booking._id} is awaiting payment/confirmation.`, type: "booking", relatedModel: "Booking", relatedId: booking._id, actionUrl: "/admin/bookings" })));
      } catch (notificationError) { console.error("CUSTOMER BOOKING NOTIFICATION ERROR:", notificationError.message); }

      return res.status(201).json({ success: true, message: "Booking created successfully", data: { booking }, booking });
    } catch (createError) {
      await releaseSlots(tourData._id, guests).catch((error) => console.error("BOOKING CAPACITY ROLLBACK ERROR", error));
      if (corporateReserved && accountId) await CorporateAccount.updateOne(mergeTenantFilter({ _id: accountId }), { $inc: { currentBalance: -totalAmount } }).catch((error) => console.error("CORPORATE CREDIT ROLLBACK ERROR", error));
      throw createError;
    }
  } catch (error) { next(error); }
};