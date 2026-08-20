import Booking from "../models/Booking.js";

/**
 * A booking may be planned and assigned while partially paid, but it must
 * never be moved into an active/completed trip state until its outstanding
 * balance is zero and its payment status is fully paid.
 */
export const requireFullPaymentForTrip = async (req, res, next) => {
  try {
    const targetStatus = String(req.body?.status || "").trim().toLowerCase();

    if (!targetStatus || !["ongoing", "completed"].includes(targetStatus)) {
      return next();
    }

    const booking = await Booking.findById(req.params.id).select(
      "paymentStatus totalAmount amountPaid paidAmount depositAmount balanceAmount"
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    const total = Number(booking.totalAmount || 0);
    const paid = Number(
      booking.amountPaid ?? booking.paidAmount ?? booking.depositAmount ?? 0
    );
    const balance = Math.max(
      Number.isFinite(Number(booking.balanceAmount))
        ? Number(booking.balanceAmount)
        : total - paid,
      0
    );

    if (balance > 0 || String(booking.paymentStatus || "").toLowerCase() !== "paid") {
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

    return next();
  } catch (error) {
    return next(error);
  }
};
