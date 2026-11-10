# Payments and M-Pesa

## Payment architecture

Payment initiation is handled by Express routes/controllers and provider services. Persisted `Payment` records are associated with tenant and booking/hospitality records; lifecycle services synchronize verified results into booking/payment status and accounting. The frontend starts a payment and later reads backend status. Supported code paths include M-Pesa, Stripe, PayPal, bank transfer and cash, with tenant configuration/feature controls. This does not mean every method is enabled for every tenant.

## M-Pesa STK Push path

1. The client calls the M-Pesa API wrapper from checkout/status UI.
2. `mpesaRoutes.js` applies tenant resolution, authentication, per-user/IP limiter, and booking preparation middleware.
3. `mpesaController.stkPush` checks tenant M-Pesa setting, booking existence, ownership/payment access, outstanding balance, requested amount and existing pending/processing attempts.
4. It validates phone before persisting a new attempt, resolves tenant gateway config, obtains OAuth token, then calls `initiateStkPush`.
5. `mpesaService.js` normalizes Kenyan phone input, caches OAuth token, creates Daraja password/timestamp and submits the STK payload. It treats malformed/uncertain provider responses distinctly in error codes.
6. Daraja later calls `/api/mpesa/callback`. Middleware validates shape and resolves the tenant/payment attempt. Callback handling/query verification then updates payment lifecycle state.
7. The client polls/retrieves status; a UI message saying the request was accepted is not a financial confirmation.

## Transaction and status behavior

The system uses payment/booking statuses such as pending, processing, completed/paid, failed, cancelled and refunded (exact fields differ by model). A pending provider request can be reused to avoid issuing duplicate STK prompts; an uncertain attempt without a checkout identifier is explicitly treated as unsafe to retry until reconciliation. Payment lifecycle code has idempotent completion checks; verify each callback/retry path and database uniqueness constraints before claiming global idempotency.

Provider callback arrival and successful provider response are separate events. A successful STK HTTP response means the provider accepted a prompt request. Only a verified callback or provider query result should move the financial record to completed/paid. Callback duplication, delayed delivery, provider timeout and reconciliation remain operational cases.

## Other methods

Stripe checkout/webhook, PayPal create/capture/webhook and manual bank/cash paths have separate routes and controllers. Manual bank transfer/cash require staff confirmation in relevant flows. PayPal checkout has currency/configuration gates noted in existing docs. Provider credentials and tenant settings determine availability. Do not describe generic card payment as available unless Stripe configuration and tenant gate are confirmed.

## Credentials and sandbox/production

Tenant M-Pesa config is encrypted and separates sandbox/production fields. Global fallback is disabled by default and forbidden in production by config validation. Callback host/environment settings are deployment concerns. OAuth validation does not make a financial transaction. The repository's dated readiness evidence reports that external sandbox/production completion is not established; no claim of real successful Daraja payment is made in this guide. Consult [MPESA_DARAJA_SANDBOX_READINESS.md](MPESA_DARAJA_SANDBOX_READINESS.md) for dated evidence.

## Testing limitations and safeguards

Unit tests can verify payload normalization, callback parsing, lifecycle transitions and replay behavior with mocks. They cannot prove Daraja accepted a payment, delivered callback, or settled funds. Use a sandbox tenant and public callback URL for end-to-end evidence, record provider identifiers safely, and reconcile transaction status before retrying an uncertain attempt. Never test real money without deliberate authorization and a controlled account.
