# Global Tours

Kenya-focused multi-tenant tour-operator platform.

## Production readiness baseline

**Baseline CI status: PASSED** — the repository's latest verified application baseline passed all three release-gate phases on `main`.

- Release gate run: **34942492468**
- Verified application commit: **0b00897efa85ab8e4097755670091d2abaa63285**
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

**Future test runs must treat this verified application commit and release-gate run as the existing baseline.** Documentation and deployment-acceptance commits made afterward do not invalidate that application baseline; tests should start from the current `main` history and this document, then run the existing release gate and report only regressions or newly introduced gaps.

### What this baseline proves

The automated repository checks establish that the implemented security, multi-tenancy, subscription lifecycle, financial/compliance infrastructure, production safeguards, and frontend release checks were passing in CI at the verified application baseline.

### What this baseline does not prove

Automated CI cannot by itself prove live third-party operation. Before a commercial production launch, the remaining external acceptance evidence still needs to be obtained where applicable: live KRA/eTIMS onboarding and credentials, live tenant M-Pesa/provider credentials and callback registration, applicable TRA/ODPC compliance, production backup/restore drills, monitoring/alert configuration, and live integration acceptance transactions.

## Current implementation scope

The platform includes tenant-scoped bookings, customers, tours, payments, invoices, Kenyan tax configuration, eTIMS integration architecture, supplier/procurement workflows, profitability, corporate controls, external-website booking capture, developer API/webhooks, and operational foundations.

Subscription lifecycle enforcement, tenant isolation safeguards, financial reconciliation infrastructure, security controls, production error handling, health/observability infrastructure, and release-gate automation are part of the current production-readiness baseline.

Optional enterprise integrations such as GDS/flight booking, hotel inventory APIs, travel insurance, enterprise SSO and advanced bank integrations are not prerequisites for the core Kenyan tour-operator product.

## Production documentation

See [`docs/PRODUCTION_READINESS.md`](docs/PRODUCTION_READINESS.md) for the authoritative test baseline, the nine production-readiness areas, evidence requirements, and instructions for future test runs.
