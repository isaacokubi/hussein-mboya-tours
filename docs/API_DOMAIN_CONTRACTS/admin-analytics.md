# Admin booking and revenue analytics

## Shared access

Both routes are mounted under `/api/admin` in `adminRoutes.js`. Router middleware is `protect` → `resolveTenant` → `adminMiddleware`; unlike adjacent `/users` endpoints, these two routes are registered before and outside `checkPermission("user.manage")`. Admin middleware restricts to active `admin`/`super_admin`. Tenant ID is required by both handlers and query predicates include that tenant. No branch restriction. No endpoint request fields.

## GET /api/admin/bookings/analytics

Aggregates non-deleted tenant Booking records by `status`, count descending. HTTP 200 `{success:true,data:{status:[{_id:<status>,count:<number>},...]}}` (status values are not normalized). Database errors pass to centralized error handling. Frontend wrapper is `getBookingAnalytics` in `client/src/api/adminApi.js`.

## GET /api/admin/revenue/analytics

Calls `getPostedRevenueReport()` from `financeReportingService`. That report includes only posted journal entries and active tenant revenue accounts, groups credits minus debits by journal entry month, rounds each monthly amount to two decimals, and counts distinct journal IDs per month. HTTP 200 `{success:true,data:{monthly:[{_id:{year,month},revenue,transactions},...],revenueBasis:"posted_journals"}}`. No date query filters are exposed by this controller. This is accounting journal revenue, not a sum of booking totals or payment records. Errors pass to centralized handling. Frontend wrapper is `getRevenueAnalytics` in `client/src/api/adminApi.js`.
