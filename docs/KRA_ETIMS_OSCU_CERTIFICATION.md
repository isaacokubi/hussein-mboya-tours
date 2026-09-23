# KRA eTIMS OSCU certification package

## Status

This repository now contains a KRA OSCU transport layer and invoice mapping path. It is **not** certified by KRA and must not be enabled for production until KRA onboarding, sandbox testing and certification are completed.

KRA's current system-to-system guidance says OSCU is for taxpayers whose invoicing system operates online. The current KRA OSCU specification documents the sandbox endpoint as `https://etims-api-sbx.kra.go.ke/etims-api` and production as `https://etims-api.kra.go.ke/etims-api`. KRA's process requires development/testing in sandbox followed by certification. 

## Application choice for this tours platform

- eTIMS solution: **OSCU**
- Integration model: **self-integration only if the business satisfies KRA's self-integrator requirements; otherwise use a KRA-verified third-party integrator**
- Currency: **KES**
- Main branch: normally `00`, but use the branch ID actually assigned/confirmed by KRA
- Device serial: a stable production identifier; do not generate a new one on every deployment
- Environment: `sandbox` until KRA approves production

KRA describes OSCU as the system-to-system option for online invoicing systems. 

## Implemented software path

```
Booking
  -> Invoice
  -> durable eTIMS job
  -> KRA OSCU adapter
  -> /selectInitOsdcInfo (initialization)
  -> /saveTrnsSalesOsdc (sales invoice)
  -> persist KRA response
  -> receipt/control evidence on Invoice
```

The implementation keeps the KRA communication key encrypted in `EtimsCredential.cmcKeyEncrypted`. It never exposes the key to the React client.

## OSCU initialization

KRA's published OSCU specification requires:

- KRA PIN
- two-character branch ID
- device serial number

The repository provides:

`server/scripts/initializeEtimsOscu.js`

Run it from the server environment after setting the required secret/runtime variables:

```
TENANT_ID=<actual tenant id>
ETIMS_ENVIRONMENT=sandbox
ETIMS_KRA_PIN=<actual taxpayer KRA PIN>
ETIMS_OSCU_BRANCH_ID=00
ETIMS_OSCU_DEVICE_SERIAL=<stable device serial>
```

The script calls KRA's initialization endpoint and stores the returned communication key encrypted. Do not paste the communication key into GitHub, logs, tickets or frontend code.

## Invoice mapping

The KRA OSCU invoice path now maps the application's invoice into the KRA sales structure, including:

- taxpayer PIN and branch
- taxpayer invoice number
- KRA invoice sequence number
- buyer PIN/name
- sale/receipt/payment codes
- sale date and confirmation timestamp
- tax buckets A-E
- total taxable amount, tax and invoice total
- receipt information
- item lines

The repository intentionally requires each invoice line to have:

- `itemCode`
- `itemClassCode`

before a direct KRA submission succeeds.

Those values must come from KRA's current code/catalogue process; the application must not invent them.

## Required catalogue work before the first successful sandbox invoice

1. Retrieve KRA code lists.
2. Retrieve item classification codes.
3. Register the tour services/items required by the TIS.
4. Store the resulting KRA item code and classification code against the product/tour service.
5. Map the taxpayer's actual tax treatment to KRA tax codes.
6. Test a single invoice.
7. Test validation failures and retry behavior.
8. Test credit-note behavior using the same eTIMS solution.
9. Capture the successful KRA response and receipt/QR evidence.
10. Submit the certification package to KRA.

## Documents to prepare for KRA

For a self-integrating taxpayer, KRA's current eTIMS material lists:

- eTIMS Bio Data Form for VSCU/OSCU self-integrating taxpayers
- Tax Compliance Certificate
- proof of at least three qualified technical staff handling system development/system administration
- technology architecture documentation
- Trader Invoicing System integration software/documentation

If the applicant is a third-party integrator rather than the taxpayer self-integrating, KRA lists additional business registration, CR12, permit, director/partner identification and related documentation. Do not submit a third-party vendor package unless that is actually the chosen certification route.

## Architecture document content

The submission architecture should identify:

- taxpayer/legal entity
- KRA PIN
- OSCU solution
- branch/device identity
- production and sandbox separation
- frontend does not communicate directly with KRA
- backend/worker performs KRA communication
- encrypted storage of KRA communication credentials
- invoice outbox/job queue
- idempotency and retry controls
- KRA response/audit persistence
- access control and audit logging
- backup/recovery
- customer invoice/receipt evidence flow

## Production gate

Do not set:

`PRODUCTION_ETIMS_VERIFIED=true`

until all of these have actually happened:

- KRA onboarding completed
- OSCU authorization/initialization completed
- sandbox tests passed
- required item/tax mappings verified
- certification/vetting completed
- production credentials/device configured
- a real production test invoice was accepted by KRA
- returned receipt/control/QR evidence was stored and verified

KRA's official integration guidance says certification is a prerequisite to commencement of integration/production use.

## Official references

- KRA eTIMS system-to-system integration guidance
- KRA OSCU specification document
- KRA OSCU/VSCU step-by-step guide
- KRA eTIMS Bio Data Form for self-integrating taxpayers

Keep the exact documents used for the certification submission in the project compliance folder, but never commit taxpayer secrets or communication keys.
