# M-Pesa route and service

## Route: `server/routes/mpesaRoutes.js`

The router resolves tenant first. STK push aliases (`/stkpush` and `/mpesa`) require authentication, pass a payment-initiation rate limiter, and run booking preparation before the controller. Status, query and verify reads require authentication. The callback has no user JWT because it is server-to-server; instead it validates payload, resolves the tenant/payment context and verifies callback integrity before the subscription callback handler. Refund result/timeout callbacks use refund-specific tenant resolution. The route path is mounted under both `/api/mpesa` and `/api/payments` in the consolidated router, creating aliases.

## Service: `server/services/mpesaService.js`

The service imports tenant-context enforcement, settings, Axios, crypto hashing and tenant gateway URL/config. An Axios instance imposes a 30-second default; a token cache avoids repeated OAuth requests. `normalizePhoneNumber` requires tenant context, strips whitespace, normalizes `+254` and local `07/01` forms, then accepts only Kenyan mobile pattern `254[17]` plus eight digits. Invalid input is exposed as 400 with a stable code.

`generateAccessToken` obtains active tenant config/URLs, requires consumer credentials, builds a SHA-256 cache key from credential pair and auth URL (the raw secret is not used as the Map key), returns a token with at least 30 seconds of validity, otherwise makes Basic-auth GET. Missing token or provider failure becomes a generic auth error; logs only provider HTTP status. Cache expiry uses provider `expires_in` with a fallback.

`generateTimestamp` builds Daraja's `YYYYMMDDhhmmss` string from local JavaScript date parts. `generatePassword` base64-encodes shortcode + passkey + timestamp and explicitly requires config. `initiateStkPush` validates phone/amount/booking ID, loads tenant config, gets normalized phone/token/timestamp/password, creates the Daraja request body, and posts to the tenant STK URL. A valid result must include both request IDs and response code 0. Network/provider errors are mapped to safe codes distinguishing rejected responses from uncertain transport outcomes; callers are told to check status before retrying.

## Financial trust boundary

The helper submits a request; it does not itself mark a booking paid. The callback/status controller and lifecycle service must verify provider evidence before state transition. Test payload construction separately from real provider acceptance and callback delivery. Tenant/environment selection and callback integrity are security-critical.
