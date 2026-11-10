# `server/middleware/tenantMiddleware.js` — initial organization context

This middleware selects a tenant before route handlers execute. It establishes request context; it does not by itself authorize access to every record. Protected requests are later checked against the current user's tenant in [`authMiddleware.js`](../../../server/middleware/authMiddleware.js).

## Resolution order and logic

- Helper functions normalize hostnames, extract a host from Origin, normalize role spelling, recognize login/subscription paths, and verify a JWT using the same issuer/audience constraints as auth middleware.
- `getVerifiedTokenClaims` tries Bearer then auth cookie claims. Invalid tokens are ignored at this discovery stage; `protect` later returns the authoritative authentication error.
- Login requests deliberately ignore an old token. This prevents a previous tenant's cookie from forcing the first new login attempt into that old tenant.
- A verified platform role is assigned an explicit tenantless bypass context and continues. Other valid token claims may select an active/trial tenant by tenant ID; request-supplied tenant selection must agree with authenticated identity.
- For public requests, selectors can come from tenant headers, tenant subdomain/custom domain, or configured fallback. Organization status is restricted to active/trial for normal use; subscription and login paths have special status handling.
- A local unique-email lookup supports development login when no tenant was specified. It is constrained to a single match; ambiguity must be resolved explicitly.
- A configured public fallback slug and opt-in single-tenant development fallback are considered only at the end. Without a resolved tenant, the middleware continues without setting tenant context. With one, it stores tenant fields on `req` and enters `runWithTenant` for downstream asynchronous work.

## Why the ordering matters

Tenant context is implemented with AsyncLocalStorage in `server/tenancy/context.js`, so a context must be established around the asynchronous continuation rather than assigned as an ordinary process-global variable. The explicit `runWithTenant(..., () => next())` keeps downstream work in the request's context. `authMiddleware.protect` then validates that this initial choice matches the loaded user; a request header alone is never trusted for a protected account.

## Failure and security notes

Database/parse failures go to Express error middleware. Unknown public tenant selectors usually leave the request without a tenant and subsequent tenant-required handlers reject it. A dangerous regression would be silently selecting a default company for every unknown host. Cross-tenant access testing must include headers, subdomains, custom domains, stale cookies, platform users and background work.

**Related:** [authentication walkthrough](auth-middleware.md), [core trust flow](../../CORE_CODE_WALKTHROUGHS.md#1-authentication-tenant-selection-and-permissions).
