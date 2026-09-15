# Global Tours

Kenya-focused multi-tenant tour-operator platform.

## Production readiness baseline

**Baseline CI status: PASSED** — the repository's current release-gate baseline has passed all three verification phases on `main`.

- Release gate run: **34940798854**
- Verified commit: **9fee53c1ed8d6ce95cf4a9177d719666d4f8ad0c**
- Phase 1 — Security and tenant integrity: **PASSED**
- Phase 2 — Kenya production readiness: **PASSED**
- Phase 3 — Final release gate: **PASSED**
- Client lint: **PASSED**
- Client production build: **PASSED**
- Backend test suite: **PASSED**
- Production/model/service/controller checks: **PASSED**
- Tenant-isolation and production-readiness contract checks: **PASSED**
- Kenya compliance/payment module verification: **PASSED**
- Release configuration and committed-secret checks: **PASSED**

**Future test runs must treat this commit and release-gate run as the existing baseline.** Tests should start by checking the current `main` history and this document, then run the existing release gate and report only regressions or newly introduced gaps rather than re-opening already-passed repository checks without cause.

### What this baseline proves

The automated repository checks establish that the implemented security, multi-tenancy, subscription lifecycle, financial/compliance infrastructure, production safeguards, and frontend release checks are currently passing in CI.

### What this baseline does not prove

Automated CI cannot by itself prove live third-party operation. Before a commercial production launch, the remaining external acceptance evidence still needs to be obtained where applicable: live KRA/eTIMS onboarding and credentials, live tenant M-Pesa/provider credentials and callback registration, applicable TRA/ODPC compliance, production backup/restore drills, monitoring/alert configuration, and live integration acceptance transactions.

## Current implementation scope

The platform includes tenant-scoped bookings, customers, tours, payments, invoices, Kenyan tax configuration, eTIMS integration architecture, supplier/procurement workflows, profitability, corporate controls, external-website booking capture, developer API/webhooks, and operational foundations.

Subscription lifecycle enforcement, tenant isolation safeguards, financial reconciliation infrastructure, security controls, production error handling, health/observability infrastructure, and release-gate automation are part of the current production-readiness baseline.

Optional enterprise integrations such as GDS/flight booking, hotel inventory APIs, travel insurance, enterprise SSO and advanced bank integrations are not prerequisites for the core Kenyan tour-operator product.

## Production documentation

See [`docs/PRODUCTION_READINESS.md`](docs/PRODUCTION_READINESS.md) for the authoritative test baseline, the nine production-readiness areas, evidence requirements, and instructions for future test runs.
