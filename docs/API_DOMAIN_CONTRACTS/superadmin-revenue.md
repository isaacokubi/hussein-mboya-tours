# Super Admin platform revenue API contract

## GET /api/superadmin/revenue — inventory 410

Route: server/routes/superAdminRevenueRoutes.js mounts GET / with authorize("admin.dashboard"), producing /api/superadmin/revenue. Unlike the neighboring Super Admin operations router, this route does not declare protect or superAdminOnly locally. authorize itself returns 401 when req.user is absent, loads effective permissions and returns 403 when the requested permission is absent.

The permission middleware explicitly grants admin.dashboard through ADMIN_COMPATIBILITY_PERMISSIONS to any user whose normalized role is admin. Platform super-admin roles receive wildcard permission. Thus the route's visible permission boundary is not platform-super-admin-only: an authenticated tenant admin can satisfy admin.dashboard through the compatibility list.

The controller then calls runWithTenant({tenantId:null,tenant:null,bypass:true,role:"super_admin"}) and aggregates Payment records across the platform, explicitly bypassing any stale tenant context. It matches Payment statuses completed and refunded, converts amount/refundedAmount to numbers with invalid/null values treated as zero, and counts completed/refunded payments by currency. Refunded amounts are subtracted only when refundStatus is completed. Revenue is clamped at zero per currency. Totals across currencies are also summed into count fields; monetary totals are not combined across currencies.

The response is 200 {success:true,revenue,grossRevenue,refundedRevenue,revenueCurrency,completedPayments,refundedPayments,byCurrency}. The primary currency is KES when present, otherwise the first aggregation result, otherwise KES with zero amounts. byCurrency contains one row per currency with gross, refunds, net revenue and counts. Errors are delegated to Express via next.

## Security finding

**Potential cross-tenant financial disclosure:** the middleware's admin compatibility permissions include admin.dashboard, and this route uses only authorize("admin.dashboard") rather than an explicit platform-role guard. The handler deliberately enters platform bypass and aggregates every tenant's Payment records. Therefore a tenant admin who reaches this route with an authenticated req.user can receive platform-wide revenue data. The route should be restricted to a platform-super-admin role (or a separate explicit platform-only permission) before the controller runs. This source review documents the finding; it does not silently change authorization behavior.

## Tests and limitations

No focused test was found for getSuperAdminRevenue or the interaction between authorize("admin.dashboard"), admin compatibility permissions and platform tenant bypass. No live API request or financial aggregation was executed.
