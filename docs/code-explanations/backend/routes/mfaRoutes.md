# Route module: mfaRoutes.js

**Source:** [server/routes/mfaRoutes.js](../../../../server/routes/mfaRoutes.js)

Observed mount prefixes include `/api/mfa/customer/send-pin`, `/api/mfa/customer/verify-pin`.

## Router-wide middleware

- `router.use(resolveTenant);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### POST /customer/send-pin → `/api/mfa/customer/send-pin`

Declared at source line 18. Route handler pipeline names: `mfaSendRateLimiter`, `sendCustomerLoginPin`.

```js
router.post(
  "/customer/send-pin",
  mfaSendRateLimiter,
  sendCustomerLoginPin
)
```

- Imported handler/middleware `mfaSendRateLimiter`: [authRateLimiters.js](../../../../server/middleware/authRateLimiters.js)
- Imported handler/middleware `sendCustomerLoginPin`: [mfaController.js](../../../../server/controllers/mfaController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `sendCustomerLoginPin`

Handler starts at [controller line 64](../../../../server/controllers/mfaController.js#L64). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `userId`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `401`, `200`, `429`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “MFA user ID is required.”; “Invalid MFA request.”.
- Database operations detected: `User.findById`.
- Input/validation source lines to inspect:
  - [Line 66](../../../../server/controllers/mfaController.js#L66): `const userId = String(req.body?.userId || "").trim();`
  - [Line 67](../../../../server/controllers/mfaController.js#L67): `if (!userId) return res.status(400).json({ success: false, message: "MFA user ID is required." });`
  - [Line 69](../../../../server/controllers/mfaController.js#L69): `if (!user || !isCustomer(user)) return res.status(401).json({ success: false, message: "Invalid MFA request." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/mfa/customer/send-pin'
```

### POST /customer/verify-pin → `/api/mfa/customer/verify-pin`

Declared at source line 24. Route handler pipeline names: `mfaVerifyRateLimiter`, `verifyCustomerLoginPin`.

```js
router.post(
  "/customer/verify-pin",
  mfaVerifyRateLimiter,
  verifyCustomerLoginPin
)
```

- Imported handler/middleware `mfaVerifyRateLimiter`: [authRateLimiters.js](../../../../server/middleware/authRateLimiters.js)
- Imported handler/middleware `verifyCustomerLoginPin`: [mfaController.js](../../../../server/controllers/mfaController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `verifyCustomerLoginPin`

Handler starts at [controller line 87](../../../../server/controllers/mfaController.js#L87). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `userId`, `pin`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `401`, `429`, `200`.
- JSON envelope keys observed: `success`, `message`, `attemptsRemaining`.
- Literal messages include: “User ID and 4-digit PIN are required.”; “Invalid MFA request.”; “No active login PIN exists. Request a new PIN.”; “The login PIN has expired. Request a new PIN.”; “Too many incorrect PIN attempts. Request a new PIN.”; “Incorrect verification PIN.”.
- Database operations detected: `User.findById`.
- Input/validation source lines to inspect:
  - [Line 89](../../../../server/controllers/mfaController.js#L89): `const userId = String(req.body?.userId || "").trim();`
  - [Line 90](../../../../server/controllers/mfaController.js#L90): `const pin = String(req.body?.pin || "").trim();`
  - [Line 91](../../../../server/controllers/mfaController.js#L91): `if (!userId || !/^\d{4}$/.test(pin)) return res.status(400).json({ success: false, message: "User ID and 4-digit PIN are required." });`
  - [Line 98](../../../../server/controllers/mfaController.js#L98): `if (!user || !isCustomer(user)) return res.status(401).json({ success: false, message: "Invalid MFA request." });`
  - [Line 99](../../../../server/controllers/mfaController.js#L99): `if (!user.loginPinHash || !user.loginPinExpiresAt) return res.status(400).json({ success: false, message: "No active login PIN exists. Request a new PIN." });`
  - [Line 106](../../../../server/controllers/mfaController.js#L106): `return res.status(401).json({ success: false, message: "The login PIN has expired. Request a new PIN." });`
  - [Line 116](../../../../server/controllers/mfaController.js#L116): `return res.status(401).json({ success: false, message: "Incorrect verification PIN.", attemptsRemaining: Math.max(0, MAX_MFA_ATTEMPTS - user.loginPinAttempts) });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/mfa/customer/verify-pin'
```

