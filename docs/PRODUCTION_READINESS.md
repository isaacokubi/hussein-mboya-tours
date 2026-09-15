# Production Readiness Baseline

## Purpose

This document is the persistent hand-off point for production-readiness testing. Future engineers, agents, CI jobs, and release reviews must begin from the baseline recorded here and test for regressions or new gaps.

## Baseline: PASSED

The verified application baseline is commit `0b00897efa85ab8e4097755670091d2abaa63285`, which passed the complete release gate in run `34942492468`.

| Item | Baseline result |
|---|---|
| Release gate run | `34942492468` |
| Verified application commit | `0b00897efa85ab8e4097755670091d2abaa63285` |
| Phase 1 — Security and tenant integrity | PASS |
| Phase 2 — Kenya production readiness | PASS |
| Phase 3 — Final release gate | PASS |
| Backend test suite | PASS |
| Production/model/service/controller checks | PASS |
| Tenant isolation and production-readiness contracts | PASS |
| Kenya compliance/payment module checks | PASS |
| Client lint | PASS |
| Client production build | PASS |
| Release configuration checks | PASS |
| Committed environment-secret check | PASS |

Documentation and deployment-acceptance commits were made after the verified application baseline. They do not change the application baseline; current `main` must still be tested normally, and any newly introduced regression remains a release blocker.

## The nine readiness areas

### 1. End-to-end booking and payment testing

Repository coverage and payment lifecycle safeguards are present and passing in automated CI, including payment boundaries and reconciliation infrastructure.

**External evidence still required before launch:** real M-Pesa/Daraja and/or other configured provider transactions, callbacks, failure/timeouts, duplicate callback handling, reconciliation, cancellation and refund acceptance using production or approved certification credentials.

### 2. Kenyan business compliance

The repository contains tax configuration, invoice/receipt infrastructure, eTIMS integration architecture, reconciliation services, compliance records, and related checks. The Kenya readiness phase passed.

**External evidence still required:** applicable KRA/eTIMS onboarding/certification and credentials, confirmed VAT/tax configuration, and any applicable TRA/ODPC/business compliance obligations.

### 3. Multi-tenant isolation

Tenant-scoped models, tenant resolution/context, tenant query/write safeguards, bootstrap validation, audit/security services, and tenant-isolation regression/contract checks are part of the passing baseline.

**Future tests:** continue probing read, create, update, delete, reporting, payment, booking, user, vehicle, guide, dashboard, and export paths for cross-tenant access. Any regression is a release blocker.

### 4. Subscription enforcement

Trial expiry, paid expiry/grace behavior, suspension, recovery/billing access, plan/feature enforcement, and subscription lifecycle checks are covered by the current implementation and passing contract/release checks.

**Future tests:** verify every protected feature honors the same subscription state and that SuperAdmin billing controls remain usable for recovery.

### 5. Security hardening

Authentication, RBAC, tenant authorization, security headers, validation, rate limiting, CORS, secure uploads, webhook security, environment validation, and production safeguards are represented in the current checks and the Phase 1 gate passed.

**Future tests:** add regression coverage whenever a new route, role, integration, upload path, webhook, or privileged action is introduced.

### 6. Financial/accounting reliability

Tenant-scoped payments, invoices, expenses, accounting/subledger models, reconciliation services, reporting, audit metadata, and Kenya compliance financial infrastructure are present and covered by production-readiness checks.

**Future tests:** reconcile payment totals against bookings, invoices, refunds, expenses, taxes, balances, exports, and reports using isolated tenant fixtures.

### 7. Production error handling

Centralized error handling, response utilities, validation, health/diagnostic services, operational monitoring, and production resilience infrastructure are present in the repository and included in the release-readiness surface.

**Future tests:** deliberately exercise unavailable databases, provider failures, malformed callbacks, expired sessions, network failures, missing configuration, and unexpected application errors. Responses must remain safe and user-facing; no raw secrets or stack traces should leak.

### 8. Deployment and monitoring

Production configuration, health endpoints/services, observability, monitoring, backup services, release gates, and deployment-readiness infrastructure are present.

**External evidence still required:** production environment configuration, actual monitoring/alerts, backup execution, restore drill, and deployment acceptance on the chosen hosting/infrastructure providers.

### 9. UI/UX QA

The client release gate includes lint and a production build, and the known calendar lint purity failure was repaired before the passing baseline.

**Future tests:** continue manual/device QA for 404 routes, driver dashboard data, tour-manager flows, mobile hero media, loading/empty/error/payment states, responsive navigation, accessibility, and performance. These require real browser/device acceptance in addition to CI.

## Required future test procedure

1. Read this document and the root `README.md` before testing.
2. Identify the current `main` HEAD and compare it with the verified application baseline above.
3. Run the existing release-gate workflow first.
4. Treat the baseline PASS items as established unless code changes invalidate them.
5. Investigate only regressions, newly added code paths, or external evidence that has not yet been supplied.
6. If a regression is found, fix it on `main`, rerun the affected checks, then rerun the complete release gate.
7. Update this document with a new passing run ID and application commit SHA after a materially changed application baseline is re-certified.
8. Never mark live provider, compliance, backup/restore, monitoring, or deployment acceptance as PASS solely because repository CI passed.

## Release decision rule

A passing repository release gate means the **codebase baseline is passing automated readiness checks**. It is not, by itself, a declaration that every external production prerequisite has been completed. Commercial launch should occur only after the external evidence items above are verified for the actual production environment.

## Historical baseline notes

- Subscription hardening: `b077f25a698322f1d0f95c804a9ee001f0ee573f`
- Production-readiness contract coverage: `088d4b27cc1ce03c4eb9a2923449c3e5c76fe79c`
- Calendar lint repair: `46e11bcffe0f2069ef1446bd21a2ad3dc79d3b80`
- Temporary lint repair workflow removed: `9fee53c1ed8d6ce95cf4a9177d719666d4f8ad0c`
- Verified passing application release gate: `34942492468`
