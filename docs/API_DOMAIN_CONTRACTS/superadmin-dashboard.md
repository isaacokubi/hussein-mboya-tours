# Super Admin dashboard metrics API contract

## GET /api/superadmin/dashboard/metrics — inventory 415
## GET /api/superadmin/dashboard/metrics — inventory 416
## GET /api/superadmin/dashboard — inventory 417
## GET /api/superadmin/dashboard — inventory 418

All four inventory entries are mounted aliases in server/routes/superAdminRoutes.js and invoke getSuperAdminDashboardMetrics. The router-wide middleware is protect followed by superAdminOnly. superAdminOnly returns 401 when req.user is absent and 403 unless isSuperAdmin(req.user) is true. No request body, query parameter or path parameter is read by the controller.

## Handler behavior

The controller uses mongoose.connection.db directly. If the database handle is unavailable, it returns 503 {success:false,message:"Database connection is not ready."}. It queries organizations with status active or trial, projects tenant identity/name/slug/status/createdAt/subscription, and sorts oldest first. Those tenant IDs define a tenant filter for operational collections; when no eligible tenant exists, the filter is tenantId:null.

The controller obtains canonical customer-account/profile/admin metrics from superAdminDataConsistency.js, then concurrently counts platform users by active/suspended/blocked status and tenant-scoped staff, agents, approved agents, vehicles by availability/assignment/maintenance, tours, destinations, bookings by pending/confirmed state and payments/completed payments. Staff, agents and vehicles exclude isDeleted:true. User status totals are read across the users collection without a tenant filter; the platform-only guard is the security boundary.

Revenue aggregation includes completed payments for eligible tenants, normalizes missing currency to KES and currency names to uppercase, converts invalid/null amount values to zero, counts refunds only when refundStatus is completed, groups by currency, and clamps net revenue to zero. KES is the primary displayed currency when available; otherwise the first sorted currency is selected, with KES/zero as fallback. Currency-specific results remain available in revenueByCurrency; the controller does not sum unlike currencies into one converted amount.

Per-tenant summaries include users, customer profiles/accounts, admins, staff, agents, vehicles, available vehicles, tours, destinations, bookings, payments and completed payments. A consistency object sums the corresponding tenant-summary fields. The response is 200 {success:true,scope:{type:"platform",tenantCount,activeTenantCount,trialTenantCount},data:{...metrics,tenants,consistency},timestamp}. Errors are logged and returned as 500 {success:false,message}, using publicErrorMessage with fallback "Unable to load platform metrics."

## Canonical customer metric semantics

The shared service counts active tenant-owned User accounts and resolves their effective role from linked Role.name, then User.role, then User.legacyRole. It separately counts active, non-deleted CustomerProfile records. A profile's own tenantId is preferred; legacy records without tenantId inherit tenantId from the linked User. An explicit profile/user tenant mismatch is excluded. The service returns customerAccounts, customerProfiles, activeAccounts and tenantAdmins.

## Caveats and test evidence

The four inventory rows represent two duplicated route declarations/aliases, not four distinct controller implementations. The controller uses native MongoDB collection operations, so Mongoose tenant query hooks do not automatically scope those calls; tenant filters are explicitly assembled for tenant-owned collections, while users are intentionally counted platform-wide under superAdminOnly. The organization query and customer metric aggregation are also platform-level.

No focused test for getSuperAdminDashboardMetrics was found in the searched test paths. This source trace does not establish runtime database correctness, Mongo aggregation performance, or deployed response values. No dashboard API request was executed.
