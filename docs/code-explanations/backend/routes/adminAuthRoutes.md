# Route module: adminAuthRoutes.js

**Source:** [server/routes/adminAuthRoutes.js](../../../../server/routes/adminAuthRoutes.js)

Observed mount prefixes include `/api/admin/auth/login`.

## Router-wide middleware

- `router.use(resolveTenant);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### POST /login → `/api/admin/auth/login`

Declared at source line 26. Route handler pipeline names: `loginRateLimiter`, `adminLogin`.

```js
router.post(
  "/login",
  loginRateLimiter,
  adminLogin
)
```

- Imported handler/middleware `loginRateLimiter`: [authRateLimiters.js](../../../../server/middleware/authRateLimiters.js)
- Imported handler/middleware `adminLogin`: [adminAuthController.js](../../../../server/controllers/adminAuthController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `adminLogin`

Handler starts at [controller line 16](../../../../server/controllers/adminAuthController.js#L16). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `email`, `password`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `401`, `403`, `200`, `500`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Email and password are required.”; “Invalid email or password”; “Administrative access required.”; “Unable to complete admin login.”.
- Database operations detected: `User.findOne`.
- Input/validation source lines to inspect:
  - [Line 18](../../../../server/controllers/adminAuthController.js#L18): `const email = String(req.body?.email || "").trim().toLowerCase();`
  - [Line 19](../../../../server/controllers/adminAuthController.js#L19): `const password = String(req.body?.password || "");`
  - [Line 22](../../../../server/controllers/adminAuthController.js#L22): `return res.status(400).json({`
  - [Line 55](../../../../server/controllers/adminAuthController.js#L55): `return res.status(401).json({ success: false, message: "Invalid email or password" });`
  - [Line 60](../../../../server/controllers/adminAuthController.js#L60): `return res.status(403).json({ success: false, message: "Administrative access required." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/admin/auth/login'
```

