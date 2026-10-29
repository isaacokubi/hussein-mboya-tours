import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import { mergeTenantFilter } from "../tenancy/context.js";

/**
 * Repair legacy booking records created by the old checkout flow.
 * That flow could initialize depositAmount to the full total before any
 * provider-confirmed payment existed. Before an STK push, a pending booking
 * with no completed payments must therefore start from zero paid.
 */
export const createPrepareBookingForMpesa = ({ BookingModel = Booking, PaymentModel = Payment } = {}) => async (req, res, next) => {
  try {
    const bookingId = req.body?.bookingId;
    if (!bookingId) return next();

    // This middleware runs before the controller's ownership check. Scope its
    // lookup and repair to the active tenant so a foreign booking ID cannot
    // mutate another tenant's payment state as a side effect of a rejected call.
    const booking = await BookingModel.findOne(mergeTenantFilter({ _id: bookingId }));
    if (!booking) return next();

    const status = String(booking.paymentStatus || "pending").toLowerCase();
    const total = Number(booking.totalAmount || 0);
    const recordedPaid = Number(booking.depositAmount || 0);

    if (status !== "paid" && total > 0 && recordedPaid >= total) {
      const completedPayments = await PaymentModel.countDocuments(mergeTenantFilter({
        booking: booking._id,
        status: "completed",
      }));

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

export const prepareBookingForMpesa = createPrepareBookingForMpesa();
