# Tenant payment configuration

Tenant administrators open **Admin Control Center → Finance & Insight → M-Pesa Configuration**. The page retains the M-Pesa heading and adds tabs for M-Pesa, Bank transfer, Card payments (Stripe), Cash, and PayPal. The separate **M-Pesa Transactions** entry remains the payment monitoring screen.

## Tenant controls and checkout

Payment method settings are saved to the authenticated tenant's `SystemSetting` record. Checkout obtains safe public settings for its resolved tenant. The server independently checks method availability when it creates a booking or payment, so a forged browser request cannot enable a disabled method. Changing settings does not alter historical payment records.

Bank transfer requires bank name, beneficiary name, a valid account number, and customer instructions. Branch and SWIFT/BIC are optional. The public checkout shows those payment details only for the tenant whose public settings were requested. A submitted bank transfer stays pending until an authorized tenant staff member confirms it in Payment Management.

Cash requires a collection location and customer instructions. Cash selection records a pending payment only. Authorized staff confirm receipt in Payment Management; an optional setting requires a receipt/reference. Confirmation uses the existing payment lifecycle and records the staff user, time, amount, currency, reference, and notes. It does not create a second ledger.

Stripe is available only when the tenant enables card payments and the deployment has `STRIPE_SECRET_KEY`. That secret is deployment-managed and is not shown to tenant administrators. “Validate Stripe connectivity” checks Stripe account metadata only; it does not create or capture a payment. Actual card payment status is determined by the existing Stripe Checkout verification flow.

PayPal is intentionally unavailable. This repository has no complete PayPal order creation, capture, and verified webhook lifecycle. The application will not advertise or accept PayPal based only on an enable flag.

## M-Pesa / Daraja

M-Pesa credentials are managed by the existing tenant-scoped encrypted Payment Gateway configuration. Sandbox and Production credential slots remain separate. Configure the environment, shortcode, callback URL, Consumer Key, Consumer Secret, and Passkey required by the current Daraja STK Push integration. The callback URL must be a public HTTPS URL on the application's expected tenant payment callback route; sandbox callback hosts must comply with the validator's sandbox restrictions. Secret inputs are write-only: saving an empty secret field preserves its encrypted value.

The M-Pesa **Validate configuration** action decrypts the selected environment's stored credentials and requests a Daraja OAuth token at that environment's endpoint with a bounded timeout. It does not call STK Push or create a payment. A successful OAuth result verifies credentials/connectivity only, not a successful customer payment. Provider acceptance, callback integrity, tenant association, idempotent payment completion, and payment history must be verified separately in an authorized Sandbox lifecycle test before launch.

Payment credentials are encrypted at rest by the existing gateway model using `PAYMENT_CREDENTIAL_ENCRYPTION_KEY`. Do not rotate that deployment key without assessing and migrating existing encrypted values. Never put credentials in source, client code, documentation, or logs. Configure production callback and encryption variables through the authorized Render service environment, not through this page.

## Tests

For the 2026-10-29 implementation, focused payment contract tests passed **3/3**; the full backend suite passed **281 of 286 tests**, with **0 failures and 5 skipped opt-in database/integration tests**. `npm run check:all`, client lint, client production build, and `git diff --check` passed. Real Daraja/Stripe connectivity and payment callbacks require authorized provider credentials and a reachable isolated Sandbox callback and are not established by these automated checks.
