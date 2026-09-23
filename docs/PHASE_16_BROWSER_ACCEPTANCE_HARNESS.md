# Phase 16 — Browser Acceptance Harness

## Scope

Phase 16 adds a repeatable desktop/mobile browser acceptance harness for the web application. It closes the documented gap where browser acceptance was required but no dedicated Playwright suite or browser workflow existed.

## Implemented

- Playwright configuration with desktop Chrome and mobile Pixel 5 projects.
- Public-route acceptance coverage for core customer-facing surfaces.
- Unauthenticated protection checks for customer dashboard and booking routes.
- Login-form interaction coverage.
- Mobile viewport smoke coverage.
- Dedicated GitHub Actions workflow targeting an approved staging or production HTTPS URL.
- Static contract test keeping the browser harness in the release evidence chain.
- No credentials embedded in source or workflow inputs.

## Browser command

```bash
cd client
npm install
npm install --no-save playwright@1.55.0
npx playwright install --with-deps chromium
BROWSER_ACCEPTANCE_BASE_URL=https://<approved-staging-or-production-host> npx playwright test
```

## Workflow

`.github/workflows/browser-acceptance.yml`

Configure `BROWSER_ACCEPTANCE_BASE_URL` as a GitHub Actions secret. A manual workflow run may also supply an HTTPS `base_url`.

If no target is configured, the workflow records that browser acceptance is not configured; it does not fabricate a pass.

## Acceptance boundary

This phase provides the browser harness and public/protected navigation coverage. It does not certify authenticated role workflows, payments, M-Pesa, eTIMS, production data integrity, or other provider acceptance.

After approved test accounts exist, the required role matrix is:

1. Customer: login → browse tour → booking/checkout → booking status.
2. Admin: login → customer/booking management → invoice/payment visibility.
3. Finance: login → payment/accounting/reconciliation.
4. Tour Manager: login → tour lifecycle → guide/vehicle assignment.
5. Guide/Driver: login → assigned operations → status update.
6. SuperAdmin: login → tenant/platform/security/backup views.

Record desktop/mobile workflow evidence separately from source-code verification.

## Exit condition

Implementation is complete when the harness, contract test and workflow are committed and merged. Browser acceptance is recorded as PASS only after the configured environment test actually executes successfully.
