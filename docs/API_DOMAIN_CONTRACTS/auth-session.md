# Authenticated session routes (entries 184–186)

## POST `/api/auth/logout` (184)

No `protect` middleware. Calls `clearAuthCookies` and returns 204 with empty body. This clears browser auth and CSRF cookies but does not revoke a bearer JWT held elsewhere or persist token revocation. Errors pass to central handler. Frontend `AuthContext.logout` calls this endpoint then clears local client state.

## GET `/api/auth/me` (185)

`protect` → `syncCustomerProfile` → `getMe`. Requires valid JWT/cookie; cookie-authenticated safe GET has no CSRF check. Profile sync is best-effort and calls `ensureCustomerProfile` only when `req.user.role` is exactly customer; errors are logged and ignored. Handler loads user by ID, populates role and tenant, 404 if missing, otherwise 200 `{success:true,user:{...user.toObject(),tenantId:<populated id or null>,tenantSlug:<slug or null>}}`. This returns the full ordinary selected User shape, with password excluded by auth query selection/model select rules; tenant details are reduced to ID/slug. No role/branch restriction. Client AuthContext invokes it during session hydration.

## PUT `/api/auth/change-password` (186)

`protect` → `syncCustomerProfile` → `changePassword`; body requires `currentPassword` and `newPassword`. Missing user 404, incorrect old password 401, new password must be 8+ chars with digit and uppercase (400). On success sets password and saves (User hook hashes it), logs security event, returns `{success:true,message:"Password changed successfully"}`. There is no route-level rate limiter, no current session revocation, and event log failure can be reported after password persistence. Client account flows use AuthContext/API request; no dedicated password-change wrapper was identified.

Sources: `authRoutes.js`, `authController.js`, `authMiddleware.js`, `customerProfileSync.js`, `customerProfileService.js`, `authCookie.js`, `client/src/context/AuthContext.jsx`. Security behavior is source-read; no live cookie/JWT request performed in this run.
