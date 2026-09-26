# M-Pesa / Daraja readiness

## Architecture

Customer booking, hospitality and subscription flows initiate STK Push through the server. Tenant payment gateway records are the primary credential source; the legacy environment configuration is available only when `ALLOW_GLOBAL_MPESA_FALLBACK=true` outside production. Credentials stored in tenant gateway records are encrypted. `server/config/mpesa.js` selects the Daraja endpoints from an explicit `sandbox` or `production` environment, and validates that each configured HTTPS base URL belongs to that environment. The browser never receives consumer credentials, passkeys, access tokens or the provider's raw STK response.

The server derives a booking's outstanding balance from its persisted booking/payment state and verifies ownership before initiating a charge. Payment records are associated with their booking and tenant. Daraja callbacks resolve the tenant from the checkout ID, are verified by querying Daraja, and flow through the existing payment lifecycle service. Callback completion checks provider result, amount and receipt; lifecycle transactions and unique tenant indexes protect repeated callback processing. Failed callbacks do not mark bookings paid. Status and query routes provide a way to inspect uncertain requests before retrying.

Refund/reversal support is present as a separate, tenant-resolved B2C reversal workflow. It requires the relevant Safaricom production permissions, initiator and security credential and is not implied by STK readiness.

## Environment configuration

Legacy/platform integration variables are optional and must not be confused with tenant gateway credentials:

| Variable | Purpose |
| --- | --- |
| `MPESA_CONSUMER_KEY` / `MPESA_CONSUMER_SECRET` | Daraja OAuth credentials |
| `MPESA_SHORTCODE` / `MPESA_PASSKEY` | STK shortcode and password generation |
| `MPESA_CALLBACK_URL` | Public callback fallback for tenant gateway records; must be reachable by Safaricom |
| `MPESA_ENVIRONMENT` | Explicit `sandbox` (default) or `production` mode |
| `MPESA_SANDBOX_BASE_URL` | Sandbox Daraja HTTPS base; defaults to `https://sandbox.safaricom.co.ke` and is constrained to the sandbox host |
| `MPESA_PRODUCTION_BASE_URL` | Production Daraja HTTPS base; defaults to `https://api.safaricom.co.ke` and is constrained to the production host |
| `MPESA_INITIATOR_NAME` / `MPESA_SECURITY_CREDENTIAL` | Reversal/B2C operations only |
| `ALLOW_GLOBAL_MPESA_FALLBACK` | Must remain `false` in production; tenant gateway setup is preferred |

Configure the required credentials and callback URL in the server environment or the tenant's Admin → Payment Gateways configuration. Never place secrets in client environment variables, source files, tickets, logs or screenshots. Missing tenant credentials or callback configuration fails closed. Production tenant configuration must use production credentials issued for the production Daraja app and shortcode.

## Sandbox setup and tests

1. Obtain sandbox consumer credentials, shortcode and passkey from the Safaricom Daraja portal and configure them through the server's approved secret settings or tenant gateway UI.
2. Set the environment to `sandbox` and register a public HTTPS callback URL that routes to `/api/mpesa/callback`.
3. Start an eligible test booking and use a Safaricom sandbox test MSISDN. Confirm initiation, provider callback, payment record, booking balance and receipt in the application.
4. Run `cd server && npm test` for backend tests, including the M-Pesa configuration and callback lifecycle contracts.

The automated suite uses local mocks/contracts and does not make charges. A sandbox STK attempt and callback cannot be claimed from this checkout unless the configured gateway has been invoked and the public callback has been observed. Do not use a production customer, production payment or production database for sandbox verification. Any database-backed integration evidence must use a dedicated disposable cloud/Atlas test database and must never target the production `husseindb` database.

## Production transition checklist

- Complete Safaricom production onboarding and obtain production consumer key/secret, shortcode, passkey and any reversal credentials externally.
- Set each tenant gateway environment to `production` with that tenant's production-issued credentials; verify all callback URLs are public HTTPS endpoints.
- Keep global fallback disabled. Confirm production requests resolve only to `api.safaricom.co.ke` and sandbox requests only to `sandbox.safaricom.co.ke`.
- Exercise a low-value authorized production transaction with finance approval, observe the callback, receipt, booking/payment state and ledger reconciliation, then document evidence without secrets.
- Verify provider timeout/reconciliation, duplicate callback replay, failed/cancelled response, refunds/reversals and support escalation procedures.

Codex can maintain endpoint selection, validation, idempotent lifecycle code, automated mocks/contracts, documentation and safe configuration checks. Safaricom portal access, production onboarding, issuance of production credentials, approved callback registration, provider account permissions and a publicly reachable callback test require an authorized operator and Safaricom access. Production Daraja is not READY until those external checks pass.
