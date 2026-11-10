# Troubleshooting

| Symptom | Likely cause | Diagnosis | Resolution |
|---|---|---|---|
| API starts but routes return 503 | Mongo disconnected or critical startup phase incomplete | Request `/api/live` and `/api/health`; inspect server startup logs | Correct `MONGODB_URI`/network access; wait for DB/index startup retry |
| Server exits on environment validation | Missing required variables, invalid production origin/secret/host, unsafe fallback | Read startup error; compare `server/.env.example` and `config/env.js` | Set valid environment-specific values; do not weaken production checks |
| Browser CORS error | Origin not configured, tenant domain unresolved, or HTTP origin in production | Browser network console; inspect CORS config and tenant domain records | Add exact HTTPS origin/tenant domain using deployment configuration |
| Login 401 | Credentials/token expired/wrong tenant/account inactive | Inspect response/request ID; verify account status and tenant host/header | Sign in against correct tenant; reset credentials through supported flow |
| Login 403 for tenant access | Requested tenant doesn't match account or account has no tenant | Inspect selected tenant and authenticated account scope | Use correct tenant URL; repair account assignment through authorized admin |
| Payment remains pending | Callback delayed/unreachable or provider has not verified result | Check payment record identifiers, provider status query, callback logs | Reconcile provider state before retry; do not infer completion from STK acceptance |
| New M-Pesa request blocked | Existing pending/processing attempt is reused or uncertain | Find tenant-scoped Payment record and checkout identifiers | Query/reconcile attempt; only retry after safe resolution |
| Provider credentials fail | Wrong environment/tenant config, encrypted value/key mismatch, missing permission | Use admin validation/OAuth check and safe server error metadata | Correct tenant/environment-specific secret config; never expose values in logs |
| Production frontend build fails | Missing/invalid VITE API URL or invalid API path | Read Vite validation error; inspect build environment | Set absolute HTTPS API base ending `/api` |
| Image upload unavailable | Cloudinary credentials missing or service unavailable | Inspect Cloudinary config and API response | Configure all required Cloudinary variables; retry after provider availability |
| Tenant sees wrong/no catalog | Host/tenant slug/header mismatch or feature/data scope | Inspect resolved tenant/request ID and scoped records | Correct tenant domain/slug and verify records belong to that tenant |

## Debugging approach

Reproduce with a non-production account, capture method/path/status/request ID, inspect browser network payload without sharing secrets, correlate server logs, then trace route → middleware → controller → service → model. For provider issues, distinguish local validation, provider acceptance, callback delivery, provider verification and persisted final state. Avoid printing passwords, tokens, callback bodies or secret values.
