import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";

/**
 * Repair legacy booking records created by the old checkout flow.
 * That flow could initialize depositAmount to the full total before any
 * provider-confirmed payment existed. Before an STK push, a pending booking
 * with no completed payments must therefore start from zero paid.
 */
export const prepareBookingForMpesa = async (req, res, next) => {
  try {
    const bookingId = req.body?.bookingId;
    if (!bookingId) return next();

    const booking = await Booking.findById(bookingId);
    if (!booking) return next();

    const status = String(booking.paymentStatus || "pending").toLowerCase();
    const total = Number(booking.totalAmount || 0);
    const recordedPaid = Number(booking.depositAmount || 0);

    if (status !== "paid" && total > 0 && recordedPaid >= total) {
      const completedPayments = await Payment.countDocuments({
        booking: booking._id,
        status: "completed",
      });

      if (completedPayments === 0) {
        booking.depositAmount = 0;
        booking.balanceAmount = total;
        booking.paymentStatus = "pending";
        if (booking.status === "failed") booking.status = "pending";
        await booking.save();
      }
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
