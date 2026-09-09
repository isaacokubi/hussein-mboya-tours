# Global Tours Production Go-Live Checklist

This checklist is the final release gate for the Kenyan commercial deployment. The application code is designed to fail closed when production evidence has not been verified.

## Phase 1 — Application reliability and data governance

- [x] Tenant isolation and tenant-aware financial/operational records.
- [x] Durable background-job processing with idempotency and retries.
- [x] Signed, encrypted, SSRF-protected outbound webhooks with delivery history.
- [x] Booking and payment webhook event dispatch.
- [x] Kenyan VAT/tax calculation and finance lifecycle foundations.
- [x] eTIMS adapter boundary and durable invoice/note submission jobs.
- [x] Privacy-request workflow and compliance records.
- [x] Conservative automated retention for completed/dead jobs, webhook deliveries and completed privacy requests.
- [x] Application health endpoints and administrative system-health tooling.
- [x] Database backup administration.

### Retention policy

The automated retention sweep intentionally does **not** delete bookings, invoices, payments, tax records, accounting journals, supplier payables, corporate balances or other financial evidence. Those records require an explicit legal/accounting retention policy before any future archival implementation.

## Phase 2 — Production evidence and external integrations

Before setting `NODE_ENV=production`, the deployment owner must verify all of the following in the actual production environment:

- [ ] `PRODUCTION_BACKUP_VERIFIED=true` — automated backup destination and retention verified.
- [ ] `PRODUCTION_RESTORE_TESTED=true` — a real restore has been completed and validated.
- [ ] `PRODUCTION_MONITORING_VERIFIED=true` — uptime/error/latency monitoring and alert delivery verified.
- [ ] `PRODUCTION_PAYMENT_VERIFIED=true` — tenant-scoped M-Pesa and any enabled card/payment providers have passed a real end-to-end transaction/refund/reconciliation test.
- [ ] `PRODUCTION_ETIMS_VERIFIED=true` — the applicable KRA/eTIMS onboarding/certification and the configured certified adapter have passed a production test submission.
- [ ] `PRODUCTION_WEBHOOKS_VERIFIED=true` — at least one signed webhook delivery has been received and verified by the consuming system.

The release gate rejects production mode when any evidence flag is missing. These checks deliberately cannot be faked by application code because they represent external infrastructure, payment-provider and KRA/eTIMS verification.

## Production security settings

- `ALLOW_SINGLE_TENANT_DEV_FALLBACK=false`
- `ALLOW_GLOBAL_MPESA_FALLBACK=false`
- `MFA_DEV_MODE=false`
- `CLIENT_URL` and `CLIENT_ORIGINS` use HTTPS only.
- `PLATFORM_HOST` is the real production hostname.
- `JWT_SECRET`, `WEBHOOK_SECRET_KEY`, `PAYMENT_CREDENTIAL_ENCRYPTION_KEY` and `ETIMS_CREDENTIAL_ENCRYPTION_KEY` are strong, environment-specific secrets.
- Real credentials are stored only in the deployment secret manager/environment, never in Git.

## Kenyan go-live requirements

The platform provides the software controls for TRA/licensing records, ODPC/privacy records, KRA tax configuration and eTIMS onboarding. Regulatory registrations, certificates, provider contracts and KRA certification remain external legal/operational actions and must be attached to the tenant compliance record before go-live.

## Deployment order

1. Configure production secrets and tenant-specific payment/eTIMS credentials.
2. Configure HTTPS hostname and allowed origins.
3. Configure off-site backups and monitoring.
4. Run backup restore test.
5. Run tenant-isolated payment, refund and reconciliation tests.
6. Run eTIMS production verification where applicable.
7. Run signed webhook verification.
8. Set all six `PRODUCTION_*_VERIFIED=true` values.
9. Run `PRODUCTION_READINESS_RUNTIME=true npm run check:production`.
10. Run the full release workflow and only then enable production traffic.

Do not mark an evidence flag true unless the corresponding external test was actually completed.
