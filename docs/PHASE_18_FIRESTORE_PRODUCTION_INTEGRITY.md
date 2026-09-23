# Phase 18 — Firestore Production Integrity & Reconciliation

## Objective

Replace the stale MongoDB production-integrity acceptance wording with a read-only Firestore scan that can be executed against the intended deployed environment.

## What the scan verifies

- tenant IDs on tenant-scoped financial/operational records;
- customer/user tenant consistency for bookings;
- payment → booking tenant consistency;
- invoice → booking tenant consistency;
- missing booking references from payments/invoices;
- duplicate booking invoices;
- booking payment/deposit/balance/status reconciliation;
- invoice amount-paid/balance reconciliation against completed/refunded payments;
- duplicate tenant-scoped provider references;
- duplicate tenant-scoped invoice numbers;
- posted journal-entry balance;
- invoice/payment journal source existence and tenant consistency.

The scanner is **read-only**. It does not repair or mutate production data.

## Execution

Against the approved deployed Firestore environment:

```bash
cd server
npm install
FIREBASE_PROJECT_ID=<production-project> npm run audit:firestore-integrity
```

Use the deployment's normal Firebase service-account/ADC configuration. Never put service-account JSON, private keys or other credentials in Git.

A successful scan must return:

```json
{
  "readOnly": true,
  "ok": true,
  "issueCount": 0
}
```

The scan is evidence for the data-integrity gate only. It does not certify deployment SHA, M-Pesa, eTIMS, browser acceptance, webhooks, backup/restore or regulatory compliance.

## Evidence rule

Set `PRODUCTION_DATA_INTEGRITY_VERIFIED=true` only after the scan has run against the intended deployed environment and the resulting evidence has been retained with timestamp, deployment commit, project/environment and issue count.

Do not store customer data exports or credentials in the repository.
