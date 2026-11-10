# `server/controllers/authController.js` — login and account authentication

This controller implements credential authentication; the route's tenant resolver and rate limiter run before it, and `protect` re-authenticates each later protected request. The file also includes registration, logout, password reset/change, and email-change operations; their routes are listed in [`authRoutes.js`](../../../server/routes/authRoutes.js).

## Login path (`login`, source lines 75–163)

1. Read email/password as strings. Email is trimmed/lowercased; password bytes are left unchanged. Empty values return 400 before database work.
2. Save the tenant selected by middleware before the controller attempts a local unique-email lookup. This prevents lookup side effects from overwriting the caller's original selection.
3. On local development without explicit tenant context, `findUniqueLocalTenantUser` checks for up to three tenant-owned records. One match can establish tenant context; multiple matches return 409 rather than guessing.
4. If no tenant account was resolved, a short tenant-bypass lookup is restricted to platform roles with `tenantId: null`. A regular account lookup remains tenant-filtered.
5. Missing account and incorrect password both return the same 401 text to avoid revealing which half of a credential pair was valid. Failed attempts are counted; the fifth locks the account for 30 minutes. Security events are recorded.
6. Inactive accounts return 403; an active lock returns 423. A platform-owner role attached to a tenant is rejected as an invariant violation.
7. On a valid password, failed counters reset and permissions are assembled. When customer MFA is enabled, the controller creates a challenge and returns `mfaRequired`; it does not issue the normal auth cookie/token at that point.
8. Otherwise it stamps `lastLoginAt`, generates a JWT with identity, role, permissions and tenant ID, sets the HttpOnly auth cookie, records audit/security events, and returns a public user projection plus token. `publicUser` deliberately excludes password data.

## Trust boundaries and edge cases

- The login limiter is route middleware, so it protects before expensive credential/database work.
- Tenant uniqueness resolution uses a direct collection query because the tenant is not yet known. It limits results and refuses ambiguity. Do not broaden it to “take the first match.”
- Error messages avoid exposing whether a user exists, but internal log events still record attempt metadata. Keep credentials out of logs.
- MFA development PIN exposure is explicitly gated by `MFA_DEV_MODE`; never describe it as production behavior.
- `authController` issues the token; `authMiddleware.protect` later verifies it and reloads the current user. Login success therefore does not freeze future role/status state into authorization.

## Other exported flows

### Registration (`register`, lines 165–183)

The controller requires name/email/phone/password, lowercases email, trims phone, applies a basic email pattern and exactly ten phone digits, and requires a password of eight characters with an uppercase letter and a digit. `resolveTenant` must supply tenant context; a registration without a tenant returns 400. The duplicate check is scoped through `mergeTenantFilter` and checks either email or phone. It creates a customer role record and a User document, then writes a security log and returns 201 with a public projection. It does **not** issue a token or authenticate the new user. It sets `isVerified: true` directly; this is not email/phone verification. That behavior should not be described as verified contact ownership.

The password is passed to `User.create` as input text, but the `User` model's `pre('save')` hook hashes modified plaintext with bcryptjs (salt cost 10) before persistence. The model's `matchPassword` compares bcrypt hashes and contains a legacy plaintext migration path; inspect [`User.js`](../../../../server/models/User.js#L73) before changing hashing.

### Logout and current-user (`logout`, `getMe`)

Logout clears the auth and CSRF cookies and returns 204; it does not revoke a stateless JWT by server-side token blacklist. `getMe` is protected at the route, fetches current user by `req.user._id`, populates role and tenant, and returns the user plus normalized tenant ID/slug. Password fields remain excluded by schema selection unless explicitly requested.

### Change password

`changePassword` is protected. It explicitly selects the normally hidden password hash, compares `currentPassword` through `matchPassword`, applies the same 8-character/uppercase/digit rule to `newPassword`, assigns it and saves. The User save hook hashes it. A security event is recorded after save. The handler does not itself rotate/revoke previously issued JWTs, so explain that current token expiry/authorization reload remains the session boundary.

### Password reset request and confirmation

`requestPasswordReset` validates email syntax, resolves a tenant-scoped user (or a tenantless platform owner), and returns the same generic success response when no user exists to reduce account enumeration. For a real account it creates a cryptographically random six-digit code, stores only its SHA-256 digest, gives it a ten-minute expiry, and resets attempt count. It sends email with escaped company name. If delivery fails, it clears the code hash/expiry/attempts before returning 503 so an undelivered code is not usable. `MFA_DEV_MODE` may return the code in development; that mode must remain off in production.

`resetPasswordWithCode` requires email, six-digit code and a compliant new password. It loads hidden reset fields, rejects absent/expired/exhausted codes, hashes the submitted code and compares the digest. Wrong codes increment attempts; five attempts are capped with 429. Success changes the password, clears reset fields and unlocks login attempts; the User save hook applies bcrypt. Because the reset code is six digits, the short lifetime and attempt cap matter.

### Email change

Email-change request/confirm routes are protected and rate-limited. The user supplies current password for initiation; a pending address is verified with a one-time code stored hashed and expiring. Confirmation reloads the user/role data and updates the account email only after code verification. On email delivery failure, pending verification fields are cleared. Keep old email, pending email, and customer-profile synchronization behavior in mind when changing this workflow.

The controller is not an OAuth provider or server-side session store: a signed JWT plus cookie/Bearer transport is central. Read each handler's complete source before changing account lifecycle behavior.

## Debug trace

Use a test account and inspect status, `SecurityLog`, audit event, cookie attributes and resulting `/api/auth/me`. For tenant ambiguity, create two test tenant identities with the same email only in an isolated test database. Never diagnose by printing password/JWT values.

**Related:** [auth middleware](auth-middleware.md), [tenant middleware](tenant-middleware.md), [API contract](../../API_VERIFIED_CONTRACTS.md#post-apiauthlogin).
