# Password recovery and email-change contracts (entries 180–183)

All four routes use `resolveTenant` and `passwordResetRateLimiter` (5 requests per 15 minutes, default express-rate-limit key by client IP) but do not require a session, except email changes as noted. The generic password-reset response prevents account enumeration.

## POST `/api/auth/password-reset/request` (180)

Body `email` string is trimmed/lowercased and must match the basic email pattern; invalid/missing returns 400. Looks up tenant user, then platform owner in null-tenant scope. Unknown email returns 200 with the same generic message. Existing user receives a cryptographically random six-digit code; only SHA-256 hash, expiry (10 minutes), and attempt count are saved. Sends email via `sendEmail`; delivery failure clears the code state and returns 503. Success returns generic 200. In `MFA_DEV_MODE=true`, the response intentionally includes `devCode` and a development message; never enable that mode in production. Security event written after delivery; errors go to central handler.

## POST `/api/auth/password-reset/confirm` (181)

Body `email`, six-digit `code`, `newPassword`; password requires 8+ chars, digit, uppercase. User lookup is tenant-scoped then platform owner fallback. Missing/expired code 400 (expiry response does not clear saved code in this branch); after five failed attempts 429; incorrect hash increments attempt count and returns 401. Success sets password (User save hook hashes), clears reset fields/attempts and login lockout counters, writes high-severity security event, returns `{success:true,message}`. It does not issue a new token or explicitly revoke existing access tokens; current session policy is not statefully rotated here.

## POST `/api/auth/email-change/request` (182)

Authenticated `protect` plus same limiter; body requires `currentPassword` and valid `newEmail`. Rechecks password; wrong password 401 and logs failure. Rejects unchanged email (400), existing user email or Staff/Agent email conflict (409), scoped to tenant or null-tenant platform account. Creates six-digit code hash with 10-minute expiry and sends email to new address. If send fails it clears pending state and returns 503. Success 200 `{success:true,message,pendingEmail}`. Current email remains active until confirmation. Errors centrally handled.

## POST `/api/auth/email-change/confirm` (183)

Authenticated; body `code` exactly six digits. Requires pending email/hash/expiry or 400; expiry is cleared and 400; five wrong attempts gives 429; incorrect hash increments count and returns 401. Rechecks email and Staff/Agent conflicts at confirmation; conflict 409. On success updates User email and clears challenge, then updates Staff and Agent profile emails with `Promise.allSettled` (failures are ignored), builds permissions, issues new JWT and auth/CSRF cookies, and returns `{success:true,message,user,token}`. Security event failure can occur after email/token state changes; no cross-record transaction. For a platform owner, tenantless lookup is restricted to platform role spellings.

Sources: `server/routes/authRoutes.js`, `authController.js`, `authRateLimiters.js`, User/Staff/Agent models, `emailService.js`, `authCookie.js`. `client/src/api/passwordResetApi.js` calls recovery paths. No live mail delivery was run; mail transport errors are source-inspected only.
