import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Booking from "../models/Booking.js";
import { getPostedRevenueTotal } from "./financeReportingService.js";

/**
 * Canonical financial revenue metric for tenant-facing operational reporting.
 *
 * Revenue is sourced from posted double-entry accounting journals. Booking
 * counts remain operational metrics and are reported separately.
 */
export const getBookingRevenueMetrics = async (req, extraFilter = {}) => {
  const tenantId = requireTenantId();
  const filter = mergeTenantFilter(req, {
    ...extraFilter,
    isDeleted: { $ne: true, ...(extraFilter.isDeleted || {}) },
    paymentStatus: { $in: ["paid", "completed", "success"] },
    status: { $nin: ["cancelled", "refunded"] },
  });

  const [revenue, paidBookings] = await Promise.all([
    getPostedRevenueTotal(),
    Booking.countDocuments(filter),
  ]);

  return {
    tenantId,
    revenue: Math.round(Number(revenue || 0) * 100) / 100,
    paidBookings: Number(paidBookings || 0),
    currency: "KES",
    basis: "posted_journals",
  };
};
