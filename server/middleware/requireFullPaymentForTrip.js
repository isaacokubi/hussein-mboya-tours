/**
 * Purpose: require Full Payment For Trip request middleware. Main declarations: requireFullPaymentForTrip.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import Booking from "../models/Booking.js";

/**
 * A booking may be planned and assigned while partially paid, but it must
 * never be moved into an active/completed trip state until its outstanding
 * balance is zero and its payment status is fully paid.
 */
// Declare requireFullPaymentForTrip for use by the surrounding module or function.
export const requireFullPaymentForTrip = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare targetStatus for use by the surrounding module or function.
    const targetStatus = String(req.body?.status || "").trim().toLowerCase();

    // Check the condition (!targetStatus || !["ongoing", "completed"].includes(targetStatus)) and run the matching branch.
    if (!targetStatus || !["ongoing", "completed"].includes(targetStatus)) {
      // Return the result of next() to the caller.
      return next();
    }

    // Declare booking for use by the surrounding module or function.
    const booking = await Booking.findById(req.params.id).select(
      "paymentStatus totalAmount amountPaid paidAmount depositAmount balanceAmount"
    );

    // Check the condition (!booking) and run the matching branch.
    if (!booking) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    // Declare total for use by the surrounding module or function.
    const total = Number(booking.totalAmount || 0);
    // Declare paid for use by the surrounding module or function.
    const paid = Number(
      booking.amountPaid ?? booking.paidAmount ?? booking.depositAmount ?? 0
    );
    // Declare balance for use by the surrounding module or function.
    const balance = Math.max(
      Number.isFinite(Number(booking.balanceAmount))
        ? Number(booking.balanceAmount)
        : total - paid,
      0
    );

    // Check the condition (balance > 0 || String(booking.paymentStatus || "").toLowerCase() !== ") and run the matching branch.
    if (balance > 0 || String(booking.paymentStatus || "").toLowerCase() !== "paid") {
      // Return the result of res.status(409).json() to the caller.
      return res.status(409).json({
        success: false,
        code: "PAYMENT_REQUIRED_BEFORE_TRIP",
        message: `This booking still has an outstanding balance of KES ${balance.toLocaleString()}. The customer must complete payment before the trip can start or be completed.`,
        paymentStatus: booking.paymentStatus,
        totalAmount: total,
        amountPaid: paid,
        balanceAmount: balance,
      });
    }

    // Return the result of next() to the caller.
    return next();
  } catch (error) {
    // Return the result of next() to the caller.
    return next(error);
  }
};
