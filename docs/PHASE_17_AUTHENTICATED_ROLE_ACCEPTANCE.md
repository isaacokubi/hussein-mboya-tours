# Phase 17 — Authenticated Role Acceptance

## Objective

Extend the Phase 16 browser harness from public/unauthenticated checks to an explicit authenticated acceptance matrix for the application's operational personas.

## Personas covered

- Customer
- Admin
- Finance
- Tour Manager
- Guide
- Driver
- SuperAdmin

The Finance persona is intentionally modeled as a permission-bearing test account and navigates directly to the finance surface; it does not assume that "finance" is a canonical application role.

## Security boundary

Credentials are never committed to Git. The authenticated browser suite reads approved test accounts from:

`BROWSER_ACCEPTANCE_ROLE_USERS_JSON`

Each persona entry must contain:

- `email`
- `password`
- `route`
- optional `paths` array for additional acceptance surfaces

Use dedicated non-production/staging accounts. Do not use real customer, employee or production administrator credentials.

## Browser acceptance behavior

For each configured persona the suite:

1. opens the login page;
2. authenticates with the supplied test account;
3. verifies the session leaves the login surface;
4. opens the persona's acceptance route;
5. verifies the route does not bounce back to login;
6. verifies a non-empty application surface;
7. optionally checks additional persona paths;
8. logs out when a visible logout control is available.

The suite deliberately does not claim that business transactions, payment-provider callbacks, eTIMS submissions or accounting reconciliation succeeded. Those remain separate evidence gates.

## Configuration example

The following is a shape example only; do not copy real credentials into source control:

```json
{
  "customer": {"email": "<staging-customer-email>", "password": "<staging-customer-password>", "route": "/dashboard"},
  "admin": {"email": "<staging-admin-email>", "password": "<staging-admin-password>", "route": "/admin/dashboard"},
  "finance": {"email": "<staging-finance-email>", "password": "<staging-finance-password>", "route": "/admin/finance"},
  "tour_manager": {"email": "<staging-manager-email>", "password": "<staging-manager-password>", "route": "/tour-manager/dashboard"},
  "guide": {"email": "<staging-guide-email>", "password": "<staging-guide-password>", "route": "/guide/dashboard"},
  "driver": {"email": "<staging-driver-email>", "password": "<staging-driver-password>", "route": "/driver/dashboard"},
  "super_admin": {"email": "<staging-superadmin-email>", "password": "<staging-superadmin-password>", "route": "/superadmin/dashboard"}
}
```

## Execution

Run against an approved HTTPS staging target:

```bash
cd client
npm install
npm install --no-save playwright@1.55.0
npx playwright install --with-deps chromium
BROWSER_ACCEPTANCE_BASE_URL=https://<approved-host> \
BROWSER_ACCEPTANCE_ROLE_USERS_JSON='{"customer":...}' \
npx playwright test e2e/authenticatedRoleAcceptance.spec.js
```

The JSON must be supplied through the CI secret manager or local environment, not stored in Git.

## Acceptance boundary

A passing browser run proves only that the configured accounts could authenticate and reach their configured UI surfaces in the tested environment. It does not certify:

- production deployment SHA;
- tenant isolation;
- payment/M-Pesa completion;
- eTIMS/KRA production acceptance;
- signed webhook delivery;
- backup/restore;
- accounting reconciliation;
- regulatory compliance.
