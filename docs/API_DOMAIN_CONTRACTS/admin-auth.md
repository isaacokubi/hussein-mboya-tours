# Admin login contract

## `POST /api/admin/auth/login`

- **Source:** `server/routes/index.js` mounts `adminAuthRoutes` at `/admin/auth`; the router applies `resolveTenant`, then `loginRateLimiter` on `/login`, then `adminLogin`.
- **Authentication:** No preexisting JWT is required. The endpoint only issues a token to a recognized admin or platform super-admin. Tenant resolution precedes lookup; platform role lookup runs explicitly in a null-tenant bypass context.
- **Request:** JSON body requires `email` and `password`. Email is stringified, trimmed and lowercased; password is stringified and not trimmed. No query or path parameters are read.
- **Lookup/authorization:** First searches for a tenantless `super_admin`/`superadmin` user under a bypass context. If not found, searches by email under the active tenant context. It selects the password hash and populates role permissions and permission overrides. User must exist, have `status:"active"`, and pass `matchPassword`; effective normalized role must be `admin`, `super_admin`, or `superadmin`. A platform owner is specifically a super-admin role without a tenant ID.
- **Success:** HTTP 200 `{success:true,token,user:{_id,name,email,phone,role,tenantId,permissions,status}}`. Generated token claims include user ID, role ID, normalized role, email, permissions and tenant ID (null for platform owner). This controller does not set an auth cookie or update last-login/audit counters.
- **Errors:** Missing credentials 400; nonexistent, inactive, or wrong-password account 401 with generic message; non-admin role 403; any caught failure 500 `{success:false,message:"Unable to complete admin login."}`. Rate limiter can reject requests before the controller. No MFA challenge is implemented in this handler.
- **Database:** Reads `User` only. No application data mutation is performed by the controller.
- **Frontend:** The shared login screen at `/admin/login` uses the standard auth flow; this route's client wrapper is not separately referenced by `adminAuthRoutes` in the reviewed API wrapper inventory.

## Tenant and failure considerations

Platform account lookup deliberately bypasses tenant scope but constrains role and `tenantId:null`; ordinary account lookup depends on active tenant context. The endpoint returns a bearer token in JSON, so token storage/transport behavior belongs to the frontend auth client. The route-level comment is stale about its local path: router path is `/login`, while the mounted external path is `/api/admin/auth/login`.
