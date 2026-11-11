/**
 * Purpose: prepare Booking For Mpesa request middleware. Main declarations: createPrepareBookingForMpesa.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import Booking from "../models/Booking.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { mergeTenantFilter } from "../tenancy/context.js";

/**
 * Repair legacy booking records created by the old checkout flow.
 * That flow could initialize depositAmount to the full total before any
 * provider-confirmed payment existed. Before an STK push, a pending booking
 * with no completed payments must therefore start from zero paid.
 */
// Declare createPrepareBookingForMpesa for use by the surrounding module or function.
export const createPrepareBookingForMpesa = ({ BookingModel = Booking, PaymentModel = Payment } = {}) => async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare bookingId for use by the surrounding module or function.
    const bookingId = req.body?.bookingId;
    // Check the condition (!bookingId) and run the matching branch.
    if (!bookingId) return next();

    // This middleware runs before the controller's ownership check. Scope its
    // lookup and repair to the active tenant so a foreign booking ID cannot
    // mutate another tenant's payment state as a side effect of a rejected call.
    // Declare booking for use by the surrounding module or function.
    const booking = await BookingModel.findOne(mergeTenantFilter({ _id: bookingId }));
    // Check the condition (!booking) and run the matching branch.
    if (!booking) return next();

    // Declare status for use by the surrounding module or function.
    const status = String(booking.paymentStatus || "pending").toLowerCase();
    // Declare total for use by the surrounding module or function.
    const total = Number(booking.totalAmount || 0);
    // Declare recordedPaid for use by the surrounding module or function.
    const recordedPaid = Number(booking.depositAmount || 0);

    // Check the condition (status !== "paid" && total > 0 && recordedPaid >= total) and run the matching branch.
    if (status !== "paid" && total > 0 && recordedPaid >= total) {
      // Declare completedPayments for use by the surrounding module or function.
      const completedPayments = await PaymentModel.countDocuments(mergeTenantFilter({
        booking: booking._id,
        status: "completed",
      }));

      // Check the condition (completedPayments === 0) and run the matching branch.
      if (completedPayments === 0) {
        // Perform the side effect or state update expressed on the following line.
        booking.depositAmount = 0;
        // Perform the side effect or state update expressed on the following line.
        booking.balanceAmount = total;
        // Perform the side effect or state update expressed on the following line.
        booking.paymentStatus = "pending";
        // Check the condition (booking.status === "failed") and run the matching branch.
        if (booking.status === "failed") booking.status = "pending";
        // Perform the side effect or state update expressed on the following line.
        await booking.save();
      }
    }

    // Return the result of next() to the caller.
    return next();
  } catch (error) {
    // Return the result of next() to the caller.
    return next(error);
  }
};

// Declare prepareBookingForMpesa for use by the surrounding module or function.
export const prepareBookingForMpesa = createPrepareBookingForMpesa();
