/**
 * Purpose: booking Revenue Service business-logic service. Main declarations: getBookingRevenueMetrics.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ./financeReportingService.js so this module can use its exported dependencies.
import { getPostedRevenueTotal } from "./financeReportingService.js";

/**
 * Canonical financial revenue metric for tenant-facing operational reporting.
 *
 * Revenue is sourced from posted double-entry accounting journals. Booking
 * counts remain operational metrics and are reported separately.
 */
// Declare getBookingRevenueMetrics for use by the surrounding module or function.
export const getBookingRevenueMetrics = async (req, extraFilter = {}) => {
  // Declare tenantId for use by the surrounding module or function.
  const tenantId = requireTenantId();
  // Declare filter for use by the surrounding module or function.
  const filter = mergeTenantFilter(req, {
    ...extraFilter,
    isDeleted: { $ne: true, ...(extraFilter.isDeleted || {}) },
    paymentStatus: { $in: ["paid", "completed", "success"] },
    status: { $nin: ["cancelled", "refunded"] },
  });

  // Declare [revenue, paidBookings] for use by the surrounding module or function.
  const [revenue, paidBookings] = await Promise.all([
    getPostedRevenueTotal(),
    Booking.countDocuments(filter),
  ]);

  // Return the object assembled below to the caller.
  return {
    tenantId,
    revenue: Math.round(Number(revenue || 0) * 100) / 100,
    paidBookings: Number(paidBookings || 0),
    currency: "KES",
    basis: "posted_journals",
  };
};
