import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { reserveSlots, validateTourCapacity, releaseSlots } from "../services/inventoryService.js";
import { PAYMENT_METHODS } from "../constants/bookingConstants.js";
import { calculateBookingAmounts } from "../utils/bookingPricing.js";

export const createCustomerBooking = async (req, res, next) => {
  requireTenantId();
  try {
    const { tour, travelDate, travelers = [], numberOfGuests, contact = {}, paymentMethod = PAYMENT_METHODS.MPESA, pickupLocation, pickupTime, hotelName, roomNumber, emergencyContact, specialRequests = [] } = req.body || {};

    if (!tour || !travelDate) return res.status(400).json({ success: false, message: "Tour and travel date are required." });

    const tourData = await Tour.findById(tour);
    if (!tourData || tourData.isDeleted) return res.status(404).json({ success: false, message: "Tour not found." });

    const guests = Math.max(Number(numberOfGuests) || travelers.length || 1, 1);
    const capacityAvailable = await validateTourCapacity(tour, guests, travelDate);
    if (!capacityAvailable) return res.status(409).json({ success: false, message: "Not enough available tour slots for this booking." });

    const amounts = calculateBookingAmounts(tourData, guests);
    const totalAmount = Number(amounts.totalAmount || 0);
    if (!Number.isFinite(totalAmount) || totalAmount <= 0) return res.status(409).json({ success: false, message: "This tour does not have a valid price." });

    await reserveSlots(tour, guests);

    try {
      const booking = await Booking.create({
        customer: null,
        user: req.user._id,
        customerSnapshot: { name: req.user.name || "", email: req.user.email || "", phone: contact.phone || req.user.phone || "" },
        tour,
        bookingSource: "website",
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
        const admins = await User.find({
          $or: [
            { role: { $in: ["admin", "super_admin", "superadmin", "manager", "tour_manager", "tourmanager"] } },
            { legacyRole: { $in: ["admin", "super_admin", "superadmin", "manager", "tour_manager", "tourmanager"] } },
          ],
          status: "active",
        }).select("_id").lean();
        if (admins.length) await Notification.insertMany(admins.map((admin) => ({ recipient: admin._id, user: admin._id, title: "New Booking", message: `New booking ${booking.bookingNumber || booking._id} is awaiting payment/confirmation.`, type: "booking", relatedModel: "Booking", relatedId: booking._id, actionUrl: "/admin/bookings" })));
      } catch (notificationError) {
        console.error("CUSTOMER BOOKING NOTIFICATION ERROR:", notificationError.message);
      }

      return res.status(201).json({ success: true, message: "Booking created successfully", data: { booking }, booking });
    } catch (createError) {
      await releaseSlots(tour, guests).catch((error) => console.error("BOOKING CAPACITY ROLLBACK ERROR:", error));
      throw createError;
    }
  } catch (error) {
    next(error);
  }
};
