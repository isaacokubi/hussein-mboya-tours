# Route module: authRoutes.js

**Source:** [server/routes/authRoutes.js](../../../../server/routes/authRoutes.js)

Observed mount prefixes include `/api/auth/register`, `/api/auth/login`, `/api/auth/password-reset/request`, `/api/auth/password-reset/confirm`, `/api/auth/email-change/request`, `/api/auth/email-change/confirm`, `/api/auth/logout`, `/api/auth/me`, `/api/auth/change-password`.

## Router-wide middleware

No router.use declaration was found at module scope.

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### POST /register → `/api/auth/register`

Declared at source line 28. Route handler pipeline names: `resolveTenant`, `register`.

```js
router.post("/register", resolveTenant, register)
```

- Imported handler/middleware `resolveTenant`: [tenantMiddleware.js](../../../../server/middleware/tenantMiddleware.js)
- Imported handler/middleware `register`: [authController.js](../../../../server/controllers/authController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `register`

Handler starts at [controller line 165](../../../../server/controllers/authController.js#L165). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `name`, `email`, `phone`, `password`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `201`.
- JSON envelope keys observed: `success`, `message`, `user`.
- Literal messages include: “All fields are required.”; “Enter a valid email address.”; “Phone number must contain exactly 10 digits.”; “Password must be at least 8 characters and include an uppercase letter and a number.”; “Unable to determine the company for this registration. Configure the public tenant or use the company domain and try again.”; “Registration successful. You can now log in.”.
- Database operations detected: `User.findOne`, `Role.findOne`, `User.create`.
- Input/validation source lines to inspect:
  - [Line 167](../../../../server/controllers/authController.js#L167): `const { name, email, phone, password } = req.body || {};`
  - [Line 170](../../../../server/controllers/authController.js#L170): `if (!name || !normalizedEmail || !normalizedPhone || !password) return res.status(400).json({ success: false, message: "All fields are required." });`
  - [Line 171](../../../../server/controllers/authController.js#L171): `if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) return res.status(400).json({ success: false, message: "Enter a valid email address." });`
  - [Line 172](../../../../server/controllers/authController.js#L172): `if (!/^\d{10}$/.test(normalizedPhone)) return res.status(400).json({ success: false, message: "Phone number must contain exactly 10 digits." });`
  - [Line 173](../../../../server/controllers/authController.js#L173): `if (password.length < 8 || !/\d/.test(password) || !/[A-Z]/.test(password)) return res.status(400).json({ success: false, message: "Password must be at least 8 characters`
  - [Line 175](../../../../server/controllers/authController.js#L175): `if (!tenantId) return res.status(400).json({ success: false, message: "Unable to determine the company for this registration. Configure the public tenant or use the compa`
  - [Line 177](../../../../server/controllers/authController.js#L177): `if (existingUser) return res.status(400).json({ success: false, message: existingUser.email === normalizedEmail ? "Email is already registered." : "Phone number is alread`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/auth/register'
```

### POST /login → `/api/auth/login`

Declared at source line 29. Route handler pipeline names: `resolveTenant`, `loginRateLimiter`, `login`.

```js
router.post("/login", resolveTenant, loginRateLimiter, login)
```

- Imported handler/middleware `resolveTenant`: [tenantMiddleware.js](../../../../server/middleware/tenantMiddleware.js)
- Imported handler/middleware `loginRateLimiter`: [authRateLimiters.js](../../../../server/middleware/authRateLimiters.js)
- Imported handler/middleware `login`: [authController.js](../../../../server/controllers/authController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `login`

Handler starts at [controller line 75](../../../../server/controllers/authController.js#L75). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `email`, `password`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `409`, `401`, `403`, `423`, `200`.
- JSON envelope keys observed: `success`, `message`, `code`, `user`.
- Literal messages include: “Email and password are required.”; “This email is registered with more than one company. Open the company login page or provide the company identifier before signing in.”; “Invalid email or password.”; “Account temporarily locked due to multiple failed login attempts.”; “Platform owner account must not belong to a tenant.”.
- Database operations detected: `User.findOne`.
- Input/validation source lines to inspect:
  - [Line 77](../../../../server/controllers/authController.js#L77): `const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";`
  - [Line 78](../../../../server/controllers/authController.js#L78): `const password = typeof req.body?.password === "string" ? req.body.password : "";`
  - [Line 79](../../../../server/controllers/authController.js#L79): `if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required." });`
  - [Line 87](../../../../server/controllers/authController.js#L87): `return res.status(409).json({ success: false, code: "TENANT_SELECTION_REQUIRED", message: "This email is registered with more than one company. Open the company login pag`
  - [Line 117](../../../../server/controllers/authController.js#L117): `return res.status(401).json({ success: false, message: "Invalid email or password." });`
  - [Line 122](../../../../server/controllers/authController.js#L122): `return res.status(401).json({ success: false, message: "Invalid email or password." });`
  - [Line 124](../../../../server/controllers/authController.js#L124): `if (user.status !== "active") return res.status(403).json({ success: false, message: \`Account ${user.status}.\` });`
  - [Line 132](../../../../server/controllers/authController.js#L132): `return res.status(401).json({ success: false, message: "Invalid email or password." });`
  - [Line 140](../../../../server/controllers/authController.js#L140): `if (platformRoleWithTenant) return res.status(403).json({ success: false, message: "Platform owner account must not belong to a tenant." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/auth/login'
```

### POST /password-reset/request → `/api/auth/password-reset/request`

Declared at source line 30. Route handler pipeline names: `resolveTenant`, `passwordResetRateLimiter`, `requestPasswordReset`.

```js
router.post("/password-reset/request", resolveTenant, passwordResetRateLimiter, requestPasswordReset)
```

- Imported handler/middleware `resolveTenant`: [tenantMiddleware.js](../../../../server/middleware/tenantMiddleware.js)
- Imported handler/middleware `passwordResetRateLimiter`: [authRateLimiters.js](../../../../server/middleware/authRateLimiters.js)
- Imported handler/middleware `requestPasswordReset`: [authController.js](../../../../server/controllers/authController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `requestPasswordReset`

Handler starts at [controller line 406](../../../../server/controllers/authController.js#L406). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `email`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `503`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “If an account exists for that email address, a password reset code has been sent.”; “A valid email address is required.”; “We could not send the reset email right now. Please try again shortly.”.
- Database operations detected: none directly detected (may be delegated to service/helper).
- Input/validation source lines to inspect:
  - [Line 408](../../../../server/controllers/authController.js#L408): `const email = String(req.body?.email || "").trim().toLowerCase();`
  - [Line 411](../../../../server/controllers/authController.js#L411): `return res.status(400).json({ success: false, message: "A valid email address is required." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/auth/password-reset/request'
```

### POST /password-reset/confirm → `/api/auth/password-reset/confirm`

Declared at source line 31. Route handler pipeline names: `resolveTenant`, `passwordResetRateLimiter`, `resetPasswordWithCode`.

```js
router.post("/password-reset/confirm", resolveTenant, passwordResetRateLimiter, resetPasswordWithCode)
```

- Imported handler/middleware `resolveTenant`: [tenantMiddleware.js](../../../../server/middleware/tenantMiddleware.js)
- Imported handler/middleware `passwordResetRateLimiter`: [authRateLimiters.js](../../../../server/middleware/authRateLimiters.js)
- Imported handler/middleware `resetPasswordWithCode`: [authController.js](../../../../server/controllers/authController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `resetPasswordWithCode`

Handler starts at [controller line 451](../../../../server/controllers/authController.js#L451). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `email`, `code`, `newPassword`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `429`, `401`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Email and a 6-digit reset code are required.”; “Password must be at least 8 characters and include an uppercase letter and a number.”; “Invalid or expired reset code.”; “The reset code has expired. Request a new code.”; “Too many incorrect reset attempts. Request a new code.”; “Invalid reset code.”; “Password reset successfully. You can now log in.”.
- Database operations detected: `User.findOne`.
- Input/validation source lines to inspect:
  - [Line 453](../../../../server/controllers/authController.js#L453): `const email = String(req.body?.email || "").trim().toLowerCase();`
  - [Line 454](../../../../server/controllers/authController.js#L454): `const code = String(req.body?.code || "").trim();`
  - [Line 455](../../../../server/controllers/authController.js#L455): `const newPassword = String(req.body?.newPassword || "");`
  - [Line 456](../../../../server/controllers/authController.js#L456): `if (!email || !/^\d{6}$/.test(code)) return res.status(400).json({ success: false, message:"Email and a 6-digit reset code are required." });`
  - [Line 457](../../../../server/controllers/authController.js#L457): `if (newPassword.length < 8 || !/\d/.test(newPassword) || !/[A-Z]/.test(newPassword)) return res.status(400).json({ success: false, message: "Password must be at least 8 c`
  - [Line 466](../../../../server/controllers/authController.js#L466): `if (!user || !user.passwordResetCodeHash || !user.passwordResetExpiresAt) return res.status(400).json({ success: false, message: "Invalid or expired reset code." });`
  - [Line 467](../../../../server/controllers/authController.js#L467): `if (new Date(user.passwordResetExpiresAt).getTime() < Date.now()) return res.status(400).json({ success: false, message: "The reset code has expired. Request a new code."`
  - [Line 470](../../../../server/controllers/authController.js#L470): `if (hash !== user.passwordResetCodeHash) { user.passwordResetAttempts = Number(user.passwordResetAttempts || 0) + 1; await user.save({ validateBeforeSave: false }); retur`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/auth/password-reset/confirm'
```

### POST /email-change/request → `/api/auth/email-change/request`

Declared at source line 35. Route handler pipeline names: `protect`, `passwordResetRateLimiter`, `requestEmailChange`.

```js
router.post("/email-change/request", protect, passwordResetRateLimiter, requestEmailChange)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `passwordResetRateLimiter`: [authRateLimiters.js](../../../../server/middleware/authRateLimiters.js)
- Imported handler/middleware `requestEmailChange`: [authController.js](../../../../server/controllers/authController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `requestEmailChange`

Handler starts at [controller line 240](../../../../server/controllers/authController.js#L240). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `currentPassword`, `newEmail`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `401`, `409`, `503`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Your current password is required.”; “Enter a valid new email address.”; “User not found.”; “Current password is incorrect.”; “The new email address must be different from your current email.”; “That email address is already in use by another account.”; “That email address is already assigned to another staff or agent profile in this company.”; “We could not send the verification email right now. Please try again shortly.”.
- Database operations detected: `User.findById`, `User.findOne`, `Staff.findOne`, `Agent.findOne`.
- Input/validation source lines to inspect:
  - [Line 242](../../../../server/controllers/authController.js#L242): `const currentPassword = String(req.body?.currentPassword || "");`
  - [Line 243](../../../../server/controllers/authController.js#L243): `const newEmail = String(req.body?.newEmail || "").trim().toLowerCase();`
  - [Line 246](../../../../server/controllers/authController.js#L246): `return res.status(400).json({ success: false, message: "Your current password is required." });`
  - [Line 249](../../../../server/controllers/authController.js#L249): `return res.status(400).json({ success: false, message: "Enter a valid new email address." });`
  - [Line 257](../../../../server/controllers/authController.js#L257): `if (!user) return res.status(404).json({ success: false, message: "User not found." });`
  - [Line 260](../../../../server/controllers/authController.js#L260): `return res.status(401).json({ success: false, message: "Current password is incorrect." });`
  - [Line 263](../../../../server/controllers/authController.js#L263): `return res.status(400).json({ success: false, message: "The new email address must be different from your current email." });`
  - [Line 274](../../../../server/controllers/authController.js#L274): `return res.status(409).json({ success: false, message: "That email address is already in use by another account." });`
  - [Line 283](../../../../server/controllers/authController.js#L283): `return res.status(409).json({ success: false, message: "That email address is already assigned to another staff or agent profile in this company." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/auth/email-change/request'
```

### POST /email-change/confirm → `/api/auth/email-change/confirm`

Declared at source line 36. Route handler pipeline names: `protect`, `passwordResetRateLimiter`, `confirmEmailChange`.

```js
router.post("/email-change/confirm", protect, passwordResetRateLimiter, confirmEmailChange)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `passwordResetRateLimiter`: [authRateLimiters.js](../../../../server/middleware/authRateLimiters.js)
- Imported handler/middleware `confirmEmailChange`: [authController.js](../../../../server/controllers/authController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `confirmEmailChange`

Handler starts at [controller line 321](../../../../server/controllers/authController.js#L321). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `code`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `429`, `401`, `409`.
- JSON envelope keys observed: `success`, `message`, `user`.
- Literal messages include: “Enter the 6-digit verification code.”; “There is no active email-change request. Request a new verification code.”; “The verification code has expired. Request a new code.”; “Too many incorrect verification attempts. Request a new code.”; “Invalid verification code.”; “That email address is already assigned to another staff or agent profile in this company.”; “That email address is now in use by another account. Request a new email change.”; “Email address changed successfully. Your new email is now used for login and password recovery.”.
- Database operations detected: `User.findById`, `User.findOne`, `Staff.findOne`, `Agent.findOne`, `Staff.updateOne`, `Agent.updateOne`.
- Input/validation source lines to inspect:
  - [Line 323](../../../../server/controllers/authController.js#L323): `const code = String(req.body?.code || "").trim();`
  - [Line 324](../../../../server/controllers/authController.js#L324): `if (!/^\d{6}$/.test(code)) return res.status(400).json({ success: false, message: "Enter the 6-digit verification code." });`
  - [Line 332](../../../../server/controllers/authController.js#L332): `return res.status(400).json({ success: false, message: "There is no active email-change request. Request a new verification code." });`
  - [Line 340](../../../../server/controllers/authController.js#L340): `return res.status(400).json({ success: false, message: "The verification code has expired. Request a new code." });`
  - [Line 350](../../../../server/controllers/authController.js#L350): `return res.status(401).json({ success: false, message: "Invalid verification code." });`
  - [Line 368](../../../../server/controllers/authController.js#L368): `return res.status(409).json({ success: false, message: "That email address is already assigned to another staff or agent profile in this company." });`
  - [Line 377](../../../../server/controllers/authController.js#L377): `return res.status(409).json({ success: false, message: "That email address is now in use by another account. Request a new email change." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/auth/email-change/confirm'
```

### POST /logout → `/api/auth/logout`

Declared at source line 41. Route handler pipeline names: `logout`.

```js
router.post("/logout", logout)
```

- Imported handler/middleware `logout`: [authController.js](../../../../server/controllers/authController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `logout`

Handler starts at [controller line 185](../../../../server/controllers/authController.js#L185). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `204`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: none directly detected (may be delegated to service/helper).

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/auth/logout'
```

### GET /me → `/api/auth/me`

Declared at source line 42. Route handler pipeline names: `protect`, `syncCustomerProfile`, `getMe`.

```js
router.get("/me", protect, syncCustomerProfile, getMe)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `syncCustomerProfile`: [customerProfileSync.js](../../../../server/middleware/customerProfileSync.js)
- Imported handler/middleware `getMe`: [authController.js](../../../../server/controllers/authController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getMe`

Handler starts at [controller line 194](../../../../server/controllers/authController.js#L194). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “User not found”.
- Database operations detected: `User.findById`.
- Input/validation source lines to inspect:
  - [Line 197](../../../../server/controllers/authController.js#L197): `if (!user) return res.status(404).json({ success: false, message: "User not found" });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/auth/me'
```

### PUT /change-password → `/api/auth/change-password`

Declared at source line 43. Route handler pipeline names: `protect`, `syncCustomerProfile`, `changePassword`.

```js
router.put("/change-password", protect, syncCustomerProfile, changePassword)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `syncCustomerProfile`: [customerProfileSync.js](../../../../server/middleware/customerProfileSync.js)
- Imported handler/middleware `changePassword`: [authController.js](../../../../server/controllers/authController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `changePassword`

Handler starts at [controller line 202](../../../../server/controllers/authController.js#L202). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `currentPassword`, `newPassword`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `401`, `400`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “User not found”; “Current password incorrect”; “Password must be at least 8 characters and include an uppercase letter and a number.”; “Password changed successfully”.
- Database operations detected: `User.findById`.
- Input/validation source lines to inspect:
  - [Line 205](../../../../server/controllers/authController.js#L205): `if (!user) return res.status(404).json({ success: false, message: "User not found" });`
  - [Line 206](../../../../server/controllers/authController.js#L206): `if (!(await user.matchPassword(req.body.currentPassword))) return res.status(401).json({ success: false, message: "Current password incorrect" });`
  - [Line 207](../../../../server/controllers/authController.js#L207): `const newPassword = String(req.body.newPassword || "");`
  - [Line 208](../../../../server/controllers/authController.js#L208): `if (newPassword.length < 8 || !/\d/.test(newPassword) || !/[A-Z]/.test(newPassword)) return res.status(400).json({ success: false, message: "Password must be at least 8 c`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/auth/change-password'
```

