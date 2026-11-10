# Agent dashboard API contract

## Routes and authorization

`GET /api/agents/dashboard` and `GET /api/agent/dashboard` are mounted through `agentRoutes.js` at both prefixes (inventory entries 139–140). The router applies `protect` → `resolveTenant` → `agentMiddleware`; the dashboard route is registered before `requireApprovedAgent`, so a pending or inactive Agent profile may still load this dashboard. The middleware still requires active User status, canonical agent role, tenant context, and an Agent profile (with email fallback for profile lookup). No branch restriction. The controller calls `requireTenantId()`.

## Handler flow and side effects

`getAgentDashboard` resolves the tenant-scoped Agent by User ID or normalized email. If absent, it creates a tenant-bound Agent profile with active status and `isApproved:false`; if a found profile lacks `user`, it links it to the User. It loads tenant/system settings and synchronizes `Agent.commissionRate` to the configured global commission rate (fallback 10 when out of range/missing), which means this nominal dashboard GET can write database state.

It runs parallel Booking and Commission counts/aggregations scoped by Agent and tenant. Metrics include bookings excluding soft-deleted; upcoming bookings in confirmed/assigned/ongoing status with travelDate >= now; completed, pending, cancelled counts; sales from paid bookings except cancelled/failed/refunded; guests excluding cancelled; distinct customers keyed by customer ID or snapshot/contact phone; total commissions excluding cancelled/rejected; and pending/paid commission sums. Sales use Booking.totalAmount, not posted ledger revenue. Recent five bookings are populated with tour/customer/custom-tour summary fields, newest first, then customer/tour fallback values are normalized for the response.

Success 200 `{success:true,data:{agent:{id,companyName,walletBalance,commissionRate,status,isApproved,pendingApproval},statistics:{bookings,upcomingBookings,completedTours,pendingBookings,cancelledBookings,totalSales,totalCommission,pendingCommission,paidCommission,totalGuests,totalCustomers},recentBookings}}`. Any profile create/update, settings, query or aggregation failure is forwarded to centralized error handling; partial metrics are not returned. The multiple writes/queries are not transactional and dashboard retries can repeat profile/commission-rate writes, though those assignments are effectively idempotent.

Frontend: `fetchAgentDashboard` in `client/src/api/agentApi.js`, consumed by `client/src/pages/agent/AgentDashboard.jsx`. No dedicated database-backed endpoint test was found in the targeted test search. This is source verification only, not live execution.
