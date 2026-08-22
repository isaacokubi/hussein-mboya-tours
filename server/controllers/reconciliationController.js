import { mergeTenantFilter } from "../tenancy/context.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";
import Payment from "../models/Payment.js";

export const getPaymentReconciliation = async (req, res, next) => {
  try {
    const payments = await Payment.find(tenantFilter(req))
      .populate(
        "booking",
        "bookingNumber paymentStatus totalAmount status"
      )
      .populate(
        "customer",
        "name email phone"
      )
      .sort({ createdAt: -1 })
      .lean();

    const summary = {
      total: payments.length,
      completed: payments.filter(
        (p) => p.status === "completed"
      ).length,
      pending: payments.filter(
        (p) => ["pending", "processing"].includes(p.status)
      ).length,
      failed: payments.filter(
        (p) => ["failed", "cancelled"].includes(p.status)
      ).length,
      refunded: payments.filter(
        (p) => p.status === "refunded"
      ).length,
      missingReceipt: payments.filter(
        (p) =>
          p.status === "completed" &&
          !p.mpesaReceiptNumber &&
          String(p.provider || "").toUpperCase() === "MPESA"
      ).length,
    };

    const mismatches = payments.filter((payment) => {
      if (!payment.booking) return true;

      if (payment.status === "completed") {
        const bookingPaymentStatus =
          payment.booking.paymentStatus;

        const bookingAmount =
          Number(payment.booking.totalAmount || 0);

        const paymentAmount =
          Number(payment.amount || 0);

        const amountMismatch =
          bookingAmount > 0 &&
          paymentAmount > bookingAmount;

        return (
          bookingPaymentStatus !== "paid" ||
          amountMismatch
        );
      }

      if (payment.status === "refunded") {
        return payment.booking.paymentStatus !== "refunded";
      }

      return false;
    });

    return res.json({
      success: true,
      data: {
        summary,
        mismatches,
        payments,
      },
    });
  } catch (error) {
    next(error);
  }
};
