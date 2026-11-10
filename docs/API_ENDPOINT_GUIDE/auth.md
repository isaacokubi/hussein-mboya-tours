# API endpoints: auth

This guide contains 9 mounted method/path inventory entries in the **auth** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-178 — POST /api/auth/register

**Contract status:** SOURCE-TRACED<br>
**Router:** [authRoutes.js](../../server/routes/authRoutes.js) · [route module explanation](../code-explanations/backend/routes/authRoutes.md)<br>
**Mounted inventory entry:** 178 of 629<br>
**Route declaration pipeline:** `resolveTenant`, `register`
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
router.post("/register", resolveTenant, register)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `name`, `email`, `phone`, `password`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `201`.
- JSON envelope keys observed: `success`, `message`, `user`.

**Source-traced contract:** See [Customer registration contract](../API_DOMAIN_CONTRACTS/auth-registration.md); request fields, tenant resolution, persistence and response are documented there.

## endpoint-179 — POST /api/auth/login

**Contract status:** SOURCE-TRACED<br>
**Router:** [authRoutes.js](../../server/routes/authRoutes.js) · [route module explanation](../code-explanations/backend/routes/authRoutes.md)<br>
**Mounted inventory entry:** 179 of 629<br>
**Route declaration pipeline:** `resolveTenant`, `loginRateLimiter`, `login`
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
router.post("/login", resolveTenant, loginRateLimiter, login)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `email`, `password`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `409`, `401`, `403`, `423`, `200`.
- JSON envelope keys observed: `success`, `message`, `code`, `user`.

**Request, response, effects and failure contract:** see the corresponding fully source-traced entry in [API_VERIFIED_CONTRACTS.md](../API_VERIFIED_CONTRACTS.md). The same alias handler contract applies to this path. Templates are source-shape reviewed but were not executed.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-180 — POST /api/auth/password-reset/request

**Contract status:** SOURCE-TRACED<br>
**Router:** [authRoutes.js](../../server/routes/authRoutes.js) · [route module explanation](../code-explanations/backend/routes/authRoutes.md)<br>
**Mounted inventory entry:** 180 of 629<br>
**Route declaration pipeline:** `resolveTenant`, `passwordResetRateLimiter`, `requestPasswordReset`
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
router.post("/password-reset/request", resolveTenant, passwordResetRateLimiter, requestPasswordReset)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `email`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `503`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Password recovery and email change](../API_DOMAIN_CONTRACTS/auth-recovery.md).

## endpoint-181 — POST /api/auth/password-reset/confirm

**Contract status:** SOURCE-TRACED<br>
**Router:** [authRoutes.js](../../server/routes/authRoutes.js) · [route module explanation](../code-explanations/backend/routes/authRoutes.md)<br>
**Mounted inventory entry:** 181 of 629<br>
**Route declaration pipeline:** `resolveTenant`, `passwordResetRateLimiter`, `resetPasswordWithCode`
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
router.post("/password-reset/confirm", resolveTenant, passwordResetRateLimiter, resetPasswordWithCode)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `email`, `code`, `newPassword`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `429`, `401`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Password recovery and email change](../API_DOMAIN_CONTRACTS/auth-recovery.md).

## endpoint-182 — POST /api/auth/email-change/request

**Contract status:** SOURCE-TRACED<br>
**Router:** [authRoutes.js](../../server/routes/authRoutes.js) · [route module explanation](../code-explanations/backend/routes/authRoutes.md)<br>
**Mounted inventory entry:** 182 of 629<br>
**Route declaration pipeline:** `protect`, `passwordResetRateLimiter`, `requestEmailChange`
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post("/email-change/request", protect, passwordResetRateLimiter, requestEmailChange)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `currentPassword`, `newEmail`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `401`, `409`, `503`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Password recovery and email change](../API_DOMAIN_CONTRACTS/auth-recovery.md).

## endpoint-183 — POST /api/auth/email-change/confirm

**Contract status:** SOURCE-TRACED<br>
**Router:** [authRoutes.js](../../server/routes/authRoutes.js) · [route module explanation](../code-explanations/backend/routes/authRoutes.md)<br>
**Mounted inventory entry:** 183 of 629<br>
**Route declaration pipeline:** `protect`, `passwordResetRateLimiter`, `confirmEmailChange`
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post("/email-change/confirm", protect, passwordResetRateLimiter, confirmEmailChange)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `code`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `429`, `401`, `409`.
- JSON envelope keys observed: `success`, `message`, `user`.

**Source-traced contract:** See [Password recovery and email change](../API_DOMAIN_CONTRACTS/auth-recovery.md).

## endpoint-184 — POST /api/auth/logout

**Contract status:** SOURCE-TRACED<br>
**Router:** [authRoutes.js](../../server/routes/authRoutes.js) · [route module explanation](../code-explanations/backend/routes/authRoutes.md)<br>
**Mounted inventory entry:** 184 of 629<br>
**Route declaration pipeline:** `logout`
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
router.post("/logout", logout)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `204`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Authenticated session routes](../API_DOMAIN_CONTRACTS/auth-session.md).

## endpoint-185 — GET /api/auth/me

**Contract status:** SOURCE-TRACED<br>
**Router:** [authRoutes.js](../../server/routes/authRoutes.js) · [route module explanation](../code-explanations/backend/routes/authRoutes.md)<br>
**Mounted inventory entry:** 185 of 629<br>
**Route declaration pipeline:** `protect`, `syncCustomerProfile`, `getMe`
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/me", protect, syncCustomerProfile, getMe)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Authenticated session routes](../API_DOMAIN_CONTRACTS/auth-session.md).

## endpoint-186 — PUT /api/auth/change-password

**Contract status:** SOURCE-TRACED<br>
**Router:** [authRoutes.js](../../server/routes/authRoutes.js) · [route module explanation](../code-explanations/backend/routes/authRoutes.md)<br>
**Mounted inventory entry:** 186 of 629<br>
**Route declaration pipeline:** `protect`, `syncCustomerProfile`, `changePassword`
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.put("/change-password", protect, syncCustomerProfile, changePassword)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `currentPassword`, `newPassword`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `401`, `400`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Authenticated session routes](../API_DOMAIN_CONTRACTS/auth-session.md).

