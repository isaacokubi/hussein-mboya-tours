# Hussein Mboya Tours — Professional Engineering & Security Audit

**Assessment date:** 16 August 2026  
**Scope:** Supplied source ZIP, MERN backend/frontend, authentication, RBAC, booking/tour operations, payments, uploads, sockets, AI, privacy, reliability and DevSecOps.

## Executive decision

**Release with security remediation required.** The supplied codebase has a strong functional foundation but is not yet at a defensible production security posture for a travel/booking platform handling identity, passport, emergency and health-related traveler information and payment workflows.

The audit copy in this ZIP includes targeted hardening for several high-risk issues discovered during review. It does **not** claim that all findings are closed.

## Inventory observed

- Route files: 59
- Controllers: 86
- Models: 46
- React component files observed: 91
- Backend stack: Express 5, Mongoose 8, JWT, bcryptjs, Helmet, CORS, Socket.IO, Cloudinary
- Frontend stack: React 19, Vite, React Router, TanStack Query, Axios, Tailwind
- Payment integrations observed: M-Pesa and Stripe
- AI integrations observed: OpenAI-related services/routes

## Findings

- **F-001 — Public database endpoint exposed** — Critical — Remediated in supplied build.
  - Evidence: `server/routes/databaseRoutes.js + server/server.js`
  - Assessment: Unauthenticated callers could query database status and future implementation risk. Hardened with protect + system.database authorization.
- **F-002 — System settings route exposed without authentication** — Critical — Remediated in supplied build.
  - Evidence: `server/routes/settingsRoutes.js + server/server.js`
  - Assessment: The same router was mounted directly under /api/settings and had no middleware. Hardened with protect + settings.manage.
- **F-003 — System health leaked environment/runtime internals** — High — Remediated in supplied build.
  - Evidence: `server/routes/systemHealthRoutes.js; server/routes/index.js`
  - Assessment: Responses exposed Node version, environment, memory, OS and architecture. Hardened to minimal DB/application health and protected admin access.
- **F-004 — Super-admin tools routes lacked authorization** — Critical — Remediated in supplied build.
  - Evidence: `server/routes/superAdminToolsRoutes.js`
  - Assessment: Database/settings tool endpoints were directly callable. Added protect + system.security.
- **F-005 — Socket authentication relied on client-supplied user ID** — Critical — Remediated in supplied build.
  - Evidence: `server/socket/socketManager.js`
  - Assessment: A client could register an arbitrary user ID. Socket middleware now verifies JWT and binds identity server-side.
- **F-006 — Socket rooms accepted arbitrary room names** — High — Remediated in supplied build.
  - Evidence: `server/socket/socketManager.js`
  - Assessment: An authenticated or unauthenticated client could attempt arbitrary room joins. Supplied build restricts joins to the caller's private user room.
- **F-007 — JWT issuer/audience not enforced on verification** — High — Remediated in supplied build.
  - Evidence: `server/middleware/authMiddleware.js`
  - Assessment: Tokens were signed with issuer/audience but verification only supplied the secret. Verification now requires both claims.
- **F-008 — Large global request body limits** — High — Remediated in supplied build.
  - Evidence: `server/app.js`
  - Assessment: 10 MB JSON/urlencoded limits create unnecessary memory/CPU exposure. Supplied build uses 1 MB defaults; file uploads remain separately limited.
- **F-009 — Authentication endpoints lacked dedicated rate limiting** — High — Remediated in supplied build.
  - Evidence: `server/routes/authRoutes.js; server/routes/adminAuthRoutes.js`
  - Assessment: Credential attacks and reset abuse need tighter controls than a generic limiter. Supplied build adds 10/15m login and 5/15m password-reset limits.
- **F-010 — Multipart parser nesting/field limits incomplete** — High — Remediated in supplied build.
  - Evidence: `server/middleware/uploadMiddleware.js`
  - Assessment: Multer 2.2.0 is patched for 2026 DoS issues, but application-level multipart field/nesting limits are still required. Added explicit limits.
- **F-011 — JWT stored in browser localStorage** — High — Open.
  - Evidence: `client/src/context/AuthContext.jsx; client/src/api/axios.js`
  - Assessment: Any successful XSS can read bearer tokens and impersonate users until expiry. Move toward httpOnly Secure SameSite cookies and short-lived access tokens.
- **F-012 — Mass-assignment patterns in privileged controllers** — High — Open.
  - Evidence: `server/controllers/staffController.js; adminCouponController.js; tourManagerController.js; itineraryController.js; vehicleController.js; aiBookingController.js`
  - Assessment: req.body is passed wholesale or spread into trusted models. This risks privilege/state manipulation and business-rule bypass.
- **F-013 — Passport and health/emergency data stored as ordinary fields** — High — Open.
  - Evidence: `server/models/Booking.js`
  - Assessment: Passport number, medical conditions, DOB and emergency contacts are high-risk personal/sensitive data. Apply minimization, field-level encryption/tokenization, strict projections, retention and access logging.
- **F-014 — Password reset code protection needs stronger defense** — High — Partially remediated.
  - Evidence: `server/controllers/authController.js`
  - Assessment: Codes are SHA-256 hashed and expire in 10 minutes, but application-wide throttling, replay resistance, HMAC/pepper and atomic attempt increments should be strengthened.
- **F-015 — Registration immediately marks users verified** — High — Open.
  - Evidence: `server/controllers/authController.js`
  - Assessment: isVerified is set true during registration. This undermines email/phone ownership assurance and can increase account abuse.
- **F-016 — Production CORS depends on optional environment variable** — High — Open.
  - Evidence: `server/app.js; server/config/env.js`
  - Assessment: Fallback to localhost is acceptable for development but production should fail closed when allowed origins are missing or malformed.
- **F-017 — Legacy/duplicate role names increase authorization complexity** — Medium — Open.
  - Evidence: `server/models/User.js; middleware files`
  - Assessment: admin/superadmin/administrator and multiple manager/guide aliases expand the authorization state space. Normalize roles in a single RBAC authority.
- **F-018 — Authorization is duplicated across multiple middleware implementations** — High — Open.
  - Evidence: `server/middleware/authMiddleware.js; roleMiddleware.js; permissionMiddleware.js; adminMiddleware.js`
  - Assessment: Different paths use different permission semantics and legacy bypasses. Consolidate policy evaluation and default-deny.
- **F-019 — Client-side permission state is trusted for navigation** — High — Open; defense-in-depth.
  - Evidence: `client/src/components/admin/ProtectedAdminRoute.jsx`
  - Assessment: UI guards are not security boundaries. The server is authoritative, but client state can be manipulated to reveal screens and trigger confusing flows.
- **F-020 — Verbose security/debug logging remains in several paths** — Medium — Open.
  - Evidence: `server/controllers/*; middleware/*`
  - Assessment: Logs include emails, role data and potentially operational details. Production logs should use structured redaction and correlation IDs.
- **F-021 — No explicit CSRF strategy for cookie authentication** — High — Open.
  - Evidence: `server/app.js; authMiddleware.js`
  - Assessment: withCredentials and cookie token support create CSRF exposure if cookie authentication is used. If cookies become primary, use SameSite plus CSRF tokens for state-changing requests.
- **F-022 — Booking capacity changes need atomic concurrency controls** — High — Open.
  - Evidence: `server/models/Tour.js`
  - Assessment: bookSlot/releaseSlot are read-modify-save operations. Concurrent bookings can oversell capacity without atomic conditional updates/transactions.
- **F-023 — Payment state transitions require server-side invariants** — High — Open.
  - Evidence: `server/models/Booking.js; payment controllers`
  - Assessment: Payment status, deposits, balances, refunds and commissions are financial state. All transitions must be idempotent, audited, authorization-checked and transactionally consistent.
- **F-024 — M-Pesa/webhook security must be independently verified** — High — Open pending live provider validation.
  - Evidence: `server/routes/mpesaRoutes.js; controllers/mpesaController.js`
  - Assessment: Payment callbacks require provider signature/credential validation, replay protection, idempotency keys and amount/reference reconciliation before marking bookings paid.
- **F-025 — AI endpoints need data minimization and abuse controls** — High — Open.
  - Evidence: `server/routes/aiRoutes.js; adminAIRoutes.js`
  - Assessment: Prompts may contain customer/booking information and can incur cost or leak sensitive data. Add role-specific limits, prompt logging redaction, model allowlists and outbound policy.

## Changes made in the audit copy

1. JWT verification now enforces the issuer and audience that the application already places into signed tokens.
2. Global JSON/urlencoded request limits were reduced from 10 MB to 1 MB.
3. Dedicated login and password-reset rate limiters were added.
4. Multipart upload limits now include field count, field size, field-name size and nesting depth.
5. System settings endpoints now require authentication and `settings.manage`.
6. Database status endpoints now require authentication and `system.database`.
7. System health endpoints no longer expose Node version, OS, memory or environment to ordinary callers and require administrative authorization.
8. Super-admin tools now require authentication and `system.security`.
9. Socket connections now authenticate using a verified JWT and derive user identity server-side.
10. Arbitrary Socket.IO room joins are restricted to the authenticated user's private room.
11. The audit copy retains the application's existing frontend bearer-token architecture for compatibility; moving tokens to secure httpOnly cookies remains an open recommendation.

## High-priority open work

### 1. Replace localStorage bearer tokens

The client currently stores the JWT in browser localStorage. Any XSS compromise can read the token. A preferred architecture is short-lived access tokens with refresh rotation using secure, httpOnly, SameSite cookies, plus session revocation.

### 2. Eliminate mass assignment

The following privileged controllers contain direct `req.body` persistence/spread patterns that require endpoint-specific allowlists:

- `server/controllers/staffController.js`
- `server/controllers/adminCouponController.js`
- `server/controllers/tourManagerController.js`
- `server/controllers/itineraryController.js`
- `server/controllers/vehicleController.js`
- `server/controllers/aiBookingController.js`

### 3. Protect sensitive traveler data

`Booking` includes passport number, date of birth, medical conditions and emergency contacts. These fields require minimization, field-level encryption/tokenization where practical, strict projections, retention controls and audit logging.

### 4. Make booking capacity atomic

`Tour.bookSlot()` uses read-modify-save semantics. Concurrent booking requests can oversell capacity. Use an atomic conditional update or transaction.

### 5. Make payment state transactional and idempotent

Payment callbacks and refunds must reconcile provider reference, booking, amount and currency, then perform one idempotent state transition. Never trust client-supplied payment totals or statuses.

### 6. Consolidate authorization

There are several authorization implementations (`authMiddleware`, `roleMiddleware`, `permissionMiddleware`, `adminMiddleware`) plus legacy role aliases. Consolidate policy evaluation and use default-deny rules.

### 7. Production configuration must fail closed

Require explicit production CORS origins and critical third-party secrets. Do not silently fall back to localhost in production.

## Verification status

Server JavaScript syntax was checked after the supplied hardening changes. Full frontend build/lint, dependency audit against the live registry, production infrastructure review and authenticated penetration testing require the normal project environment and credentials.

## Standards and current dependency notes

The audit uses OWASP ASVS 5.0 as a verification reference and OWASP API Security Top 10 2023 for API risk mapping.

The supplied `multer` version is `2.2.0`, which is the patched release for the June 2026 Multer DoS advisories reviewed during this assessment. The supplied Axios versions are above the 1.18.0 patch level relevant to the July 2026 recursion/NO_PROXY advisories reviewed. The supplied Vite version is 5.4.21, which is the patched release for the cited Windows `server.fs.deny` advisory.

The registry-backed `npm audit` endpoint was unavailable in this execution environment, so a live dependency vulnerability count is **not** asserted. Run `npm audit`, `npm audit signatures`, and an SBOM scan in CI with network access before release.

## Kenya privacy considerations

The system processes personal data and potentially sensitive traveler information. The Kenya Data Protection Act 2019 requires lawful/fair/transparent processing, purpose limitation, minimization, accuracy, storage limitation and safeguards. The project should establish a data inventory, privacy notices, retention schedule, data-subject rights process, breach procedure and documented third-party/cross-border data-transfer controls.

## Deliverables

- `AUDIT/Hussein-Mboya-Tours-Professional-Code-Security-Audit-2026.pdf` — 151-page professional audit.
- `AUDIT/SECURITY_REMEDIATION.md` — this remediation register and release guidance.
- `AUDIT/audit-manifest.json` — machine-readable summary.
- Hardened source files in the normal project tree.

## Important limitation

This is a source-code audit and engineering review. It is not a penetration-test certificate, PCI DSS assessment, ODPC legal opinion, cloud configuration assessment or guarantee that the application is vulnerability-free.
