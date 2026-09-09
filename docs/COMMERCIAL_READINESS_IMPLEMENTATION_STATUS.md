# Commercial Readiness Implementation Status

## Implemented in this build

### Existing website automatic booking capture
- Tenant-scoped secret API keys for server-to-server integrations.
- Tenant-scoped public site keys for browser integrations.
- Key revocation and usage tracking.
- Optional allowed-origin restrictions.
- Integration permissions (`booking:create`, `customer:create`, `tour:read`).
- Public tour catalogue endpoint.
- Browser connector script that binds to `data-hmt-booking-form` or `data-hmt-autocapture="true"`.
- Automatic capture of common booking/customer fields.
- Capture of other named non-sensitive fields in `metadata.formFields`.
- Explicit exclusion of password/payment-card/CVV/CVC/token/security fields.
- Customer deduplication by tenant + phone/email.
- External booking idempotency to prevent duplicate bookings on retries/double submits.
- Server-side tour pricing and capacity validation.
- Automatic Customer + Booking + Invoice creation.
- Integration event/audit trail.
- Admin settings UI for creating/listing/revoking website connectors.

### Finance and Kenyan tax foundation
- Tenant-aware Kenyan VAT/tax calculation engine with inclusive/exclusive handling and tax categories.
- Tenant-scoped invoices, expenses, credit/debit notes and payment lifecycle/reconciliation.
- Encrypted tenant payment gateway credentials and provider routing foundation, including M-Pesa, Stripe, PayPal, Pesapal and bank configuration.
- Corporate account credit exposure and purchase-order controls.
- Configurable tenant tax rules and tax administration UI.
- Automatic double-entry posting for issued invoices, completed payments and approved/paid expenses.
- Supplier payable accruals and settlements now post to Accounts Payable/Bank with idempotent source identity.
- Issued credit/debit notes now post balancing revenue/tax/receivable entries.
- Completed payment events synchronize invoice amount paid, balance, status and payment reference.
- Idempotent operational-to-GL posting using tenant/source transaction identity with duplicate-race handling.
- General ledger, trial balance, profit/loss and balance-sheet-style reporting UI.
- Payment-link lifecycle with server-authoritative outstanding-balance validation, expiry/cancellation and tenant-safe public lookup.
- Public payment-link page routes customers into the authenticated secure checkout without exposing customer PII.
- Finance workspace exposes payment-link creation, link status/cancellation and credit/debit-note draft/issue/cancel workflows.

### Supplier, procurement and tour profitability
- Tenant-scoped suppliers and purchase orders with calculated line/tax totals and lifecycle transitions.
- Receiving a purchase order creates a supplier payable and draft procurement expense idempotently.
- Tenant-scoped tour costing and profitability reporting.
- Supplier payable payment tracking with overpayment protection.
- Corporate balance reconciliation from bookings and completed payments.
- Booking resource guard prevents same-date double assignment of guides, drivers and vehicles.
- Group/corporate booking fields including group reference, corporate account, PIN, PO number, payment terms, billing and rooming-list reference.
- Actionable operations dashboard for supplier, corporate-account, purchase-order, tour-cost and payable workflows.

### Compliance and privacy
- Tenant compliance records for TRA licensing, ODPC registration, privacy policy, retention, DPA review, breach response, KRA tax profile and eTIMS onboarding.
- Compliance expiry/review dashboard data.
- Data-subject request workflow for access, correction, deletion, portability, objection and restriction.
- Tenant-safe compliance and privacy APIs.
- Production Go-Live Readiness Center surfaced in the finance workspace for deployment, compliance, payment, backup and monitoring prerequisites.

### eTIMS integration boundary
- Durable Mongo-backed invoice submission jobs with idempotency, retries, exponential backoff and dead state.
- Provider-neutral certified-adapter boundary for eTIMS/OSCU/VSCU.
- Manual and scheduled invoice queueing.
- Credit/debit note submission queue with the same durable retry/adapter boundary.
- Invoice and credit/debit-note response/status fields for eTIMS references, receipts, unique-register identifiers and QR data where returned by the certified adapter.
- The application does not fabricate KRA receipts or claim KRA certification without the actual certified integration.

### Reliability and observability
- Request correlation IDs exposed as `X-Request-ID`.
- Production error responses include the correlation ID.
- Background worker starts with the application and shuts down cleanly.
- Finance lifecycle source records use tenant-scoped unique indexes and duplicate handling.
- Tenant index reconciliation now includes payment links and all current finance/operations/compliance collections.
- Production readiness check validates the complete finance lifecycle file set.

## Batch 1 completion boundary

The application-side Batch 1 commercial finance scope is implemented end-to-end across backend APIs, accounting, tax/eTIMS adapter boundaries, supplier/AP lifecycle, invoice synchronization, payment links, credit/debit notes and the finance frontend.

The following remain external production prerequisites and are intentionally not represented as completed by source code:

1. KRA/eTIMS onboarding, certification/vetting and live certified-provider credentials.
2. Applicable TRA licences/permits and their regulatory issuance.
3. ODPC registration and final legal/privacy governance approval.
4. Real tenant payment-provider production credentials and provider callback activation.
5. Production backup infrastructure, restore drills and monitoring-service configuration.
6. Final end-to-end tests against the target production deployment and real payment/eTIMS sandbox or production endpoints.

## External production prerequisites

1. Complete the applicable KRA/eTIMS onboarding, certification/vetting and live provider configuration.
2. Complete applicable TRA licences/permits and record them in the compliance centre.
3. Complete the tenant's ODPC/privacy governance work: notices, lawful bases, retention schedule, processor contracts, access/deletion procedures and breach procedures.
4. Configure each tenant's real payment-provider credentials and production callbacks.
5. Configure backups, restore drills, deployment secrets and production monitoring.
6. Run the final repository checks and end-to-end tests in the target deployment environment.

These are provider/regulatory/deployment prerequisites, not missing application screens or fabricated integration claims.

## Integration principle

The system cannot and should not silently read arbitrary third-party websites. The website owner must authorize the integration by installing the connector, calling the REST API, or configuring a server-side integration. Once installed, booking data flows automatically into the tenant's CRM/booking/finance workflow without manual re-entry.
