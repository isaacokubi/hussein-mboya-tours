# Admin booking report contracts

## Shared access

Mounted in `adminRoutes.js`: `protect` → `resolveTenant` → `adminMiddleware`; then route handler. Active admin/super_admin only, tenant required in every report, no branch scope. These routes are outside the `/users` permission subrouter and do not require `user.manage`. Query/database errors are passed to centralized error handling. No report mutates data.

## GET /api/admin/reports/daily

No query/body fields. Computes local-server midnight through 23:59:59.999 for the current date, fetches non-deleted tenant bookings by `createdAt`, populates tour title and agent plus agent user summary, newest first. HTTP 200 `{success:true,count,bookings}`. Date range depends on server timezone. Frontend `client/src/api/adminReportApi.js`.

## GET /api/admin/reports/monthly

Optional query `year`, `month`. Year accepted when integer >= 2000; otherwise current year. Month accepted integer 1–12; otherwise current month. Builds local-time calendar-month bounds, lists non-deleted tenant bookings, populates tour and agent/user, newest first. HTTP 200 `{success:true,year,month,count,bookings}`. No maximum year validation. Caller `adminReportApi.js`.

## GET /api/admin/reports/tours

No query/body. Aggregates non-deleted tenant bookings grouped by tour. It counts all such booking statuses; revenue is recognized only where paymentStatus is paid/completed/success and booking status is not cancelled/refunded, using max(totalAmount-refundAmount,0), or a computed payment-ledger fallback when booking value is zero. Payment lookup accepts completed/refunded status, subtracts refundedAmount, and clamps at zero. Projects `{tourId,title,tourAvailable,totalBookings,revenue}`, sorted by bookings then revenue; missing tours receive `Tour ID: <id>`. HTTP 200 `{success:true,count,data}`.

**Source risk:** in the payment `$lookup`, the pipeline compares `"$tenantId"` with `"$tenantId"` even though a `let.tenantId` variable is declared; without `$$tenantId` this comparison refers to the same document field and does not enforce payment tenant equality. Booking IDs are globally unique ObjectIds, but payment tenant integrity is not checked by this lookup. This report is operational, and its revenue calculation differs from posted-journal revenue analytics.

## GET /api/admin/reports/agents

No query/body. Aggregates non-deleted tenant bookings with non-null agent. Counts all matching bookings; revenue follows paid/non-cancelled/non-refunded rule and net booking value; commission sums `commissionAmount` regardless of payment status. Joins agent profile and user records to resolve name/email/phone/company/status and emits availability flags for missing profile/user. HTTP 200 `{success:true,count,data}` sorted bookings, revenue, name. Joins use ObjectIds but do not include explicit tenant predicates. Caller `adminReportApi.js`.
