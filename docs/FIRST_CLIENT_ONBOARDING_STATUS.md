# First client onboarding — operational status

Last reviewed: 2026-11-14  
Production application: https://hussein-mboya-tours.vercel.app  
Production API: https://hussein-mboya-tours.onrender.com  
Production source revision: 8bc3a9b5fd5722225a3352ecf14e7d85cab87cee

## Current release state

The application code is deployed to Vercel and Render from the same merged `main` revision. The platform does not require a customer-owned domain to begin a controlled pilot: use the Vercel production URL until the platform owner registers a domain. Do not add unowned domains or invent tenant subdomains.

The first client must be onboarded as a real tenant through the authenticated SuperAdmin tenant workflow. Do not reuse demo tenant data or seed scripts for a live client.

## Work completed in the application

- Tenant isolation, role permissions, booking and payment lifecycle controls.
- Tenant-specific encrypted M-Pesa sandbox and production configuration.
- Daraja OAuth-only credential validation, callback routing and callback/payment reconciliation safeguards.
- Tenant-scoped invoices, VAT/tax configuration, eTIMS submission queue and certified-adapter boundary.
- Compliance records for KRA, TRA, ODPC, privacy, retention and DPA review.
- Backup/restore workflows and monitoring/release checks in the repository.
- The readiness rules now require a verified KRA PIN, verified VAT status where VAT registration applies, approved compliance records and a current TRA licence. A submitted application or pending validation is not treated as approval.

## External items that must be completed for the real client

These require the client's/provider's actual onboarding and cannot be generated safely by the application team:

1. **Client legal identity and KRA:** obtain the client's correct legal name, KRA PIN and tax obligations. Record the PIN and verified status only after checking the official evidence. If VAT registered, record the VAT PIN and mark it verified only after validation.
2. **Tourism licensing:** obtain applicable current TRA licence/permit evidence, including reference, authority, issue date and expiry date. Confirm whether ODPC registration applies and attach the official evidence.
3. **M-Pesa:** the client must supply their own Daraja app Consumer Key/Secret, shortcode/till/paybill and matching passkey for the chosen environment. Configure the tenant's sandbox credentials first, with the exact public HTTPS callback `https://hussein-mboya-tours.onrender.com/api/mpesa/callback`. Run OAuth validation, then a client-authorized low-value sandbox STK test to a controlled handset, confirm callback delivery and persisted transaction, and reconcile the payment. Only after provider production onboarding should production credentials be entered and production validation run. Never test real money without explicit amount, recipient and purpose authorization.
4. **eTIMS:** determine the client's KRA-required solution and complete KRA onboarding. Supply the certified OSCU/VSCU integration provider/adapter endpoint and credentials. Configure the tenant's KRA PIN, solution, device and branch identifiers. Test a real sandbox invoice submission and confirm the official invoice number, receipt/unique register reference and QR response. Do not mark an invoice synced on an adapter acknowledgement without the required official references.
5. **Email:** verify a sender domain/email with Resend, set the production API key and sender identity, and send/receive a test booking confirmation and password/security email. Do not use the Resend development sender for a real client.
6. **Backups and recovery:** confirm Atlas backup/PITR policy and retention, retain encrypted off-site backup evidence, complete an isolated restore and record measured RPO/RTO.
7. **Monitoring and support:** confirm production alerts reach a named operator; exercise health, error-rate, queue and payment/eTIMS failure alerts. Record the escalation contact and support hours.
8. **Client acceptance:** complete a real tenant admin login, configure tours/prices, create a test customer and booking, verify booking emails, payment callback/reconciliation, invoice/tax workflow, staff roles, data exports and mobile/desktop layouts.

## Safe order of execution

1. Collect the client's legal/business and provider onboarding evidence.
2. Create the tenant and named tenant administrator through SuperAdmin.
3. Configure company identity, currency/timezone, staff roles and catalogue.
4. Complete KRA/TRA/ODPC/privacy evidence and tenant tax settings.
5. Configure M-Pesa sandbox and complete the end-to-end callback test.
6. Configure the certified eTIMS adapter and complete invoice submission verification.
7. Verify transactional email, backups, restore, monitoring and alert routing.
8. Run client acceptance on the production URL using clearly identified low-value test data.
9. Obtain client sign-off before enabling live payment methods and accepting real bookings.

## Go-live rule

A successful application build, a healthy API, OAuth token validation, a mocked test, or a sandbox STK prompt is not proof of settled funds or legal/tax compliance. Keep a payment method disabled until the matching provider test and callback reconciliation have passed. Keep eTIMS submission disabled until the client's certified solution is configured and its official response references are verified. Record dated evidence for each external step; do not set production evidence flags to true by assumption.
