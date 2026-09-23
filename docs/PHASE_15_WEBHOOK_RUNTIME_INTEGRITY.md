# Phase 15 — Webhook Runtime Integrity

## Scope

Phase 15 hardens the outbound webhook delivery runtime so queued jobs remain explicitly bound to their tenant before a webhook is delivered.

## Runtime gap found

Webhook jobs already carried a tenant in the queue record, but the delivery payload did not carry that identity and `deliverWebhookJob` loaded the webhook only by webhook ID. That left a cross-tenant safety gap if a queued payload were corrupted, mis-associated or manually constructed with another tenant's webhook ID.

## Changes

- `queueWebhookEvent` now stores `tenantId` in the webhook delivery payload.
- The developer webhook test-delivery path now stores the current tenant in its queued payload.
- `deliverWebhookJob` requires tenant and webhook identity.
- Delivery now rejects a webhook when its stored tenant does not match the queued job tenant.
- Existing HTTPS, SSRF pinning, HMAC signing, delivery history and idempotency controls remain in place.
- The persistent test queue and release gate now include a Phase 15 contract.

## Stored automated test

Run from `server/`:

```bash
node --test tests/webhookRuntimeIntegrity.test.js
```

The test is stored for later execution and CI. It does not claim that live webhook delivery has been verified.

## External acceptance boundary

`PRODUCTION_WEBHOOKS_VERIFIED=true` must remain an evidence flag only after a real signed webhook reaches an approved consuming system and the consumer verifies the signature, event ID and tenant/event payload.

The external test should also record the delivery attempt, HTTP result and receiving-system evidence without storing webhook secrets.

## Exit condition

Phase 15 is complete when the tenant-binding runtime fix, automated contract, stored test queue entry, release-gate entry and this phase document are committed to `main`. Live webhook-provider/consumer acceptance remains external.
