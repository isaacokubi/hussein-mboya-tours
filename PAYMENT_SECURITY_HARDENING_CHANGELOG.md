# Payment Security Hardening Changelog

Date: 2026-08-17

## Financial controls strengthened

- M-Pesa STK amount is now calculated from the server-side booking balance; client `amount` is ignored.
- M-Pesa callbacks require a real provider-reported amount and receipt and must exactly match the server-authoritative amount due.
- Central payment completion rejects payments larger than the remaining booking balance.
- Admin/manual completion cannot mark M-Pesa or Stripe payments as paid; those providers require their own verification/callback lifecycle.
- Direct `refunded` status escalation is blocked; refunds must use the refund workflow.
- Generic payment creation creates only a pending intent and cannot accept a client-supplied amount.
- Custom-tour booking requires ownership, an approved/quoted state, and a positive server-approved quote.
- Completed provider transaction references receive a database uniqueness constraint to reduce duplicate-credit/replay risk.
- Payment amounts are constrained to finite non-negative values with an upper safety bound.

## Validation performed

- All server `.js` files pass `node --check`.
- Frontend build could not be executed in the isolated repair workspace because Vite dependencies were not available after the dependency installation timed out. Run `npm install` followed by `npm run build` after merging.

## Production testing still required

Use provider sandbox/test environments to verify successful payment, wrong amount, duplicate callback, callback replay, cancelled payment, partial payment, refund, and bank-transfer reconciliation. Never test with real funds during deployment validation.
