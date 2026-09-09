# Kenya production runbook

## KRA and eTIMS

The application contains a Kenyan tax calculation engine, tenant tax profiles, invoice eTIMS state, a durable submission queue, and a provider-neutral adapter boundary.

Before enabling live submissions for a tenant:

1. Complete the tenant's KRA/eTIMS onboarding and obtain the required credentials/device configuration.
2. Use an appropriate OSCU/VSCU or certified system-to-system integration path.
3. Complete the provider's development, testing and certification/vetting process where applicable.
4. Configure `TaxProfile.etimsEnabled=true` only after the tenant is ready.
5. Configure `ETIMS_ADAPTER_URL` and the protected adapter token in the deployment environment.
6. Verify invoice numbering, buyer PIN handling, tax categories, receipt responses and QR/unique-register fields in sandbox before production.

The application never fabricates a KRA receipt or claims certification when an adapter is not configured.

## TRA

Use the Compliance module to record each applicable tourism licence/permit, authority, reference number, issue date, expiry date, owner, review date and supporting document. Regulatory applicability should be confirmed for the actual business activities and counties/locations.

## ODPC / privacy

The application provides a tenant-scoped compliance workflow and data-subject request workflow for access, correction, deletion, portability, objection and restriction. Businesses must configure their actual privacy notice, lawful bases, retention periods, contracts and operational procedures to match their processing activities.

## Payments

Configure payment providers per tenant using the encrypted gateway configuration. Do not put production provider secrets in source control. M-Pesa callbacks and payment records remain tenant-scoped and idempotent.

## Procurement and operations

Approved purchase orders can move to received; receipt creates a supplier payable and a draft procurement expense. Tour costs feed the profitability endpoint. Corporate accounts enforce credit exposure and purchase-order requirements for corporate bookings.

## Background jobs

Jobs are stored in MongoDB with idempotency keys, attempts, exponential backoff and dead-letter (`dead`) state. The server worker processes supported jobs continuously. Monitor dead jobs and adapter failures through operational logs and the job collection.

## Deployment gate

Before production deployment, run the repository's server checks and tests from the `server` directory, confirm MongoDB indexes are reconciled, verify CORS origins, confirm backups/restores, and test payment callbacks using provider sandbox tooling. Live KRA/eTIMS and TRA/ODPC status remain external regulatory/provider prerequisites, not software claims.
