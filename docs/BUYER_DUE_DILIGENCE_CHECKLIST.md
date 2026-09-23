# Buyer Due-Diligence Checklist

This checklist is for preparing Global Tours for a software/IP acquisition.

## 1. Ownership and IP

- [ ] Confirm who owns the source code.
- [ ] Identify every developer/contractor who contributed code.
- [ ] Locate employment or contractor agreements.
- [ ] Confirm written IP assignment where required.
- [ ] Identify third-party code and licences.
- [ ] Review open-source dependencies and licence obligations.
- [ ] Identify stock images, fonts, icons, templates and other licensed assets.
- [ ] Identify trademarks, product names and logos.
- [ ] Identify domains and determine whether they are included.
- [ ] Identify any code copied or adapted from external repositories and verify licence compliance.
- [ ] Prepare an IP schedule for the definitive sale agreement.

## 2. Source repository

- [ ] Confirm default branch.
- [ ] Confirm Git history is preserved.
- [ ] Remove secrets and credentials from history before buyer handover where necessary.
- [ ] Confirm environment templates are complete.
- [ ] Confirm build instructions.
- [ ] Confirm test commands.
- [ ] Confirm deployment instructions.
- [ ] Confirm no personal development machine is required to operate the system.

## 3. Infrastructure

- [ ] Firebase/Firestore project ownership and transfer requirements.
- [ ] Hosting/deployment provider.
- [ ] Domain/DNS ownership.
- [ ] Storage provider.
- [ ] Email/SMTP provider.
- [ ] Cloudinary account if used.
- [ ] Payment-provider accounts.
- [ ] KRA/eTIMS credentials are transferred only through an appropriate secure/legal process.
- [ ] Backup configuration.
- [ ] Monitoring and logs.
- [ ] CI/CD configuration.

## 4. Security

- [ ] Rotate all production credentials before or at handover.
- [ ] Confirm JWT and encryption-key handling.
- [ ] Confirm secrets are environment-managed.
- [ ] Review Git history for accidentally committed secrets.
- [ ] Review admin accounts.
- [ ] Review MFA configuration.
- [ ] Review webhook authentication.
- [ ] Review tenant-isolation controls.
- [ ] Run dependency/security checks.
- [ ] Produce a short security findings report.

## 5. Product

- [ ] Customer management
- [ ] Tours
- [ ] Destinations
- [ ] Bookings
- [ ] Payments
- [ ] Invoices
- [ ] Finance/accounting
- [ ] Supplier management
- [ ] Purchase orders
- [ ] Profitability
- [ ] Corporate accounts
- [ ] Hotels/accommodation
- [ ] Airport transfers
- [ ] Website/API integrations
- [ ] Roles and permissions
- [ ] Compliance
- [ ] Reporting
- [ ] Notifications/email

For each module, record: **working / partially working / requires buyer testing / requires development**.

## 6. Payments

- [ ] M-Pesa credentials excluded from source control.
- [ ] M-Pesa sandbox flow tested.
- [ ] Callback handling tested.
- [ ] Idempotency tested.
- [ ] Failed/expired payment behavior tested.
- [ ] Stripe configuration documented.
- [ ] Refund behavior documented.
- [ ] Payment-to-booking-to-invoice reconciliation tested.

## 7. eTIMS

- [ ] Current KRA integration specification reviewed.
- [ ] OSCU/VSCU route confirmed with buyer's tax/compliance team.
- [ ] Sandbox credentials/configuration obtained.
- [ ] Branch ID confirmed.
- [ ] Device serial confirmed.
- [ ] Item codes mapped.
- [ ] Item classification codes mapped.
- [ ] Tax codes mapped.
- [ ] Invoice submission tested.
- [ ] Error handling tested.
- [ ] Retry behavior tested.
- [ ] Credit-note requirements tested.
- [ ] KRA certification/vetting route confirmed.
- [ ] Production invoice acceptance evidenced before commercial claims are made.

## 8. Deployment acceptance

- [ ] Fresh environment can be provisioned from documentation.
- [ ] Backend starts cleanly.
- [ ] Frontend builds cleanly.
- [ ] Database/Firestore configuration is reproducible.
- [ ] Required indexes/configuration are documented.
- [ ] Health checks work.
- [ ] Backups are configured.
- [ ] Restore procedure is documented.
- [ ] Buyer can deploy without seller's personal computer.

## 9. Commercial handover

- [ ] Buyer receives product overview.
- [ ] Buyer receives roadmap.
- [ ] Buyer receives known-issues register.
- [ ] Buyer receives architecture documentation.
- [ ] Buyer receives deployment guide.
- [ ] Buyer receives integration documentation.
- [ ] Buyer receives test evidence.
- [ ] Buyer receives agreed source/IP assets.
- [ ] Buyer acceptance criteria are signed off.
- [ ] Transition-support period is defined.

## 10. Red flags to resolve before sale

- Unclear IP ownership
- Hard-coded secrets
- Personal cloud accounts
- Personal payment accounts
- Undocumented third-party licences
- Unverified production claims
- Unverified KRA certification claims
- Customer data transferred without a lawful basis
- Domains/accounts that cannot be transferred
- Dependencies with restrictive licences
