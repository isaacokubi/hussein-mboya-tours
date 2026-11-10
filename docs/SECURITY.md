# Security

## Implemented controls observed in source

- Password authentication is implemented in `authController.js`; user schema behavior and password verification should be inspected in `models/User.js`. The server depends on `bcryptjs`, but document exact hash parameters from the active schema/controller before making a cost-factor claim.
- JWT access tokens are verified with issuer and audience in `middleware/authMiddleware.js`. The guard reloads the user and populated role/permissions, checks active status and tenant identity, and sets tenant context.
- Auth cookies are centralized in `utils/authCookie.js`. Cookie-authenticated state-changing requests are checked against `X-CSRF-Token` and the CSRF cookie.
- Role and permission middleware separates common roles from named permissions. Frontend route guards complement, but do not replace, backend authorization.
- Tenant resolution/filtering is implemented in middleware, AsyncLocalStorage context, query helpers and model plugins. Raw aggregation paths need explicit review.
- Helmet, exact configured CORS origins, request limits, bounded JSON body size, rate limiters, production error sanitization, and selective production log redaction are in `app.js`.
- M-Pesa callbacks pass through payload validation, tenant resolution and integrity/verification handlers. Stripe/PayPal have provider-specific webhook models/verification code.
- Payment/eTIMS/webhook secrets have encrypted/configured secret mechanisms described in environment and readiness docs.

## Authentication flow

Registration/login and password reset routes are in `authRoutes.js`; login behavior is in `authController.js`. Successful login issues a JWT and auth cookie behavior through shared helpers. Each protected request verifies the token and reloads current account/role status, so role/status changes can be reflected without trusting a stale role claim. Tenant mismatches are rejected. Full MFA capability is present in code, but whether it is required depends on configuration and the particular login route.

## Secrets and data

Keep `.env` files and provider credentials out of Git. Use Render's secret environment values or the target host's secret store. Never put a secret in `VITE_*`: Vite variables are compiled into browser-visible code. Do not send passwords, tokens, phone values or payment secrets to logs. The repository includes demo/test seed tooling; never reuse demo credentials for production.

## Limits and review areas

Code review cannot establish that deployed secrets are strong/rotated, that MongoDB roles are least-privilege, or that backups and incident response work. Tenant isolation must be tested on every new path, especially admin exports, cross-document references, callbacks, aggregation, bulk updates and background jobs. External payment signatures and callback reachability require provider-backed tests. Security recommendations include regular dependency review, independent penetration testing, production restore exercises, central log/alert retention, and reviewing every upload/export surface.

See [payment security](PAYMENTS_AND_MPESA.md), [environment variables](ENVIRONMENT_VARIABLES.md), and existing dated production readiness reports for evidence boundaries.

## Source-supported review findings

These are implementation observations, not penetration-test results. No application security behavior was changed during this documentation pass.

| Classification | Evidence | Impact and response |
|---|---|---|
| **Confirmed behavior; potential reliability risk** | `subscriptionMpesaCallbackController` and `mpesaController.mpesaCallback` catch internal processing errors and return Daraja's accepted result code. | A failed internal state transition can be acknowledged, so provider redelivery may not repair it. Add durable callback-processing state, alerting and reconciliation; test failures after provider confirmation. This is not evidence that a real payment was lost. |
| **Confirmed behavior; potential consistency risk** | `customerBookingController` reserves slots and then creates the booking as separate operations; compensation runs only when the create path throws. Compensation errors are caught/logged. | Process termination between the operations can leave a slot reservation without a booking. Use the transaction/conditional update strategy for this route or add reconciliation and expiry for reservations. |
| **Confirmed behavior; potential financial consistency risk** | For corporate bookings, the controller increments `CorporateAccount.currentBalance` before `reserveSlots`, but its rollback `try/catch` starts after `reserveSlots` succeeds. | If slot reservation throws, the controller forwards the error without reversing the credit increment. Wrap both operations in one transaction or ensure compensation also covers reservation failure; add a regression test. |
| **Confirmed behavior; potential session exposure risk** | `AuthContext.login` stores the returned bearer token in localStorage as a fallback alongside the HttpOnly cookie session. | JavaScript executing through an XSS flaw could read that bearer token. Preserve output escaping/CSP and consider whether the compatibility fallback can be replaced with a secure same-site cookie strategy for all supported deployments. |
| **Confirmed behavior; verification-policy question** | `authController.register` sets `isVerified: true` without verifying email or phone. | If a downstream feature interprets this field as proof of contact ownership, that assumption is unsafe. Decide whether the field means “registration complete” or actual contact verification and align consumers. |
| **Recommended configuration control** | Login and password-reset controllers expose development codes only when `MFA_DEV_MODE=true`. | Keep this false in production and validate deployment configuration; the repository does not prove the deployed value. |
| **Potential design improvement** | Password reset code is six digits, stored as an unsalted SHA-256 digest, expires after ten minutes, and has an application attempt limit of five. | The attempt cap limits online guessing, while a database disclosure permits offline enumeration of the small code space. Consider a keyed digest or larger random token, consume-once semantics, and atomic attempt updates. |
| **Potential authorization-policy risk** | `adminPaymentRoutes` requires `authorize("payment.manage")`, while booking refund routes in `adminRoutes.js` use `protect`, `resolveTenant` and `adminMiddleware` but do not add that named permission check. | The routes still require the admin middleware, so this source observation does not prove unauthorized access. It does mean least-privilege payment permission is not consistently expressed on the booking-refund aliases; confirm the intended policy and add an explicit permission guard if refunds should require it. |

No confirmed exploitable vulnerability was established by this source review. The items above are potential risks or policy choices requiring threat-model and deployment review.
