# `server/middleware/authMiddleware.js` — identity, tenant, and authorization

## Dependencies and constants

The module imports `jsonwebtoken`, `User`, role/permission models, validated `env`, role normalization and tenant-context helpers. Importing Role/Permission models ensures population targets are registered. `ADMIN_BASE_PERMISSIONS` defines baseline named permissions for ordinary admins. Issuer/audience constants constrain tokens so a token minted for another application context is rejected.

## Token parsing

`verifyAccessToken(token, secret)` delegates signature, time and issuer/audience validation to JWT library. `extractAndVerifyToken(req, secret)` reads an Authorization Bearer token and `req.cookies.token`, tries candidates in order, and returns decoded claims plus source. If neither exists, no credentials is distinct from invalid credentials; if all supplied candidates fail, the last verification error is returned.

## `protect`

The middleware checks that JWT secret is configured, verifies credentials, returns 401 for absent/expired/invalid credentials, and requires a matching CSRF cookie/header for unsafe methods when the selected credential source is the cookie. It extracts a user identifier from supported token claim aliases, loads the user without password and populates role permissions/overrides under a narrowly scoped super-admin query bypass. It rejects missing or inactive accounts.

Next it resolves effective role and compares token tenant, requested tenant and current user tenant. A non-super-admin must have a tenant; requested and token tenant IDs must match the user's. The middleware sets AsyncLocalStorage tenant context and `req.tenantId`. A super-admin must be tenantless and receives explicit platform bypass context. Finally it attaches `req.user`/`req.userRole` and calls `next()`.

The reload is important: authorization is not based solely on possibly stale role claims in a token. The tenant comparisons prevent an authenticated identity from selecting another tenant by changing a request header.

## Optional and role guards

`optionalProtect` allows anonymous public requests only when no credentials are present; supplied credentials are fully validated rather than silently ignored. `requireRoles(...allowedRoles)` normalizes the requested role list and returns 401 without a user or 403 for a disallowed role. Convenience exports provide common role guards.

`checkPermission(name)` lets platform super-admin through, grants admins a limited base set, and otherwise searches populated role permissions and user overrides while honoring disabled entries. Errors return a safe 500. Always pair a permission guard with the relevant tenant-scoped resource query; permission alone does not establish record ownership.
