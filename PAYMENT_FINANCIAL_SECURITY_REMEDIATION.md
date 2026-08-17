# Payment & Booking Financial Security Remediation

## Scope

Reviewed M-Pesa STK/callback processing, Stripe Checkout, bank-transfer submission and verification, booking creation, payment lifecycle/idempotency, refund boundaries, payment status mutation, and custom-tour booking authorization.

## High-risk issues corrected

1. **Client-controlled M-Pesa amount** — STK requests previously accepted `req.body.amount` and could request a different amount than the booking balance. The server now derives the amount exclusively from the booking.
2. **M-Pesa callback amount fallback** — a missing callback amount previously fell back to the stored requested amount. The callback now requires a valid provider amount and rejects mismatches against the server-authoritative balance.
3. **Overpayment/double-credit risk** — the payment lifecycle now rejects any payment greater than the remaining booking balance instead of silently clamping the balance.
4. **Admin status escalation** — authorized staff could directly set any payment to `completed`, then the booking was marked paid without provider verification. Completion now goes through the central lifecycle and is limited to manually reconciled BANK/CASH records; Stripe/M-Pesa must use their provider verification flows.
5. **Generic refund status escalation** — direct status changes to `refunded` are blocked; refunds must use the refund workflow.
6. **Custom-tour authorization** — booking creation now requires the custom-tour request to belong to the authenticated customer, be approved/quoted, and have a valid server-approved quote.
7. **Duplicate completed provider reference** — added a compound partial unique index on provider + transaction reference for completed payments.
8. **Payment amount validation** — payment amounts are constrained to finite, non-negative values within a defined upper bound.

## Important operational requirement

The M-Pesa callback URL must remain public to Safaricom but should only accept valid Daraja callback payloads. Provider credentials and Stripe secrets must remain server-side environment variables and must never be committed to Git.

## Verification

Run backend syntax checks and the frontend production build after merging. For production, also test real provider sandbox flows for: successful payment, wrong amount, duplicate callback, replayed callback, cancelled/failed payment, partial/refund flow, and bank transfer manual verification.
