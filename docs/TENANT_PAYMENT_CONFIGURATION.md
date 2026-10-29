# Tenant payment configuration

Tenant administrators open **Admin Control Center → Finance & Insight → M-Pesa Configuration**. The page retains the M-Pesa heading and adds tabs for M-Pesa, Bank transfer, Card payments (Stripe), Cash, and PayPal. The separate **M-Pesa Transactions** entry remains the payment monitoring screen.

## Tenant controls and checkout

Payment method settings are saved to the authenticated tenant's `SystemSetting` record. Checkout obtains safe public settings for its resolved tenant. The server independently checks method availability when it creates a booking or payment, so a forged browser request cannot enable a disabled method. Changing settings does not alter historical payment records.

Bank transfer requires bank name, beneficiary name, a valid account number, and customer instructions. Branch and SWIFT/BIC are optional. The public checkout shows those payment details only for the tenant whose public settings were requested. A submitted bank transfer stays pending until an authorized tenant staff member confirms it in Payment Management.

Cash requires a collection location and customer instructions. Cash selection records a pending payment only. Authorized staff confirm receipt in Payment Management; an optional setting requires a receipt/reference. Confirmation uses the existing payment lifecycle and records the staff user, time, amount, currency, reference, and notes. It does not create a second ledger.

Stripe is available only when the tenant enables card payments and the deployment has a mode-matched `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`. Both are deployment-managed and never shown to tenant administrators. Validation checks account API connectivity only. Checkout attempts are persisted before creating a Stripe Checkout Session; paid, failed, asynchronous, and expired outcomes are accepted only from a recent signature-verified webhook or a server-side provider session verification. Browser redirects do not mark bookings paid.

PayPal has tenant-scoped Sandbox and Production client IDs, encrypted client secrets, webhook IDs, optional merchant IDs, server-created orders, server-side capture, provider signature verification, event deduplication, and payment lifecycle correlation. Configuration validation checks OAuth only and does not create an order. Checkout is withheld unless the selected environment has validated credentials, the tenant currency is supported by the PayPal REST API, and (for Production) a Sandbox capture plus verified webhook has been recorded. PayPal's current REST currency table does not include KES, so KES checkout is intentionally unavailable; no implicit currency conversion is performed. See the [official PayPal currency codes](https://developer.paypal.com/api/codes/currency/).

## M-Pesa / Daraja

M-Pesa credentials are managed by the existing tenant-scoped encrypted Payment Gateway configuration. Sandbox and Production credential slots remain separate. Configure the environment, shortcode, callback URL, Consumer Key, Consumer Secret, and Passkey required by the current Daraja STK Push integration. The callback URL must be a public HTTPS URL on the application's expected tenant payment callback route; sandbox callback hosts must comply with the validator's sandbox restrictions. Secret inputs are write-only: saving an empty secret field preserves its encrypted value.

The M-Pesa **Validate configuration** action decrypts the selected environment's stored credentials and requests a Daraja OAuth token at that environment's endpoint with a bounded timeout. It does not call STK Push or create a payment. A successful OAuth result verifies credentials/connectivity only, not a successful customer payment. Provider acceptance, callback integrity, tenant association, idempotent payment completion, and payment history must be verified separately in an authorized Sandbox lifecycle test before launch.

Payment credentials are encrypted at rest by the existing gateway model using `PAYMENT_CREDENTIAL_ENCRYPTION_KEY`. Do not rotate that deployment key without assessing and migrating existing encrypted values. Never put credentials in source, client code, documentation, or logs. Configure production callback and encryption variables through the authorized Render service environment, not through this page.

## Payment capability and launch status

| Method | Checkout/configuration | Confirmation and idempotency | Refund support | External verification |
| --- | --- | --- | --- | --- |
| M-Pesa | Tenant and environment scoped; OAuth validation; STK request records a pending attempt before provider submission | Daraja callback integrity middleware queries Daraja using the attempt's recorded environment; central completion and provider IDs are tenant-scoped/idempotent | Daraja TransactionReversal workflow; unrelated providers now fail closed | Not certified: no authorized Sandbox credentials or reachable test callback used in this run |
| Stripe card | Tenant enablement plus deployment-managed test/live key and webhook secret; server-created Checkout Session | Signed raw-body webhook and server session verification update central payment lifecycle; webhook IDs are deduplicated | Automated refund API is not implemented; use authorized reconciliation/manual workflow | Not certified: no test-mode credentials/account used |
| PayPal | Tenant and environment scoped encrypted credentials; server order/capture; supported-currency, OAuth and Sandbox lifecycle gates | Official provider webhook signature verification; validates order/capture amount, currency, merchant and tenant correlation; event IDs deduplicated | Automated refund API is not implemented; use authorized reconciliation/manual workflow | Not certified: no Sandbox credentials, buyer account, or webhook endpoint exercised |
| Bank transfer | Tenant-specific customer instructions and pending checkout record | Authorized tenant staff confirm receipt through shared lifecycle and audit metadata; submission/proof does not mark paid | Manual authorized refund/reconciliation | Internal workflow only; no external settlement verification |
| Cash | Tenant enablement, location and customer instructions; pending checkout record | Authorized staff confirm actual receipt; duplicate confirmation is rejected and confirmation is audited | Manual authorized refund/reconciliation | Not applicable; cash has no online connectivity status |

Configuration validation is not a payment test. Automated provider contract tests use controlled responses; they do not certify external provider access. Pesapal is present as a legacy provider enum but has no active checkout adapter and is not offered as a supported method. The shared admin refund endpoint currently supports automated Daraja reversals only and rejects other provider refunds rather than sending them to the wrong provider.

## Tests

For the 2026-10-29 implementation, the focused payment and callback-host run passed **7/7 test files**; the full backend suite passed **290 of 295 tests**, with **0 failures and 5 skipped opt-in database/integration tests**. `npm run check:all`, client lint, client production build, and `git diff --check` passed. This run did not use a provider credential, initiate a Sandbox payment, or verify a live callback/webhook. External Sandbox certification remains required for Daraja, PayPal, and Stripe.
