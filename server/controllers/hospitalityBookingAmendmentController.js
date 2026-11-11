/**
 * Purpose: hospitality Booking Amendment Controller HTTP controller. Main declarations: tenantIdOf, clean, asDate, audit, amendHotelBookingProduction.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import HotelBooking from "../models/HotelBooking.js";
// Load ../models/HotelRoomType.js so this module can use its exported dependencies.
import HotelRoomType from "../models/HotelRoomType.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import HotelBookingPayment from "../models/Payment.js";
// Load ../models/HospitalityRoomBlock.js so this module can use its exported dependencies.
import HospitalityRoomBlock from "../models/HospitalityRoomBlock.js";
// Load ../models/HospitalityRatePlan.js so this module can use its exported dependencies.
import HospitalityRatePlan from "../models/HospitalityRatePlan.js";
// Load ../services/hospitalityInvoiceService.js so this module can use its exported dependencies.
import { syncHospitalityInvoicePayments } from "../services/hospitalityInvoiceService.js";
// Load ../services/auditService.js so this module can use its exported dependencies.
import { createAuditLog } from "../services/auditService.js";
// Load ../services/hospitalityInventoryConcurrencyService.js so this module can use its exported dependencies.
import { acquireRoomInventoryGuard } from "../services/hospitalityInventoryConcurrencyService.js";

// Declare tenantIdOf for use by the surrounding module or function.
const tenantIdOf = req => req.tenantId || req.user?.tenantId;
// Declare clean for use by the surrounding module or function.
const clean = value => String(value ?? "").trim();
// Declare asDate for use by the surrounding module or function.
const asDate = value => { const date = new Date(value); return Number.isNaN(date.getTime()) ? null : date; };
// Declare activeBookingStatuses for use by the surrounding module or function.
const activeBookingStatuses = { $nin: ["cancelled", "no_show"] };

// Declare audit for use by the surrounding module or function.
const audit = async (req, action, id, metadata = {}) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    await createAuditLog({
      user: req.user?._id || null,
      action,
      resource: "HotelBooking",
      resourceId: id,
      description: `${action} HotelBooking`,
      method: req.method,
      endpoint: req.originalUrl,
      ipAddress: req.ip,
      userAgent: req.get("user-agent") || "",
      metadata,
    });
  } catch {}
};

// Declare amendHotelBookingProduction for use by the surrounding module or function.
export const amendHotelBookingProduction = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = tenantIdOf(req);
    // Declare booking for use by the surrounding module or function.
    const booking = await HotelBooking.findOne({ _id: req.params.id, tenantId });
    // Check the condition (!booking) and run the matching branch.
    if (!booking) return res.status(404).json({ success: false, message: "Hotel booking not found." });
    // Check the condition (["cancelled", "checked_in", "checked_out", "completed"].includes(booki) and run the matching branch.
    if (["cancelled", "checked_in", "checked_out", "completed"].includes(booking.status)) {
      // Return the result of res.status(409).json() to the caller.
      return res.status(409).json({ success: false, message: "This booking can no longer be amended." });
    }

    // Declare checkIn for use by the surrounding module or function.
    const checkIn = req.body.checkIn ? asDate(req.body.checkIn) : booking.checkIn;
    // Declare checkOut for use by the surrounding module or function.
    const checkOut = req.body.checkOut ? asDate(req.body.checkOut) : booking.checkOut;
    // Declare rooms for use by the surrounding module or function.
    const rooms = req.body.rooms === undefined ? Number(booking.rooms || 1) : Number(req.body.rooms);
    // Declare adults for use by the surrounding module or function.
    const adults = req.body.adults === undefined ? Number(booking.adults || 1) : Number(req.body.adults);
    // Declare children for use by the surrounding module or function.
    const children = req.body.children === undefined ? Number(booking.children || 0) : Number(req.body.children);
    // Check the condition (!checkIn || !checkOut || checkOut <= checkIn || rooms < 1 || adults < ) and run the matching branch.
    if (!checkIn || !checkOut || checkOut <= checkIn || rooms < 1 || adults < 1 || children < 0) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "Invalid amended stay details." });
    }

    // Declare room for use by the surrounding module or function.
    const room = await HotelRoomType.findOne({ _id: booking.roomType, hotel: booking.hotel, tenantId }).lean();
    // Check the condition (!room) and run the matching branch.
    if (!room) return res.status(404).json({ success: false, message: "The booked room type is no longer available." });

    // Declare guardVersion for use by the surrounding module or function.
    const guardVersion = Number(room.inventoryVersion || 0);
    // Declare guardedRoom for use by the surrounding module or function.
    const guardedRoom = await acquireRoomInventoryGuard({ roomTypeId: room._id, tenantId, expectedVersion: guardVersion });
    // Check the condition (!guardedRoom) and run the matching branch.
    if (!guardedRoom) {
      // Return the result of res.status(409).json() to the caller.
      return res.status(409).json({ success: false, message: "Room inventory changed while this amendment was being processed. Please retry the amendment." });
    }

    // Declare nights for use by the surrounding module or function.
    const nights = Math.ceil((checkOut - checkIn) / 86400000);
    // Declare requestedRateId for use by the surrounding module or function.
    const requestedRateId = clean(req.body.ratePlanId || booking.ratePlan);
    // Declare rateFilter for use by the surrounding module or function.
    const rateFilter = {
      tenantId,
      hotel: booking.hotel,
      roomType: booking.roomType,
      status: "active",
      stopSell: false,
      $and: [
        { $or: [{ validFrom: null }, { validFrom: { $lte: checkIn } }] },
        { $or: [{ validTo: null }, { validTo: { $gte: checkOut } }] },
      ],
    };
    // Declare rates for use by the surrounding module or function.
    const rates = await HospitalityRatePlan.find(rateFilter).sort({ nightlyRate: 1, createdAt: 1 }).lean();
    // Declare validRates for use by the surrounding module or function.
    const validRates = rates.filter(rate => nights >= Number(rate.minNights || 1) && (!rate.maxNights || nights <= Number(rate.maxNights)));
    // Declare rate for use by the surrounding module or function.
    let rate = requestedRateId ? validRates.find(item => String(item._id) === requestedRateId) : validRates.find(Boolean);
    // Check the condition (requestedRateId && !rate) and run the matching branch.
    if (requestedRateId && !rate) return res.status(409).json({ success: false, message: "The selected rate plan is not valid for the amended stay." });

    // Declare bookingConflict for use by the surrounding module or function.
    const bookingConflict = await HotelBooking.aggregate([
      { $match: { tenantId, hotel: booking.hotel, roomType: booking.roomType, _id: { $ne: booking._id }, status: activeBookingStatuses, checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } } },
      { $group: { _id: null, rooms: { $sum: "$rooms" } } },
    ]);
    // Declare blockConflict for use by the surrounding module or function.
    const blockConflict = await HospitalityRoomBlock.aggregate([
      { $match: { tenantId, hotel: booking.hotel, roomType: booking.roomType, status: "blocked", startDate: { $lt: checkOut }, endDate: { $gt: checkIn } } },
      { $group: { _id: null, quantity: { $sum: "$quantity" } } },
    ]);
    // Declare bookedRooms for use by the surrounding module or function.
    const bookedRooms = Number(bookingConflict[0]?.rooms || 0);
    // Declare blockedRooms for use by the surrounding module or function.
    const blockedRooms = Number(blockConflict[0]?.quantity || 0);
    // Declare totalRooms for use by the surrounding module or function.
    const totalRooms = Number(guardedRoom.totalRooms || room.totalRooms || 0);
    // Check the condition (bookedRooms + blockedRooms + rooms > totalRooms) and run the matching branch.
    if (bookedRooms + blockedRooms + rooms > totalRooms) {
      // Return the result of res.status(409).json() to the caller.
      return res.status(409).json({ success: false, message: "The amended stay would oversell the selected room type." });
    }

    // Declare capacity for use by the surrounding module or function.
    const capacity = Number(room.maxOccupancy || room.capacity || room.guests || 0);
    // Check the condition (capacity > 0 && adults + children > capacity * rooms) and run the matching branch.
    if (capacity > 0 && adults + children > capacity * rooms) {
      // Return the result of res.status(409).json() to the caller.
      return res.status(409).json({ success: false, message: `The amended guests exceed the room capacity of ${capacity} guest(s) per room.` });
    }

    // Declare nightlyRate for use by the surrounding module or function.
    const nightlyRate = rate ? Number(rate.nightlyRate || 0) : Number(room.nightlyRate || 0);
    // Declare subtotal for use by the surrounding module or function.
    const subtotal = nights * rooms * nightlyRate;
    // Declare taxes for use by the surrounding module or function.
    const taxes = Number(booking.taxes || 0);
    // Declare fees for use by the surrounding module or function.
    const fees = Number(booking.fees || 0);
    // Declare totalAmount for use by the surrounding module or function.
    const totalAmount = subtotal + taxes + fees;

    // Declare completedPayments for use by the surrounding module or function.
    const completedPayments = await HotelBookingPayment.find({
      tenantId,
      hospitalityBooking: booking._id,
      hospitalityType: "hotel",
      status: "completed",
    }).select("amount refundedAmount").lean();
    // Declare paid for use by the surrounding module or function.
    const paid = completedPayments.reduce((sum, payment) => sum + Math.max(0, Number(payment.amount || 0) - Number(payment.refundedAmount || 0)), 0);
    // Check the condition (paid > totalAmount + 0.01) and run the matching branch.
    if (paid > totalAmount + 0.01) {
      // Return the result of res.status(409).json() to the caller.
      return res.status(409).json({ success: false, message: "The amended total is below the amount already paid. Process the required refund before reducing this reservation." });
    }

    // Perform the side effect or state update expressed on the following line.
    booking.checkIn = checkIn;
    // Perform the side effect or state update expressed on the following line.
    booking.checkOut = checkOut;
    // Perform the side effect or state update expressed on the following line.
    booking.rooms = rooms;
    // Perform the side effect or state update expressed on the following line.
    booking.adults = adults;
    // Perform the side effect or state update expressed on the following line.
    booking.children = children;
    // Perform the side effect or state update expressed on the following line.
    booking.mealPlan = req.body.mealPlan || booking.mealPlan;
    // Perform the side effect or state update expressed on the following line.
    booking.specialRequests = req.body.specialRequests === undefined ? booking.specialRequests : clean(req.body.specialRequests);
    // Perform the side effect or state update expressed on the following line.
    booking.subtotal = subtotal;
    // Perform the side effect or state update expressed on the following line.
    booking.taxes = taxes;
    // Perform the side effect or state update expressed on the following line.
    booking.fees = fees;
    // Perform the side effect or state update expressed on the following line.
    booking.totalAmount = totalAmount;
    // Perform the side effect or state update expressed on the following line.
    booking.ratePlan = rate?._id || null;
    // Perform the side effect or state update expressed on the following line.
    booking.updatedBy = req.user?._id || null;
    // Perform the side effect or state update expressed on the following line.
    await booking.save();

    // Perform the side effect or state update expressed on the following line.
    await syncHospitalityInvoicePayments({ type: "hotel", booking });
    // Perform the side effect or state update expressed on the following line.
    await audit(req, "amend", booking._id, {
      checkIn, checkOut, rooms, adults, children, nights,
      ratePlanId: rate?._id || null, nightlyRate, subtotal, totalAmount,
      paid,
    });

    // Return the result of res.json() to the caller.
    return res.json({ success: true, data: booking, pricing: { nights, nightlyRate, subtotal, taxes, fees, totalAmount, paid, balance: Math.max(0, totalAmount - paid) } });
  } catch (error) {
    // Return the result of next() to the caller.
    return next(error);
  }
};
