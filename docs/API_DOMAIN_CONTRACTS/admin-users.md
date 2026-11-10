# Admin user and staff management contracts

## Shared access and tenant scope

Mounted under `/api/admin` in `adminRoutes.js`. Router applies `protect` → `resolveTenant` → `adminMiddleware`; only active admin/super_admin accounts pass. For the `/users` path subtree it additionally applies `checkPermission("user.manage")`, before its handlers. Tenant is mandatory and user/profile/staff/agent queries are scoped to the tenant. Branch filtering is not implemented. Missing auth is 401; role/permission failures are 403; middleware failures are 500. Staff creation is a multi-document workflow with best-effort compensation, not a transaction.

## GET /api/admin/users

Query: `page` defaults 1/minimum 1; `limit` defaults 10, clamped 1–100; `search` trimmed. Search is a case-insensitive regex over name, email, phone, role, legacyRole, status; user-provided regex metacharacters are not escaped. Reads tenant users newest-first, excludes password, populates roleId name/displayName/permissions, paginates/counts in parallel. It then canonicalizes role data using Customer/Staff/Agent profiles and may update misclassified customer users as a side effect. HTTP 200 includes `{success,page,limit,total,pages,count,data,users,pagination}`; `data` and `users` both contain records, and `pagination` repeats page/limit/total/pages. Errors centralized. Caller `client/src/api/adminUserApi.js`.

## POST /api/admin/users/staff

JSON fields: required `name`, `email`, `phone`, `password`, `role`; agent role additionally requires `companyName` up to 150 chars. Phone must be exactly 10 digits; password at least 12 chars with uppercase and digit. Role aliases normalize to admin, manager, tour_guide, driver, or agent. Email is lowercase/trimmed; name is trimmed. Duplicate tenant user or active staff email/phone is 409. Creates/uses a Role and permissions, then User; depending on role also creates Agent (unapproved, default commission 10) or Staff profile for manager/guide/driver. A platform super-admin role is explicitly prohibited. Returns 201 `{success:true,message,user,staff,agent}`. Duplicate index conflict returns 409, with optional `repaired` flag for tenant-index repair. Later failure triggers `Promise.allSettled` deletions of created staff/agent/user; cleanup errors are swallowed, role/permission setup may remain. This is not atomic. Caller `createStaffAccount` in `client/src/api/adminUserApi.js`.

## GET /api/admin/users/analytics

No endpoint-specific query/body. Counts tenant non-deleted users, active users (`isActive != false`), customers by role, and agents by role. HTTP 200 `{success:true,data:{total,active,customers,agents}}`. Note “active” count uses `isActive`, while total uses `isDeleted`; errors centralized. Caller `getUsersAnalytics` in `client/src/api/adminApi.js`.

## PATCH and PUT /api/admin/users/:id/status

Both methods share `updateUserStatus`. Body requires `status` in active/inactive/disabled/suspended/blocked. Invalid ID/status returns 400; missing/cross-tenant user 404. Tenant-filtered update sets status and validates, removes password from response and derives `isActive = status === active`. Returns 200 `{success:true,message,user,data}` where user/data duplicate the safe record. Callers use PUT in `client/src/api/adminUserApi.js`; PATCH is a compatibility alias.

## PUT /api/admin/users/:id

Body optional `name`, `email`, `phone`, `role`; absent values preserve current user fields. Name/email/phone required after merge, email normalized lowercase, phone exactly 10 digits. Invalid ID 400; missing/cross-tenant 404; super_admin edit 403; duplicate email/phone 409. Looks up Customer/Staff/Agent profiles. Customer-only accounts cannot be changed to another role (409); other roles must map to configured customer/admin/manager/tour_guide/driver/agent role. If a linked staff record exists and role is staff-like, updates its position/role and contact fields, then saves user and returns a password-free populated user in `{success:true,message,user,data}`. These writes are not transactional; duplicate-key errors return 409. Caller `updateAdminUser`.

## DELETE /api/admin/users/:id

Invalid ID 400; self-delete 400; missing/cross-tenant user 404; super_admin cannot be deleted (403). Deletes associated tenant Staff and Agent rows and User row concurrently, then returns 200 `{success:true,deleted:true,message}`. Customer profile and other related documents are not deleted by this handler; operations are non-transactional. Caller `deleteAdminUser`.

## Frontend

Wrappers are `client/src/api/adminUserApi.js` and analytics in `client/src/api/adminApi.js`. UI is in admin user management components. Client uses PUT for status mutations while the server also mounts PATCH to the same controller.
