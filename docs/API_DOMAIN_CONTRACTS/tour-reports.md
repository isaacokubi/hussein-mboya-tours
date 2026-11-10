# Tour reports API contract

## Route and authorization

server/routes/index.js mounts tourReportRoutes at /tour-reports, producing GET /api/tour-reports. The router applies resolveTenant, then protect, then roleMiddleware("admin", "manager", "super_admin") before getTourReports. roleMiddleware delegates to requireRoles; role aliases are normalized by authMiddleware/roleUtils. The handler calls requireTenantId before its try/catch, then scopes ordinary model reads with mergeTenantFilter. Aggregations that bypass Mongoose query middleware explicitly match tenantId.

No query, path or body parameters are read. The route accepts no report-period filters; the monthly series covers all posted journal entries available to the tenant, grouped by journal entry year/month.

## GET /api/tour-reports — inventory 584

Handler: getTourReports. It creates tenant-scoped filters excluding soft-deleted bookings, tours and completed payments, then executes eight independent reads concurrently:

- totalBookings: Booking.countDocuments over every non-deleted tenant booking. This is not limited to paid, active or completed bookings.
- totalRevenue: getBookingRevenueMetrics(req).revenue. The service requires tenant context, counts paid bookings separately (the count is not included in this endpoint response), and obtains revenue from getPostedRevenueTotal. The returned amount is rounded to two decimals and is based on posted accounting journals, not the sum of Booking.totalAmount or Payment.amount.
- bookingStatus: a tenant-scoped Booking aggregation grouped by status, counting non-deleted bookings in each status. It includes any stored status values, including cancelled/refunded if present.
- popularTours: a Payment aggregation matching completed, non-deleted payments for the tenant, joining the referenced booking and requiring that booking to be non-deleted and same-tenant, then joining the tour and requiring it to be non-deleted and same-tenant. It groups by tour, counts distinct booking IDs and sums net payment value as max(0, amount - refundedAmount), sorts by booking count then revenue descending, and returns at most five tours with title, slug, price and image projection.
- monthlyRevenue: getPostedRevenueReport().monthly. This is a tenant-scoped journal report over status=posted entries and active same-tenant revenue ChartOfAccount rows. It groups net journal-line credit less debit by calendar year/month and returns rounded revenue and distinct journal transaction count.
- totalCustomers: count of tenant users whose role or legacyRole is customer.
- totalTours: count of non-deleted tenant tours.
- completedTours: count of non-deleted tenant tours with status completed.

Success is 200 {success:true,data:{totalBookings,totalRevenue,totalCustomers,totalTours,completedTours,bookingStatus,popularTours,monthlyRevenue,revenueBasis:"posted_journals"}}. Errors inside the main read block are logged and passed to next(error); requireTenantId is invoked before the try block.

## Financial interpretation and limitations

The top-level totalRevenue and monthlyRevenue both use posted journal entries. popularTours[].revenue uses net completed Payment records instead. These are intentionally different source bases and need not reconcile exactly to one another or to booking face values. The endpoint labels only the top-level/monthly report basis as posted_journals.

The popular-tour aggregation filters deleted and cross-tenant booking/tour records but does not exclude bookings whose status is cancelled or refunded. A completed payment linked to such a booking can still contribute to the popular-tour count/revenue. Payment status must be completed; records whose status is refunded are not included, although partially refunded completed payments contribute amount less refundedAmount.

The aggregation projects tour.images from the raw tours collection. Tour.images is a Mongoose virtual assembled from featuredImage/gallery and is not a persisted field, so this raw aggregation projection should not be assumed to return the same image value as a hydrated Tour document.

getTourReports invokes getBookingRevenueMetrics(req), which calls getPostedRevenueTotal(), and separately invokes getPostedRevenueReport() for monthlyRevenue. Both helpers execute the posted-revenue aggregation; the total helper currently computes the monthly facet too and discards it, so the endpoint performs redundant journal aggregation work.

No from/to filter is accepted by this endpoint. The report is an unbounded tenant-wide snapshot assembled from independent parallel reads, not a transactionally consistent point-in-time report. No dedicated tourReportController/route test was found in the searched test paths; no live HTTP request or database-backed report run was performed in this documentation pass.
