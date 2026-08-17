# Security Hardening Package Notes

This package is based on the supplied `hussein-mboya-tours-main (10).zip`.

Included targeted hardening:
- JWT issuer/audience verification.
- Reduced global JSON/urlencoded body limits.
- Dedicated login/password-reset rate limiting, now wired into auth and admin login routes.
- Multipart upload limits.
- Protected database/settings/system-health/super-admin tool endpoints.
- Socket JWT authentication and private-room restrictions.
- Removal of accidental root files `detected."` and `yntax: PASSED"`.

Checkout:
- `Checkout.jsx` currently places the M-Pesa polling `useEffect` before the loading/not-found early returns in the supplied source.
- The merge script verifies this ordering and runs a production frontend build.

Important: this is targeted remediation, not a guarantee that every open security finding is closed. The audit itself identifies unresolved items including localStorage bearer tokens, mass assignment, sensitive traveler-data protection, atomic booking capacity, payment invariants/idempotency, CORS fail-closed production configuration, authorization consolidation, logging redaction, CSRF strategy if cookies become primary, and AI abuse/data-minimization controls.
