# Global Tours — Production Readiness

## Current application baseline

**Verified application commit:** `8f9e90bb`  
**Verification date:** 2026-09-21

The repository completed the latest production-audit remediation and local verification. The code-level production contract passes. This document separates source-code verification from evidence that can only be obtained from the live deployment/provider environment.

## Verification matrix

| Area | Status | Evidence |
|---|---|---|
| Server static/security/production checks | PASS | `npm run check:all` |
| Backend automated suite | PASS | 95 tests; 92 passed, 0 failed, 3 skipped |
| Security suite | PASS | 4 passed, 0 failed, 0 skipped |
| Tour-domain suite | PASS | 5 passed, 0 failed |
| Targeted regression suite | PASS | 8 tests; 5 passed, 0 failed, 3 skipped |
| RBAC migration dry run | PASS | 19 groups; 0 normalization required |
| Client lint | PASS | `npm run lint` |
| Client production build | PASS | Vite build completed |
| Production readiness contract | PASS | `npm run check:production` |
| Production launch certification | NOT VERIFIED | External evidence gates remain |

## Latest remediation covered by the verification

- JWT issuer/audience validation is enforced consistently.
- Browser authentication uses secure HttpOnly session cookies with CSRF protection.
- Legacy browser JWT persistence and the dedicated browser M-Pesa bearer-token path were removed.
- Upload validation checks extension/MIME agreement, filename safety and tenant media scoping.
- Accounting chart-of-accounts cache entries have bounded lifetime.
- RBAC canonicalization is tenant-aware and dry-run-first; the final dry run reported zero groups requiring normalization.
- M-Pesa refund callback handling enforces tenant context before payment lookup/mutation.
- Security static checks cover the tenant-resolution and M-Pesa refund paths.
- Security and targeted regression tests passed.

## Intentionally skipped local integration tests

These were not failed; they require runtime conditions unavailable in the local verification environment:

1. airport-transfer payment completion atomic lifecycle;
2. tour lifecycle transactional capacity reservation/release;
3. payment-completion rollback when accounting posting fails.

They must be exercised in an environment with the required database transaction/provider capabilities before being used as production evidence.

## External acceptance gates

### Deployment

**Current-main production deployment:** NOT VERIFIED

**Status: NOT VERIFIED**

The deployed production environment must report the intended current `main` commit before current-main launch certification can be claimed.

### M-Pesa

**M-Pesa sandbox callback:** PENDING

**Status: PENDING external evidence**

Required:

- callback receipt on an approved HTTPS target;
- callback integrity and tenant validation;
- successful payment completion;
- booking status transition;
- invoice/payment journal/accounting reconciliation;
- duplicate callback/idempotency replay;
- failed/expired payment behavior.

STK initiation alone does not prove payment completion.

### eTIMS/KRA

**Live KRA/eTIMS submission:** PENDING

**Status: PENDING external evidence**

Required production onboarding/configuration and actual submission evidence, including provider receipt/control-number information where applicable. Source-code safety contracts are not KRA certification.

### Browser acceptance

**Status: PENDING**

Manual desktop/mobile acceptance remains required for customer, Admin, Finance, Tour Manager, Driver and SuperAdmin workflows.

### Data integrity

**Status: PENDING**

A read-only production MongoDB integrity/reconciliation scan must be completed against the intended deployed release.

## Acceptance rules

- **PASS:** required test ran and evidence exists.
- **FAIL:** test ran and expected behavior was not met.
- **BLOCKED:** an external prerequisite prevents execution.
- **PENDING:** required test/evidence has not yet been completed.
- **NOT VERIFIED:** an observation exists but does not prove the acceptance criterion.

Never record passwords, tokens, private keys, MFA PINs, M-Pesa secrets/passkeys or other credentials in documentation.

<!-- DOCS-AUTO:START -->
## Current repository state

This section is maintained automatically by `scripts/update-documentation.js` and the GitHub Actions documentation workflow.

- **Repository:** Global Tours — multi-tenant tours & travel SaaS
- **Branch:** `main`
- **Current commit:** `9b274843d5dd00cf2522a6d09967a875c924598f`
- **Short commit:** `9b274843`
- **Documentation snapshot date (UTC):** 2026-09-21
- **Server package:** `hussein-mboya-tours-server@1.0.0`
- **Client package:** `client@0.0.0`
- **Server verification commands:** `npm run check:all`, `npm test`, `npm run test:security`, `npm run test:tour-domain`
- **Client verification commands:** `npm run lint`, `npm run build`
- **Production contract:** `npm run check:production`
- **Release rule:** production certification requires current deployment/provider evidence; local or CI source checks alone do not certify live production.

### Documentation automation

Every push to `main` runs the documentation workflow. It refreshes this generated repository-state section and commits documentation-only changes when the generated content changes. Manual edits outside the generated markers are preserved.

<!-- DOCS-AUTO:END -->
