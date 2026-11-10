# `server/middleware/resolveMpesaCallbackTenant.js` — recover tenant for provider callback

Daraja's callback identifies the attempt by checkout ID, not by the user's JWT or browser tenant header. This middleware uses that persisted ID to restore the tenant before downstream Mongoose operations.

## Algorithm

- `callbackCheckoutId` checks the supported casing variants under `Body.stkCallback` and trims the result.
- If no ID exists, middleware calls `next()`; the preceding payload validator normally rejects malformed callbacks, and integrity verification remains the fail-closed gate.
- It builds a filter for both current and legacy payment field spellings.
- `runWithTenant({bypass:true}, ...)` performs a narrow cross-tenant lookup of the `Payment`; if no payment exists, it checks `SubscriptionPayment`. Only `tenantId` is selected and the query is lean.
- If a tenant is found, `setTenantContext` and `req.tenantId` establish the callback's request scope, then `next()` continues.
- Errors go to Express error middleware.

## AsyncLocalStorage detail

The source comment calls out a subtle Express issue: `next()` is callback-based and is not awaited by the middleware. Returning `runWithTenant(context, next)` can allow the AsyncLocalStorage scope to finish before later async controller work. The middleware therefore resolves the tenant in a short bypass scope, explicitly sets request-scoped context, and then continues. This behavior is security-sensitive; do not simplify it without tests that assert the downstream callback inherits the intended tenant.

## Security boundaries

The bypass lookup must remain limited to checkout ID → tenant ID. It should not return payment details or mutate records before callback integrity verification. Unknown checkout IDs do not get a guessed/default tenant. Test IDs belonging to two tenants and prove each callback can only reach the matching tenant's payment.

**Related:** [`mpesaCallbackIntegrity.js`](mpesa-callback-integrity.md), [tenant middleware](tenant-middleware.md), [`SubscriptionPayment` model](../database/models/SubscriptionPayment.md).
