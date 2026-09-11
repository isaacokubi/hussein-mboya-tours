# Global Tours — Step 3 Production Release Runbook

This runbook is the final release control for the buyer-ready multi-tenant SaaS platform.

## 1. Tenant onboarding

- Register a company through the public onboarding flow.
- Provision the tenant organization, administrator, subscription and audit event atomically from the application workflow.
- Confirm tenant slug uniqueness and tenant-scoped administrator identity.
- Confirm the administrator cannot access another tenant's data.
- Keep platform SuperAdmin provisioning separate from tenant administration.

## 2. Subscription lifecycle

- Supported plans: starter, professional, business and enterprise.
- Trial lifecycle is time bounded and automatically expires.
- Paid periods have explicit start/end dates and renewal timestamps.
- M-Pesa subscription payments remain pending until provider confirmation.
- Provider references must be persisted for reconciliation and duplicate protection.
- A subscription callback must be idempotent before activating service.
- Suspended/expired tenants must not regain paid access without a successful renewal.

## 3. Branding and domains

- Tenant branding is stored independently: logo, favicon, colors, legal name and website.
- Custom domains are unique and sparse at the database level.
- Production custom-domain activation requires DNS/HTTPS verification before traffic is switched.
- Never trust an arbitrary Host header as a tenant selector; resolve only verified domains or explicit tenant context.

## 4. External website capture

- Existing website connectors use publishable browser keys only.
- Secret integration keys remain server-side.
- Origins are explicitly allow-listed.
- Lead/booking events are tenant-scoped and persisted with source/landing attribution.
- Duplicate/replayed events must be safely ignored or reconciled using the integration event identity.
- Production connectors must be tested from the customer's real domain before go-live.

## 5. Kenya compliance

- KRA PIN and VAT profile are tenant-specific.
- VAT treatment is determined by the tenant tax regime/rules rather than a universal hard-coded rate.
- eTIMS configuration stores environment/device/branch references and encrypted credential references.
- eTIMS submissions require idempotency, response persistence, retry/reconciliation and credit/debit-note handling.
- TRA and ODPC records require status and expiry tracking; expired licences/registrations are not considered compliant.
- Privacy requests, retention, DPA review and audit evidence remain tenant-scoped.

## 6. Payments and finance

- M-Pesa/Card/Bank payment state transitions are server-authoritative.
- Provider callbacks are idempotent and reconciled against tenant-scoped payment records.
- Refunds, failed payments, chargebacks and credit/debit notes must leave an auditable financial trail.
- Subscription payments are kept separate from customer booking revenue.
- Never log payment credentials, tokens, full card data or sensitive customer data.

## 7. Operations and inventory

- Booking, room, room-block and transfer capacity updates use concurrency-safe guards.
- Cancellation releases inventory only when the reservation state transition succeeds.
- Driver/guide assignment and operational status changes remain tenant-scoped.
- Background workers must be retry-safe and idempotent.

## 8. Security gates

Production must have:

- HTTPS-only public origins.
- Strong JWT and credential-encryption keys.
- Development authentication fallbacks disabled.
- Per-tenant payment credentials where required.
- MFA for privileged platform roles and step-up protection for sensitive finance operations.
- Rate limits on authentication, public integrations, payment initiation and webhook endpoints.
- Audit logging for privileged and financial actions.
- No committed secrets or private keys.

## 9. Backups and disaster recovery

Before production launch, the infrastructure owner must verify:

1. Managed MongoDB backups are enabled.
2. Point-in-time recovery is enabled where the selected MongoDB service supports it.
3. Backup retention meets the commercial SLA.
4. A restore has been performed into an isolated environment.
5. Tenant isolation was verified after restore.
6. Recovery time and recovery point objectives have been measured and recorded.
7. Restore credentials are kept outside the repository.

The application readiness gate intentionally requires explicit production evidence for backup verification and restore testing; code alone cannot prove that an external backup system is working.

## 10. Monitoring and incident response

Production must expose and monitor:

- Health/readiness endpoint.
- API error rate and latency.
- Database connectivity and query failures.
- Background-job failures/retries.
- Payment callback failures and reconciliation backlog.
- eTIMS submission failures.
- Authentication failures and rate-limit events.
- Queue depth and worker liveness.

Alerts must route to an operational owner. Logs must be structured and must not contain secrets or unnecessary personal/payment information.

## 11. Deployment and rollback

Recommended controlled sequence:

1. Merge only when CI and the three-phase release gate are green.
2. Deploy to staging.
3. Run production-like acceptance tests with sandbox payment/eTIMS integrations.
4. Verify migrations and tenant-index reconciliation.
5. Deploy production with the deployment provider disconnected from automatic GitHub deployment until release approval.
6. Run health/readiness checks.
7. Verify one tenant onboarding, one booking, one payment callback and one external website capture flow.
8. Monitor the release window.
9. If acceptance fails, roll back to the last known-good release and preserve logs/audit evidence.

## 12. Final buyer acceptance

A buyer-ready tenant must be able to:

- create and configure its company;
- invite/manage authorized staff;
- configure tours, destinations, hospitality and transfers;
- receive website leads/bookings automatically;
- accept and reconcile supported payments;
- issue tax-compliant invoices through the configured eTIMS workflow;
- manage Kenyan compliance records and expiry reminders;
- manage customers, suppliers and operational assignments;
- view financial/operational reports;
- export required business records;
- configure branding and an approved custom domain;
- use audit, privacy and data-retention controls;
- recover from an operational failure using the documented backup/restore process.

## External-control boundary

The repository implements the application-side controls and release gates. KRA/eTIMS certification, payment-provider production credentials, DNS ownership, MongoDB backup service configuration, monitoring-provider configuration and legal/compliance approvals require the buyer/platform operator to complete the corresponding external onboarding and provide evidence before production is declared fully live.
