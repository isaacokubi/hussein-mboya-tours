import HotelBooking from "../models/HotelBooking.js";
import HotelRoomType from "../models/HotelRoomType.js";
import HotelBookingPayment from "../models/Payment.js";
import HospitalityRoomBlock from "../models/HospitalityRoomBlock.js";
import HospitalityRatePlan from "../models/HospitalityRatePlan.js";
import { syncHospitalityInvoicePayments } from "../services/hospitalityInvoiceService.js";
import { createAuditLog } from "../services/auditService.js";
import { acquireRoomInventoryGuard } from "../services/hospitalityInventoryConcurrencyService.js";

const tenantIdOf = req => req.tenantId || req.user?.tenantId;
const clean = value => String(value ?? "").trim();
const asDate = value => { const date = new Date(value); return Number.isNaN(date.getTime()) ? null : date; };
const activeBookingStatuses = { $nin: ["cancelled", "no_show"] };

const audit = async (req, action, id, metadata = {}) => {
  try {
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

export const amendHotelBookingProduction = async (req, res, next) => {
  try {
    const tenantId = tenantIdOf(req);
    const booking = await HotelBooking.findOne({ _id: req.params.id, tenantId });
    if (!booking) return res.status(404).json({ success: false, message: "Hotel booking not found." });
    if (["cancelled", "checked_in", "checked_out", "completed"].includes(booking.status)) {
      return res.status(409).json({ success: false, message: "This booking can no longer be amended." });
    }

    const checkIn = req.body.checkIn ? asDate(req.body.checkIn) : booking.checkIn;
    const checkOut = req.body.checkOut ? asDate(req.body.checkOut) : booking.checkOut;
    const rooms = req.body.rooms === undefined ? Number(booking.rooms || 1) : Number(req.body.rooms);
    const adults = req.body.adults === undefined ? Number(booking.adults || 1) : Number(req.body.adults);
    const children = req.body.children === undefined ? Number(booking.children || 0) : Number(req.body.children);
    if (!checkIn || !checkOut || checkOut <= checkIn || rooms < 1 || adults < 1 || children < 0) {
      return res.status(400).json({ success: false, message: "Invalid amended stay details." });
    }

    const room = await HotelRoomType.findOne({ _id: booking.roomType, hotel: booking.hotel, tenantId }).lean();
    if (!room) return res.status(404).json({ success: false, message: "The booked room type is no longer available." });

    const guardVersion = Number(room.inventoryVersion || 0);
    const guardedRoom = await acquireRoomInventoryGuard({ roomTypeId: room._id, tenantId, expectedVersion: guardVersion });
    if (!guardedRoom) {
      return res.status(409).json({ success: false, message: "Room inventory changed while this amendment was being processed. Please retry the amendment." });
    }

    const nights = Math.ceil((checkOut - checkIn) / 86400000);
    const requestedRateId = clean(req.body.ratePlanId || booking.ratePlan);
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
    const rates = await HospitalityRatePlan.find(rateFilter).sort({ nightlyRate: 1, createdAt: 1 }).lean();
    const validRates = rates.filter(rate => nights >= Number(rate.minNights || 1) && (!rate.maxNights || nights <= Number(rate.maxNights)));
    let rate = requestedRateId ? validRates.find(item => String(item._id) === requestedRateId) : validRates.find(Boolean);
    if (requestedRateId && !rate) return res.status(409).json({ success: false, message: "The selected rate plan is not valid for the amended stay." });

    const bookingConflict = await HotelBooking.aggregate([
      { $match: { tenantId, hotel: booking.hotel, roomType: booking.roomType, _id: { $ne: booking._id }, status: activeBookingStatuses, checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } } },
      { $group: { _id: null, rooms: { $sum: "$rooms" } } },
    ]);
    const blockConflict = await HospitalityRoomBlock.aggregate([
      { $match: { tenantId, hotel: booking.hotel, roomType: booking.roomType, status: "blocked", startDate: { $lt: checkOut }, endDate: { $gt: checkIn } } },
      { $group: { _id: null, quantity: { $sum: "$quantity" } } },
    ]);
    const bookedRooms = Number(bookingConflict[0]?.rooms || 0);
    const blockedRooms = Number(blockConflict[0]?.quantity || 0);
    const totalRooms = Number(guardedRoom.totalRooms || room.totalRooms || 0);
    if (bookedRooms + blockedRooms + rooms > totalRooms) {
      return res.status(409).json({ success: false, message: "The amended stay would oversell the selected room type." });
    }

    const capacity = Number(room.maxOccupancy || room.capacity || room.guests || 0);
    if (capacity > 0 && adults + children > capacity * rooms) {
      return res.status(409).json({ success: false, message: `The amended guests exceed the room capacity of ${capacity} guest(s) per room.` });
    }

    const nightlyRate = rate ? Number(rate.nightlyRate || 0) : Number(room.nightlyRate || 0);
    const subtotal = nights * rooms * nightlyRate;
    const taxes = Number(booking.taxes || 0);
    const fees = Number(booking.fees || 0);
    const totalAmount = subtotal + taxes + fees;

    const completedPayments = await HotelBookingPayment.find({
      tenantId,
      hospitalityBooking: booking._id,
      hospitalityType: "hotel",
      status: "completed",
    }).select("amount refundedAmount").lean();
    const paid = completedPayments.reduce((sum, payment) => sum + Math.max(0, Number(payment.amount || 0) - Number(payment.refundedAmount || 0)), 0);
    if (paid > totalAmount + 0.01) {
      return res.status(409).json({ success: false, message: "The amended total is below the amount already paid. Process the required refund before reducing this reservation." });
    }

    booking.checkIn = checkIn;
    booking.checkOut = checkOut;
    booking.rooms = rooms;
    booking.adults = adults;
    booking.children = children;
    booking.mealPlan = req.body.mealPlan || booking.mealPlan;
    booking.specialRequests = req.body.specialRequests === undefined ? booking.specialRequests : clean(req.body.specialRequests);
    booking.subtotal = subtotal;
    booking.taxes = taxes;
    booking.fees = fees;
    booking.totalAmount = totalAmount;
    booking.ratePlan = rate?._id || null;
    booking.updatedBy = req.user?._id || null;
    await booking.save();

    await syncHospitalityInvoicePayments({ type: "hotel", booking });
    await audit(req, "amend", booking._id, {
      checkIn, checkOut, rooms, adults, children, nights,
      ratePlanId: rate?._id || null, nightlyRate, subtotal, totalAmount,
      paid,
    });

    return res.json({ success: true, data: booking, pricing: { nights, nightlyRate, subtotal, taxes, fees, totalAmount, paid, balance: Math.max(0, totalAmount - paid) } });
  } catch (error) {
    return next(error);
  }
};
