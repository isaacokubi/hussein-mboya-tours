# Tenant analytics API contracts (entries 174–176)

## Shared access and inputs

`analyticsRoutes.js` is mounted at `/api/analytics`; all routes use `resolveTenant` → `protect` → `adminMiddleware` → `authorize("analytics.view")`. Thus authenticated admin-equivalent user with analytics.view permission and tenant is required; route handlers also call `requireTenantId()`. No branch scope. Client `getAnalytics(params)`/`getRevenueAnalytics(params)` passes query params, but controllers do not read them. In particular, the comprehensive endpoint invokes `getPostedRevenueReport()` with no date options, so query date filters are currently ignored.

## GET `/api/analytics` (174)

No accepted query/body/path fields. Concurrently requests revenue, monthly booking aggregates, top paid tours, tenant customer User count, booking-status groups, posted-journal revenue breakdown, vehicle-status groups, and Commission total (excluding soft-deleted and cancelled). Success 200 `{success:true,data:{revenue,customers,bookings,bookingStatus,monthlyRevenue,popularTours,vehicleStats,profitability}}`; profitability reports `{reportedRevenue,commissionCost,contributionMargin,marginPercent}` with margin floored at zero. Revenue response from analytics service is `{totalRevenue,totalPayments,revenueBasis,currency}` where amount basis is booking revenue service, while monthlyRevenue is `{total,monthly}` from posted JournalEntries; these are distinct bases and may disagree. Errors from any Promise reject the whole response and go to centralized handling. Read-only.

## GET `/api/analytics/dashboard` (175)

No request fields. Parallel `getRevenueAnalytics`, monthly `getBookingAnalytics`, `getPopularTours`; response 200 `{success:true,data:{revenue,bookings,popularTours}}`. Revenue basis is delegated booking revenue service; booking trend groups nondeleted bookings by created month; popular tours groups completed payments by booking, subtracts refunded amount (floored at zero), tenant-checks joined Booking/Tour, and returns top 10. No database writes.

## GET `/api/analytics/revenue` (176)

No accepted params in controller. Returns 200 `{success:true,data:{revenue:{totalRevenue,totalPayments,revenueBasis,currency}}}` from `getBookingRevenueMetrics`. Errors forwarded. The client currently supplies optional params, but they have no effect.

Source: `server/routes/analyticsRoutes.js`, `analyticsController.js`, `analyticsService.js`, `financeReportingService.js`, `bookingRevenueService.js`, tenant query helper and Booking/Payment/Commission/JournalEntry/ChartOfAccount models. Client `client/src/api/analyticsApi.js` imports `client/src/services/analyticsService.js`. No focused analytics endpoint test identified in the test search; source-only verification. Metric bases and date semantics are not interchangeable with cash settlement totals.
