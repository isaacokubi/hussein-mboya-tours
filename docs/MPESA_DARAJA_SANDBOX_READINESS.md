# M-Pesa / Daraja readiness

## Tenant configuration, environment isolation, and validation (2026-10-29)

Platform Admin navigation: **Dashboard → Companies / Tenants → select the tenant → M-Pesa settings**. Tenant Admin navigation: **Governance → Platform Controls → Payment gateways**. Both pages provide masked Consumer Key, Consumer Secret and Passkey inputs, shortcode, environment, callback URL, enable/disable controls, save states, and **Validate configuration**. Blank secret fields retain their already encrypted value; secrets are never returned in configuration responses.

Each tenant has separate sandbox and production credential, shortcode, and callback fields in the existing `PaymentGatewayConfig` record. Switching the active environment selects that environment's values and does not copy or overwrite the other environment's values. Existing single-environment records remain supported under their stored environment. The schema addition is backward-compatible and requires no migration. At runtime, the selected Daraja endpoint is fixed to `https://sandbox.safaricom.co.ke` or `https://api.safaricom.co.ke` by the server configuration; client-supplied URLs are not accepted.

Validation checks selected environment, required values, callback policy, and whether encrypted secrets can be decrypted, then makes a bounded OAuth-only request to that environment. It does not call STK Push, create a payment, or create a transaction. A successful result means Daraja returned an OAuth access token; it does not verify shortcode provisioning, passkey correctness for a charge, callback reachability/delivery, STK acceptance, or a completed payment. Failures return a timestamp, safe status, and sanitized message only. Both endpoints are authenticated, tenant/platform-admin scoped, and rate limited. No access token, authorization header, raw provider body, or credential value is returned or logged.

Callback values must be public HTTPS URLs ending in `/api/mpesa/callback`, with no embedded user info, query, fragment, or nonstandard port. A Sandbox callback may use an explicitly configured `MPESA_SANDBOX_CALLBACK_URL`; when that is unset, the canonical `MPESA_PRODUCTION_CALLBACK_URL` is the explicit shared-host reference. The current Render configuration has a single API service in `render.yaml`; read-only Render inspection also found two API services for this repository on `main`, both deploying the same production commit, with no metadata identifying either as Sandbox. The second URL is therefore not assumed to be a Sandbox service. Shared callback delivery is supported by the route architecture: callback lookup resolves the tenant/payment attempt, and provider verification uses that persisted attempt's environment-specific credentials and Daraja endpoint. This does not constitute a Sandbox payment test or deployment/database isolation. Configure `MPESA_PRODUCTION_CALLBACK_URL` in Render; only configure `MPESA_SANDBOX_CALLBACK_URL` after an intended, separate Sandbox API host exists. `PAYMENT_CREDENTIAL_ENCRYPTION_KEY` must be an independent 32+ character secret in Render. `MPESA_SANDBOX_BASE_URL` and `MPESA_PRODUCTION_BASE_URL` are constrained by the application to Safaricom's respective HTTPS hosts. Keep `ALLOW_GLOBAL_MPESA_FALLBACK=false` in production. Daraja credentials are tenant-scoped and should be entered by authorized tenant/platform administrators, not committed to deployment files. See `server/.env.example` and `render.yaml`; `sync:false` values require authorized deployment configuration. No production environment variable was changed by this work.

## Verification for the 2026-10-29 implementation

- Focused backend command `node --test tests/mpesaConfiguration.test.js tests/superAdminTenantMpesa.test.js tests/mpesaCallbackPayload.test.js tests/mpesaCallbackLifecycleContract.test.js`: exit 0, 4 test files passed, 0 failed, 0 skipped. Includes OAuth outcome sanitization, missing/invalid credentials, timeout/provider failure, environment endpoint separation, and no payment POST during validation.
- Full backend `npm test`: exit 0, 267 passed, 0 failed, 5 skipped. Skips are opt-in MongoDB integration tests; no production database was used. Initial sandbox execution failed the loopback health worker; rerun with approved loopback access passed. The suite's skipped cases do not constitute end-to-end database/provider acceptance.
- `npm run check:all` in `server`: exit 0. The production readiness contract explicitly leaves launch certification dependent on external deployment evidence.
- `npm run lint` in `client`: exit 0.
- `npm run build` in `client`: exit 0.
- `git diff --check`: rerun before commit; result recorded in the release update.

No live STK request, production credential check, database migration, or real Daraja transaction was made. A genuine sandbox payment/callback lifecycle, callback delivery checks, and authorized production OAuth verification remain external launch gates.

## Sandbox callback host correction (2026-10-29)

The previous validator rejected a Sandbox callback solely because its hostname matched `MPESA_PRODUCTION_CALLBACK_URL`. That did not match the deployment architecture: `render.yaml` defines one API service, and read-only Render inspection found two services for this repository, both on `main` and both running the same production commit; neither service metadata identifies a Sandbox role. The second service URL is not treated as a Sandbox host. A shared API callback is supported because callback handling resolves the tenant and pending attempt, then verifies the result with the tenant's credentials and the `providerEnvironment` persisted on that attempt.

The validator now permits the canonical shared host when no dedicated Sandbox callback is configured. A dedicated Sandbox deployment must set `MPESA_SANDBOX_CALLBACK_URL`; a tenant's Sandbox callback URL must then match that host. The Production callback remains separately referenced by `MPESA_PRODUCTION_CALLBACK_URL`. The callback parser trims whitespace and rejects non-HTTPS URLs, wrong routes, URL user-info/query/fragment, nonstandard ports, localhost/local names, and literal IP hosts. Environment credential slots and Daraja endpoints remain separate.

Read-only production verification on 2026-10-29: the primary Render API health endpoint returned HTTP 200; a malformed JSON POST to `/api/mpesa/callback` returned HTTP 400 from callback validation, confirming the POST route is reachable without creating a payment. The second Render service's health request timed out; its purpose is unknown and it was not assumed to be Sandbox. The Render CLI did not expose runtime environment variable presence, so `MPESA_PRODUCTION_CALLBACK_URL` and optional `MPESA_SANDBOX_CALLBACK_URL` values were not inspected. No configuration, credential, or deployment was changed. No OAuth request, STK Push, valid callback, or payment lifecycle was run.

Callback-host tests passed **7/7 focused test files** after this correction, including the shared host, dedicated host, production host rejection for a configured separate Sandbox host, HTTPS/path/port/whitespace checks, and environment-specific callback resolution. The final full backend suite passed **290/295 tests, with 0 failures and 5 skipped opt-in database/integration tests**; `npm run check:all`, client lint, client build, and `git diff --check` passed. The shared production callback is not suitable for sandbox lifecycle testing unless sandbox payment records in the deployment database are explicitly acceptable. Prefer a separately configured isolated Sandbox API and database for end-to-end tests.

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
| `MPESA_PRODUCTION_CALLBACK_URL` | Canonical production callback route; also the shared-host reference when no separate Sandbox route is deployed |
| `MPESA_SANDBOX_CALLBACK_URL` | Optional explicit callback route for a separate Sandbox API deployment; omit it to use the shared callback architecture |
| `MPESA_ENVIRONMENT` | Explicit `sandbox` (default) or `production` mode |
| `MPESA_SANDBOX_BASE_URL` | Sandbox Daraja HTTPS base; defaults to `https://sandbox.safaricom.co.ke` and is constrained to the sandbox host |
| `MPESA_PRODUCTION_BASE_URL` | Production Daraja HTTPS base; defaults to `https://api.safaricom.co.ke` and is constrained to the production host |
| `MPESA_INITIATOR_NAME` / `MPESA_SECURITY_CREDENTIAL` | Daraja transaction-reversal operations only |
| `ALLOW_GLOBAL_MPESA_FALLBACK` | Must remain `false` in production; tenant gateway setup is preferred |

Configure tenant credentials from Platform Admin → Dashboard → Companies / Tenants → **M-Pesa settings** for the selected tenant, or from a tenant administrator's Admin → Governance → Platform Controls → Payment gateways page for the current tenant. Set `MPESA_PRODUCTION_CALLBACK_URL` in the server environment. Configure `MPESA_SANDBOX_CALLBACK_URL` only when a separately deployed Sandbox API is intended; the callback URL saved on the tenant must match that configured callback host. With no separate host configured, the validator allows the current production API host because the callback handler verifies the attempt using its pinned sandbox/production environment and isolated tenant credential slot. This shared route may write sandbox payment attempts into the deployment's configured database; do not use the production application to run Sandbox transactions unless that data impact is explicitly accepted. Never place secrets in client environment variables, source files, tickets, logs or screenshots. Missing tenant credentials or callback configuration fails closed. Production tenant configuration must use production credentials issued for the production Daraja app and shortcode.

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
