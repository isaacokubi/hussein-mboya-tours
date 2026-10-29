# M-Pesa / Daraja readiness

## Tenant configuration, environment isolation, and validation (2026-10-29)

Platform Admin navigation: **Dashboard → Companies / Tenants → select the tenant → M-Pesa settings**. Tenant Admin navigation: **Governance → Platform Controls → Payment gateways**. Both pages provide masked Consumer Key, Consumer Secret and Passkey inputs, shortcode, environment, callback URL, enable/disable controls, save states, and **Validate configuration**. Blank secret fields retain their already encrypted value; secrets are never returned in configuration responses.

Each tenant has separate sandbox and production credential, shortcode, and callback fields in the existing `PaymentGatewayConfig` record. Switching the active environment selects that environment's values and does not copy or overwrite the other environment's values. Existing single-environment records remain supported under their stored environment. The schema addition is backward-compatible and requires no migration. At runtime, the selected Daraja endpoint is fixed to `https://sandbox.safaricom.co.ke` or `https://api.safaricom.co.ke` by the server configuration; client-supplied URLs are not accepted.

Validation checks selected environment, required values, callback policy, and whether encrypted secrets can be decrypted, then makes a bounded OAuth-only request to that environment. It does not call STK Push, create a payment, or create a transaction. A successful result means Daraja returned an OAuth access token; it does not verify shortcode provisioning, passkey correctness for a charge, callback reachability/delivery, STK acceptance, or a completed payment. Failures return a timestamp, safe status, and sanitized message only. Both endpoints are authenticated, tenant/platform-admin scoped, and rate limited. No access token, authorization header, raw provider body, or credential value is returned or logged.

Callback values must be public HTTPS URLs ending in `/api/mpesa/callback`, with no embedded user info or fragment. Sandbox callback host must differ from the canonical production callback host. Configure `MPESA_PRODUCTION_CALLBACK_URL` in Render's authorized environment as the production callback URL; configure staging's sandbox callback on the staging deployment host. `PAYMENT_CREDENTIAL_ENCRYPTION_KEY` must be an independent 32+ character secret in Render. `MPESA_SANDBOX_BASE_URL` and `MPESA_PRODUCTION_BASE_URL` are constrained by the application to Safaricom's respective HTTPS hosts. Keep `ALLOW_GLOBAL_MPESA_FALLBACK=false` in production. Daraja credentials are tenant-scoped and should be entered by authorized tenant/platform administrators, not committed to deployment files. See `server/.env.example` and `render.yaml`; `sync:false` values require authorized deployment configuration. No production environment variable was changed by this work.

## Verification for the 2026-10-29 implementation

- Focused backend command `node --test tests/mpesaConfiguration.test.js tests/superAdminTenantMpesa.test.js tests/mpesaCallbackPayload.test.js tests/mpesaCallbackLifecycleContract.test.js`: exit 0, 4 test files passed, 0 failed, 0 skipped. Includes OAuth outcome sanitization, missing/invalid credentials, timeout/provider failure, environment endpoint separation, and no payment POST during validation.
- Full backend `npm test`: exit 0, 267 passed, 0 failed, 5 skipped. Skips are opt-in MongoDB integration tests; no production database was used. Initial sandbox execution failed the loopback health worker; rerun with approved loopback access passed. The suite's skipped cases do not constitute end-to-end database/provider acceptance.
- `npm run check:all` in `server`: exit 0. The production readiness contract explicitly leaves launch certification dependent on external deployment evidence.
- `npm run lint` in `client`: exit 0.
- `npm run build` in `client`: exit 0.
- `git diff --check`: rerun before commit; result recorded in the release update.

No live STK request, production credential check, database migration, or real Daraja transaction was made. A genuine sandbox payment/callback lifecycle, callback delivery checks, and authorized production OAuth verification remain external launch gates.

## Architecture

Customer booking, hospitality and subscription flows initiate STK Push through the server. Tenant payment gateway records are the primary credential source; the legacy environment configuration is available only when `ALLOW_GLOBAL_MPESA_FALLBACK=true` outside production. Credentials stored in tenant gateway records are encrypted. `server/config/mpesa.js` selects the Daraja endpoints from an explicit `sandbox` or `production` environment, and validates that each configured HTTPS base URL belongs to that environment. The browser never receives consumer credentials, passkeys, access tokens or the provider's raw STK response.

The server derives a booking's outstanding balance from its persisted booking/payment state and verifies ownership before initiating a charge. Payment records are associated with their booking and tenant. Daraja callbacks resolve the tenant from the checkout ID, are verified by querying Daraja, and flow through the existing payment lifecycle service. Callback completion checks provider result, amount and receipt; lifecycle transactions and unique tenant indexes protect repeated callback processing. Failed callbacks do not mark bookings paid. Status and query routes provide a way to inspect uncertain requests before retrying.

Refund/reversal support is present as a separate, tenant-resolved Daraja transaction-reversal workflow for eligible customer payment transactions. It requires the relevant Safaricom production permissions, initiator and security credential and is not implied by STK readiness.

## Environment configuration

Legacy/platform integration variables are optional and must not be confused with tenant gateway credentials:

| Variable | Purpose |
| --- | --- |
| `MPESA_CONSUMER_KEY` / `MPESA_CONSUMER_SECRET` | Daraja OAuth credentials |
| `MPESA_SHORTCODE` / `MPESA_PASSKEY` | STK shortcode and password generation |
| `MPESA_CALLBACK_URL` | Legacy/global callback URL used only with the explicitly allowed legacy fallback |
| `MPESA_PRODUCTION_CALLBACK_URL` | Production callback URL reference used to reject sandbox callbacks on the production host; configure this in each environment before saving sandbox settings |
| `MPESA_ENVIRONMENT` | Explicit `sandbox` (default) or `production` mode |
| `MPESA_SANDBOX_BASE_URL` | Sandbox Daraja HTTPS base; defaults to `https://sandbox.safaricom.co.ke` and is constrained to the sandbox host |
| `MPESA_PRODUCTION_BASE_URL` | Production Daraja HTTPS base; defaults to `https://api.safaricom.co.ke` and is constrained to the production host |
| `MPESA_INITIATOR_NAME` / `MPESA_SECURITY_CREDENTIAL` | Daraja transaction-reversal operations only |
| `ALLOW_GLOBAL_MPESA_FALLBACK` | Must remain `false` in production; tenant gateway setup is preferred |

Configure tenant credentials from Platform Admin → Dashboard → Companies / Tenants → **M-Pesa settings** for the selected tenant, or from a tenant administrator's Admin → Governance → Platform Controls → Payment gateways page for the current tenant. Set `MPESA_PRODUCTION_CALLBACK_URL` in the server environment so sandbox callback validation can reject the production host. Never place secrets in client environment variables, source files, tickets, logs or screenshots. Missing tenant credentials or callback configuration fails closed. Production tenant configuration must use production credentials issued for the production Daraja app and shortcode.

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
