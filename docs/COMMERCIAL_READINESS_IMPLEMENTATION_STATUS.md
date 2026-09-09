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

### Invoice reliability fixes
- Invoice customer reference corrected to the Customer model.
- Guest invoices can exist without a User account.
- Added optional invoice User reference.
- Fixed invoice creation to use booking financial values instead of a non-existent `amount` field.
- Normal bookings now attempt idempotent invoice creation automatically.
- External website bookings receive an invoice automatically.

### Privacy hardening
- New Customer records default to `marketingConsent=false`.
- Browser connector requires an explicit marketing-consent checkbox to set consent true.
- Sensitive payment/auth fields are excluded from generic form capture.

## Still required before production sale

1. KRA eTIMS/OSCU/VSCU certification and live integration.
2. Tenant-specific M-Pesa/Pesapal/Stripe credential vault and provider routing.
3. Full Kenyan tax engine (VAT categories, tax-inclusive/exclusive rules, credit/debit notes).
4. Accounting ledger, receivables/payables and bank/M-Pesa reconciliation expansion.
5. Supplier/procurement module.
6. Tour costing and profitability engine.
7. TRA/ODPC compliance workflow and document centre.
8. Corporate/group booking and rooming-list workflows.
9. Durable background jobs/queues and production observability.
10. Full payment, tenant-isolation and end-to-end test suites.

## Integration principle

The system cannot and should not silently read arbitrary third-party websites. The website owner must authorize the integration by installing the connector, calling the REST API, or configuring a server-side integration. Once installed, booking data flows automatically into the tenant's CRM/booking/finance workflow without manual re-entry.