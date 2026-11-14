/**
 * Read-only, tenant-scoped booking lookup for selecting a legitimate booking
 * before an administrator performs a controlled M-Pesa Sandbox checkout.
 */
import Booking from "../models/Booking.js";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";

export const getMpesaSandboxBookingCandidates = async (req, res, next) => {
  try {
    requireTenantId();
    const bookings = await Booking.find(mergeTenantFilter({
      isDeleted: { $ne: true },
      paymentStatus: { $in: ["pending", "partial"] },
      status: { $nin: ["cancelled", "refunded"] },
      totalAmount: { $gt: 0 },
    }))
      .select("_id bookingNumber totalAmount amountPaid balanceAmount paymentStatus status travelDate createdAt")
      .sort({ createdAt: 1 })
      .limit(10)
      .lean();

    const candidates = bookings
      .map((booking) => {
        const totalAmount = Number(booking.totalAmount || 0);
        const amountPaid = Number(booking.amountPaid || 0);
        const storedBalance = Number(booking.balanceAmount);
        const amountDue = Number.isFinite(storedBalance)
          ? Math.max(0, storedBalance)
          : Math.max(0, totalAmount - amountPaid);
        return {
          id: String(booking._id),
          bookingNumber: booking.bookingNumber || "",
          totalAmount,
          amountPaid,
          amountDue,
          paymentStatus: booking.paymentStatus,
          bookingStatus: booking.status,
          travelDate: booking.travelDate || null,
          createdAt: booking.createdAt || null,
        };
      })
      .filter((booking) => booking.amountDue > 0);

    return res.status(200).json({
      success: true,
      purpose: "Read-only booking selection for M-Pesa Sandbox testing",
      candidates,
      count: candidates.length,
    });
  } catch (error) {
    return next(error);
  }
};

export default { getMpesaSandboxBookingCandidates };
